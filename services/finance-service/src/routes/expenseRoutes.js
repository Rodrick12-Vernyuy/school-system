const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/expenseController');

const router = express.Router();
const FINANCE_STAFF = ['staff', 'admin', 'super_admin'];

router.get('/', verifyToken, requireRole(...FINANCE_STAFF), ctrl.list);
router.post('/', verifyToken, requireRole(...FINANCE_STAFF), [body('category').notEmpty(), body('description').notEmpty(), body('amount').isFloat({ gt: 0 })], validate, ctrl.create);
router.put('/:id', verifyToken, requireRole(...FINANCE_STAFF), ctrl.update);
router.delete('/:id', verifyToken, requireRole(...FINANCE_STAFF), ctrl.remove);

module.exports = router;
