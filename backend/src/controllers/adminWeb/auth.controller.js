// src/controllers/adminWeb/auth.controller.js
const prisma = require('../../prisma');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    res.render('login', { error: req.flash('error'), layout: false });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.role !== 'ADMIN' || !(await bcrypt.compare(password, user.passwordHash))) {
            req.flash('error', 'Email hoặc mật khẩu không đúng, hoặc không có quyền Admin!');
            return res.redirect('/admin/login');
        }

        req.session.adminId = user.id;
        req.session.role = user.role;
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra, vui lòng thử lại!');
        res.redirect('/admin/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
};