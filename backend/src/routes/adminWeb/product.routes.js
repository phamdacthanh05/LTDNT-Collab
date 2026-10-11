// src/routes/adminWeb/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/adminWeb/product.controller');

// ============ QUẢN LÝ KHO TÀI KHOẢN (đặt trước route /:id để không bị nhầm) ============
router.get('/accounts', productController.getAccounts);
router.post('/accounts/import', productController.postImportAccounts);

// ============ QUẢN LÝ SẢN PHẨM ============
router.get('/', productController.getProducts);
router.get('/create', productController.getProductForm);
router.post('/create', productController.postProduct);
router.get('/:id/edit', productController.getProductForm);
router.post('/:id/edit', productController.postProduct);
router.post('/:id/toggle', productController.toggleProduct);
router.post('/:id/delete', productController.deleteProduct);

module.exports = router;