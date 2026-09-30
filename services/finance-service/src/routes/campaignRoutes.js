const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/campaignController');

const router = express.Router();
const FINANCE_STAFF = ['staff', 'admin', 'super_admin'];

router.get('/', verifyToken, requireRole(...FINANCE_STAFF), ctrl.list);
router.post('/', verifyToken, requireRole(...FINANCE_STAFF), [body('name').notEmpty(), body('startDate').isISO8601(), body('endDate').isISO8601()], validate, ctrl.create);
router.put('/:id', verifyToken, requireRole(...FINANCE_STAFF), ctrl.update);

module.exports = router;
