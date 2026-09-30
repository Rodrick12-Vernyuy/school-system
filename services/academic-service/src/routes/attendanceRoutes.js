const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

const router = express.Router();
const STAFF = ['staff', 'admin', 'super_admin'];

router.post(
  '/',
  verifyToken,
  requireRole(...STAFF),
  [body('studentId').isUUID(), body('courseId').isUUID(), body('sessionDate').isISO8601(), body('status').isIn(['present', 'absent', 'late'])],
  validate,
  ctrl.record
);
router.get('/student/:studentId', verifyToken, ctrl.listForStudent);

module.exports = router;
