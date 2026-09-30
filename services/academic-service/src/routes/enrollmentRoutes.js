const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/enrollmentController');

const router = express.Router();

router.post(
  '/',
  verifyToken,
  [body('studentId').isUUID(), body('courseId').isUUID()],
  validate,
  ctrl.enroll
);
router.get('/student/:studentId', verifyToken, ctrl.listForStudent);
router.patch('/:id/drop', verifyToken, ctrl.drop);

module.exports = router;
