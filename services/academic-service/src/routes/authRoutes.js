const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('password must be at least 8 characters long');

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Self-service registration (always creates a student account)
 *     tags: [Auth]
 */
router.post(
  '/register',
  [body('email').isEmail().normalizeEmail(), passwordRule, body('fullName').trim().notEmpty()],
  validate,
  ctrl.register
);

/**
 * @openapi
 * /auth/register-staff:
 *   post:
 *     summary: Create an admin/staff/super_admin account (requires admin/super_admin)
 *     tags: [Auth]
 */
router.post(
  '/register-staff',
  verifyToken,
  requireRole('admin', 'super_admin'),
  [body('email').isEmail().normalizeEmail(), passwordRule, body('fullName').trim().notEmpty(), body('role').isIn(['admin', 'staff', 'super_admin'])],
  validate,
  ctrl.registerStaff
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 */
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access/refresh token pair
 *     tags: [Auth]
 */
router.post('/refresh', [body('refreshToken').notEmpty()], validate, ctrl.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 */
router.post('/logout', ctrl.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Return the currently authenticated user
 *     tags: [Auth]
 */
router.get('/me', verifyToken, ctrl.me);

module.exports = router;
