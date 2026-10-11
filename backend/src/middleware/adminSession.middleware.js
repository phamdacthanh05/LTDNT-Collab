// src/middleware/adminSession.middleware.js
// Middleware bảo vệ các route Admin Web bằng Session (khác với auth.middleware.js dùng JWT cho App)
module.exports = (req, res, next) => {
    if (req.session && req.session.adminId && req.session.role === 'ADMIN') {
        return next();
    }
    req.flash('error', 'Vui lòng đăng nhập bằng tài khoản Admin!');
    res.redirect('/admin/login');
};