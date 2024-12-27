const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 保护管理员仪表盘路由
router.get('/admin/dashboard', adminController.dashboard);

module.exports = router;