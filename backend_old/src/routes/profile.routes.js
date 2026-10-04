// src/routes/profile.routes.js
// File MỚI HOÀN TOÀN — dùng lại middleware requireAuth có sẵn (chỉ import, không sửa).
const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const profileController = require('../controllers/profile.controller');

const router = express.Router();

router.use(requireAuth); // toàn bộ route trong trang cá nhân đều cần đăng nhập

router.get('/me', profileController.getMe);
router.put('/me', profileController.updateMe);
router.put('/change-password', profileController.changePassword);
router.get('/orders', profileController.getMyOrders);

module.exports = router;
