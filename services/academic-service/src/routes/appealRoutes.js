const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/appealController');

const router = express.Router();
const STAFF = ['staff', 'admin', 'super_admin'];

router.post('/', verifyToken, [body('gradeId').isUUID(), body('reason').notEmpty()], validate, ctrl.submit);
router.patch('/:id/review', verifyToken, requireRole(...STAFF), [body('decision').isIn(['approved', 'rejected'])], validate, ctrl.review);
router.get('/', verifyToken, requireRole(...STAFF), ctrl.list);

module.exports = router;
