const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

/**
 * @openapi
 * /payments:
 *   post:
 *     summary: Pay an invoice via simulated MTN MoMo or Orange Money
 *     tags: [Payments]
 */
router.post(
  '/',
  verifyToken,
  [
    body('invoiceId').isUUID(),
    body('amount').isFloat({ gt: 0 }),
    body('method').isIn(['mtn_momo', 'orange_money']),
    body('phoneNumber').matches(/^\d{9,15}$/).withMessage('phoneNumber must be 9-15 digits'),
  ],
  validate,
  ctrl.pay
);

module.exports = router;
