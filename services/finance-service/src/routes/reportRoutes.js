const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

const router = express.Router();
const FINANCE_STAFF = ['staff', 'admin', 'super_admin'];

router.get('/daily-summary', verifyToken, requireRole(...FINANCE_STAFF), ctrl.dailySummary);
router.get('/monthly-summary', verifyToken, requireRole(...FINANCE_STAFF), ctrl.monthlySummary);
router.get('/outstanding-fees', verifyToken, requireRole(...FINANCE_STAFF), ctrl.outstandingFees);
router.get('/expenses', verifyToken, requireRole(...FINANCE_STAFF), ctrl.expenseReport);

module.exports = router;
