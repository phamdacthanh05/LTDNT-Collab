// src/routes/adminWeb/index.js
const express = require('express');
const router = express.Router();
const adminSession = require('../../middleware/adminSession.middleware');
const authController = require('../../controllers/adminWeb/auth.controller');
const dashboardController = require('../../controllers/adminWeb/dashboard.controller');

// ============ ROUTE ĐĂNG NHẬP (KHÔNG CẦN BẢO VỆ) ============
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// ============ ROUTE DASHBOARD ============
router.get('/dashboard', adminSession, dashboardController.getDashboard);

// ============ CÁC ROUTE CẦN BẢO VỆ ============
router.use('/products', adminSession, require('./product.routes'));
router.use('/users', adminSession, require('./user.routes'));
router.use('/orders', adminSession, require('./order.routes'));
router.use('/wallet', adminSession, require('./wallet.routes'));
router.use('/support', adminSession, require('./support.routes'));

// Redirect về dashboard nếu vào /admin
router.get('/', adminSession, (req, res) => res.redirect('/admin/dashboard'));

module.exports = router;