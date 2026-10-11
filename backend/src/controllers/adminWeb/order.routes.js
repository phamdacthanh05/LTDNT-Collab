// src/routes/adminWeb/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/adminWeb/order.controller');

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderDetail);
router.post('/:id/status', orderController.updateStatus);

module.exports = router;