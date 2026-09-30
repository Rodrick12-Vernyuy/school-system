const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/examController');

const router = express.Router();
const STAFF = ['staff', 'admin', 'super_admin'];

router.post(
  '/',
  verifyToken,
  requireRole(...STAFF),
  [body('courseId').isUUID(), body('examDate').isISO8601(), body('startTime').notEmpty(), body('endTime').notEmpty(), body('room').notEmpty()],
  validate,
  ctrl.schedule
);
router.get('/', verifyToken, ctrl.list);

module.exports = router;
