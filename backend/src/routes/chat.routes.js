// src/routes/chat.routes.js
// File MỚI HOÀN TOÀN.
const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdminRole } = require('../middleware/adminRole.middleware');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// Phía Admin/Shop: đăng nhập bằng JWT và phải có role = ADMIN
// (đã thay cơ chế x-admin-secret tạm thời bằng phân quyền role thật).
const adminOnly = [requireAuth, requireAdminRole];

// ----- Phía người mua: cần đăng nhập (JWT) -----
router.post('/conversations', requireAuth, chatController.createConversation);
router.get('/conversations', requireAuth, chatController.listMyConversations);
router.get('/conversations/:id', requireAuth, chatController.getConversationDetail);
router.post('/conversations/:id/messages', requireAuth, chatController.sendMessage);

// ----- Phía Admin/Shop: cần JWT + role ADMIN -----
router.get('/admin/conversations', ...adminOnly, chatController.adminListConversations);
router.get('/admin/conversations/:id', ...adminOnly, chatController.adminGetConversationDetail);
router.post('/admin/conversations/:id/messages', ...adminOnly, chatController.adminReply);

module.exports = router;
