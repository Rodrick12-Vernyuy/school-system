const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/employeeController');

const router = express.Router();
const HR_STAFF = ['staff', 'admin', 'super_admin'];

router.get('/', verifyToken, requireRole(...HR_STAFF), ctrl.list);
router.get('/:id', verifyToken, requireRole(...HR_STAFF), ctrl.getById);
router.post('/', verifyToken, requireRole(...HR_STAFF), [body('employeeNumber').notEmpty(), body('fullName').notEmpty(), body('email').isEmail(), body('department').notEmpty(), body('position').notEmpty(), body('salary').isFloat({ gt: 0 })], validate, ctrl.create);
router.put('/:id', verifyToken, requireRole(...HR_STAFF), ctrl.update);
router.delete('/:id', verifyToken, requireRole('admin', 'super_admin'), ctrl.deactivate);

module.exports = router;
