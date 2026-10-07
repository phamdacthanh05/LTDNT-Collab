// src/routes/adminWeb/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/adminWeb/user.controller');

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserDetail);
router.post('/:userId/wallet', userController.adjustWallet);
router.post('/:userId/role', userController.changeRole);

module.exports = router;