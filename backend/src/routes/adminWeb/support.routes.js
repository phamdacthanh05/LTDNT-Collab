// src/routes/adminWeb/support.routes.js
const express = require('express');
const router = express.Router();
const supportController = require('../../controllers/adminWeb/support.controller');

router.get('/', supportController.getConversations);
router.get('/:id', supportController.getChatDetail);
router.post('/:id/reply', supportController.postReply);

module.exports = router;