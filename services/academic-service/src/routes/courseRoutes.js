const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/courseController');

const router = express.Router();
const STAFF = ['staff', 'admin', 'super_admin'];

router.get('/', verifyToken, ctrl.list);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, requireRole(...STAFF), [body('code').notEmpty(), body('title').notEmpty()], validate, ctrl.create);
router.put('/:id', verifyToken, requireRole(...STAFF), ctrl.update);
router.delete('/:id', verifyToken, requireRole('admin', 'super_admin'), ctrl.remove);
router.post('/:id/prerequisites', verifyToken, requireRole(...STAFF), [body('prerequisiteCourseId').isUUID()], validate, ctrl.assignPrerequisite);

module.exports = router;
