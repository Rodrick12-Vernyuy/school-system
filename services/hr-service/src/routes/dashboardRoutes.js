const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

const router = express.Router();
router.get('/summary', verifyToken, requireRole('staff', 'admin', 'super_admin'), ctrl.summary);

module.exports = router;
