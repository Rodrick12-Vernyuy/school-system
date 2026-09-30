// Auth endpoints: register, login, refresh, logout.
//
// Design decision (documented for the exam defense): self-service public
// registration only ever creates a 'student' account. Admin/Staff/Super Admin
// accounts must be created by an authenticated Super Admin or Admin via
// POST /auth/register-staff - this prevents privilege escalation through the
// public registration endpoint (a Broken Access Control safeguard).
const pool = require('../config/db');
const {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../services/authService');

const MAX_ATTEMPTS = parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5', 10);
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10);

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, hashToken(refreshToken), expiresAt]
  );
  return { accessToken, refreshToken };
}

function sanitizeUser(user) {
  return { id: user.id, email: user.email, role: user.role, fullName: user.full_name };
}

async function register(req, res, next) {
  try {
    const { email, password, fullName } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const passwordHash = await hashPassword(password);

    // Self-registration always creates BOTH the login (users) and a linked
    // academic profile (students) in one transaction, so a newly registered
    // student can immediately see their (empty) dashboard, enroll in
    // courses, etc. without a separate admin step. The student_number is
    // generated here; an admin/staff member can edit it later via
    // PUT /students/:id if the institution uses a different numbering
    // scheme.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, full_name)
         VALUES ($1, $2, 'student', $3) RETURNING id, email, role, full_name`,
        [email, passwordHash, fullName]
      );
      const user = userResult.rows[0];
      const studentNumber = `STU-${Date.now().toString(36).toUpperCase()}`;
      await client.query(
        `INSERT INTO students (user_id, student_number, full_name, email) VALUES ($1, $2, $3, $4)`,
        [user.id, studentNumber, fullName, email]
      );
      await client.query('COMMIT');
      const tokens = await issueTokenPair(user);
      return res.status(201).json({ user: sanitizeUser(user), ...tokens });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return next(err);
  }
}

async function registerStaff(req, res, next) {
  try {
    const { email, password, fullName, role } = req.body;
    if (!['admin', 'staff', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'role must be one of admin, staff, super_admin' });
    }
    // Only a super_admin may create another super_admin or admin account.
    if ((role === 'super_admin' || role === 'admin') && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only a super_admin can create admin/super_admin accounts' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4) RETURNING id, email, role, full_name`,
      [email, passwordHash, role, fullName]
    );
    return res.status(201).json({ user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      // Same generic message as a wrong password, so we do not leak which
      // emails are registered (defense against user enumeration).
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = result.rows[0];

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(423).json({ error: `Account locked. Try again in ${minutesLeft} minute(s).` });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      const attempts = user.failed_login_attempts + 1;
      const shouldLock = attempts >= MAX_ATTEMPTS;
      await pool.query(
        `UPDATE users SET failed_login_attempts = $1,
         locked_until = $2, updated_at = now() WHERE id = $3`,
        [
          shouldLock ? 0 : attempts,
          shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null,
          user.id,
        ]
      );
      if (shouldLock) {
        return res.status(423).json({ error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Successful login resets the failed-attempt counter.
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = now() WHERE id = $1',
      [user.id]
    );

    const tokens = await issueTokenPair(user);
    return res.json({ user: sanitizeUser(user), ...tokens });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL',
      [decoded.sub, tokenHash]
    );
    if (stored.rowCount === 0) {
      return res.status(401).json({ error: 'Refresh token has been revoked or is unknown' });
    }
    if (new Date(stored.rows[0].expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.sub]);
    if (userResult.rowCount === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ error: 'Account no longer available' });
    }
    const user = userResult.rows[0];

    // Rotate the refresh token: revoke the old one, issue a new pair.
    await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [stored.rows[0].id]);
    const tokens = await issueTokenPair(user);
    return res.json({ user: sanitizeUser(user), ...tokens });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
        [hashToken(refreshToken)]
      );
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, registerStaff, login, refresh, logout, me };
