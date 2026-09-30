const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

const router = express.Router();
const HR_STAFF = ['staff', 'admin', 'super_admin'];

router.post('/check-in', verifyToken, [body('qrToken').notEmpty()], validate, ctrl.checkIn);
router.get('/', verifyToken, requireRole(...HR_STAFF), ctrl.listForDate);

module.exports = router;
