// src/routes/adminWeb/wallet.routes.js
const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/adminWeb/wallet.controller');

router.get('/', walletController.getTransactions);

module.exports = router;