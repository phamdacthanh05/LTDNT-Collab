// src/routes/adminSupport.routes.js
// File MỚI HOÀN TOÀN — dùng lại requireAuth có sẵn + requireAdminRole mới, không sửa file cũ.
const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdminRole } = require('../middleware/adminRole.middleware');
const adminSupportController = require('../controllers/adminSupport.controller');

const router = express.Router();

// Toàn bộ route trong file này: phải đăng nhập (JWT) VÀ phải là tài khoản role = ADMIN
router.use(requireAuth, requireAdminRole);

// Danh sách toàn bộ cuộc trò chuyện từ tất cả người mua
router.get('/conversations', adminSupportController.listConversations);

// Chi tiết 1 cuộc trò chuyện (toàn bộ tin nhắn)
router.get('/conversations/:id', adminSupportController.getConversationDetail);

// Admin trả lời trong 1 cuộc trò chuyện
router.post('/conversations/:id/messages', adminSupportController.reply);

module.exports = router;
