process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

const {
  hashPassword, comparePassword, signAccessToken, verifyAccessToken, hashToken,
} = require('../src/services/authService');

describe('authService', () => {
  test('hashPassword never returns the plaintext', async () => {
    const hash = await hashPassword('Sup3rSecret!');
    expect(hash).not.toBe('Sup3rSecret!');
    expect(hash.length).toBeGreaterThan(20);
  });

  test('comparePassword validates a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('Sup3rSecret!');
    await expect(comparePassword('Sup3rSecret!', hash)).resolves.toBe(true);
    await expect(comparePassword('WrongPassword', hash)).resolves.toBe(false);
  });

  test('signAccessToken embeds role and is verifiable', () => {
    const token = signAccessToken({ id: 'u1', email: 'a@b.com', role: 'student', full_name: 'A B' });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('u1');
    expect(decoded.role).toBe('student');
  });

  test('hashToken is deterministic and never returns the raw token', () => {
    const h1 = hashToken('some-refresh-token');
    const h2 = hashToken('some-refresh-token');
    expect(h1).toBe(h2);
    expect(h1).not.toBe('some-refresh-token');
  });
});
