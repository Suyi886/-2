const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const checkRole = require('../middlewares/checkRole');
const authenticateToken = require('../middlewares/authenticateToken');

// 保护管理员仪表盘路由
router.get('/dashboard', authenticateToken, checkRole('admin'), adminController.dashboard);

module.exports = router;