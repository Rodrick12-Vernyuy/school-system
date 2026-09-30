const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/payrollController');

const router = express.Router();
const HR_STAFF = ['staff', 'admin', 'super_admin'];

router.get('/config', verifyToken, requireRole(...HR_STAFF), ctrl.getConfig);
router.put('/config', verifyToken, requireRole('admin', 'super_admin'), ctrl.updateConfig);
router.post('/run', verifyToken, requireRole(...HR_STAFF), [body('employeeId').isUUID(), body('payPeriod').matches(/^\d{4}-\d{2}$/)], validate, ctrl.runPayroll);
router.get('/employee/:employeeId', verifyToken, ctrl.listForEmployee);

module.exports = router;
