const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/gradeController');

const router = express.Router();
const STAFF = ['staff', 'admin', 'super_admin'];

router.post('/', verifyToken, requireRole(...STAFF), [body('enrollmentId').isUUID(), body('score').isFloat({ min: 0, max: 100 })], validate, ctrl.enter);
router.put('/:id', verifyToken, requireRole(...STAFF), [body('score').isFloat({ min: 0, max: 100 })], validate, ctrl.update);
router.get('/student/:studentId', verifyToken, ctrl.listForStudent);

module.exports = router;
