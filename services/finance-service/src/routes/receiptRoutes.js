const express = require('express');
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/receiptController');

const router = express.Router();
router.get('/invoice/:invoiceId', verifyToken, ctrl.forInvoice);
router.get('/:id', verifyToken, ctrl.getById);

module.exports = router;
