const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/invoiceController');

const router = express.Router();
const STAFF = ['staff', 'admin', 'super_admin'];

router.get('/', verifyToken, requireRole(...STAFF), ctrl.list);
router.get('/student/:studentId', verifyToken, ctrl.forStudent);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/sweep-overdue', verifyToken, requireRole(...STAFF), ctrl.markOverdue);

module.exports = router;
