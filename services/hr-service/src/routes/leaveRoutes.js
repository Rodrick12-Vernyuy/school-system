const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/leaveController');

const router = express.Router();
const HR_STAFF = ['staff', 'admin', 'super_admin'];

router.post('/', verifyToken, [body('employeeId').isUUID(), body('startDate').isISO8601(), body('endDate').isISO8601()], validate, ctrl.submit);
router.get('/pending', verifyToken, requireRole(...HR_STAFF), ctrl.listPending);
router.get('/employee/:employeeId', verifyToken, ctrl.listForEmployee);
router.patch('/:id', verifyToken, requireRole(...HR_STAFF), [body('decision').isIn(['approved', 'rejected'])], validate, ctrl.review);

module.exports = router;
