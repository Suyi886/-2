const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/change-password', userController.changePassword);
router.post('/upload-avatar', userController.uploadAvatar);
router.get('/user', userController.getUserInfo);
router.get('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;