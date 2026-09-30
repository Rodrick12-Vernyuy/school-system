const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/assetController');

const router = express.Router();
const HR_STAFF = ['staff', 'admin', 'super_admin'];

router.get('/', verifyToken, requireRole(...HR_STAFF), ctrl.list);
router.post('/', verifyToken, requireRole(...HR_STAFF), [body('name').notEmpty(), body('category').notEmpty()], validate, ctrl.create);
router.put('/:id', verifyToken, requireRole(...HR_STAFF), ctrl.update);

module.exports = router;
