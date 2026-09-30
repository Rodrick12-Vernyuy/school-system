const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/performanceController');

const router = express.Router();
const HR_STAFF = ['staff', 'admin', 'super_admin'];

router.post('/', verifyToken, requireRole(...HR_STAFF), [body('employeeId').isUUID(), body('score').isFloat({ min: 0, max: 10 })], validate, ctrl.record);
router.get('/employee/:employeeId', verifyToken, ctrl.listForEmployee);

module.exports = router;
