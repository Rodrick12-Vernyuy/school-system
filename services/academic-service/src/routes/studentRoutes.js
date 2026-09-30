const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/studentController');

const router = express.Router();
const STAFF = ['staff', 'admin', 'super_admin'];

router.use(verifyToken);

router.get('/', requireRole(...STAFF), ctrl.list);
// Must be registered before "/:id" so Express does not treat "me" as an id.
router.get('/me', requireRole('student'), ctrl.getMe);
router.get('/:id', requireRole(...STAFF, 'student'), ctrl.getById);
router.get('/:id/risk-status', requireRole(...STAFF, 'student'), ctrl.riskStatus);
router.post(
  '/',
  requireRole(...STAFF),
  [body('studentNumber').notEmpty(), body('fullName').notEmpty(), body('email').isEmail()],
  validate,
  ctrl.create
);
router.put('/:id', requireRole(...STAFF), ctrl.update);
router.delete('/:id', requireRole('admin', 'super_admin'), ctrl.deactivate);

module.exports = router;
