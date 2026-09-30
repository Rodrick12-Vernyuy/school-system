const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/recruitmentController');

const router = express.Router();
const HR_STAFF = ['staff', 'admin', 'super_admin'];

router.get('/', verifyToken, requireRole(...HR_STAFF), ctrl.list);
router.post('/', verifyToken, requireRole(...HR_STAFF), [body('candidateName').notEmpty(), body('position').notEmpty()], validate, ctrl.create);
router.patch('/:id/status', verifyToken, requireRole(...HR_STAFF), [body('status').isIn(['applied', 'interview', 'selected', 'rejected'])], validate, ctrl.updateStatus);

module.exports = router;
