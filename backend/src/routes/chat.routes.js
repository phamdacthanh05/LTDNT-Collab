// src/routes/chat.routes.js
// Chỉ còn route phía USER (Mobile App). Admin chat đã chuyển sang Web Dashboard.
const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// ----- Phía người mua: cần đăng nhập (JWT) -----
router.post('/conversations', requireAuth, chatController.createConversation);
router.get('/conversations', requireAuth, chatController.listMyConversations);
router.get('/conversations/:id', requireAuth, chatController.getConversationDetail);
router.post('/conversations/:id/messages', requireAuth, chatController.sendMessage);

module.exports = router;