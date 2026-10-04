const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true, // để app biết tài khoản là ADMIN hay BUYER sau khi đăng nhập
  createdAt: true,
  updatedAt: true,
};

function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

// Trả lỗi kèm `field` để app biết ô nào đang sai
function fail(res, status, message, field) {
  return res.status(status).json({ message, ...(field ? { field } : {}) });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!fullName || !email || !password) {
      return fail(res, 400, 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
    }
    if (fullName.length < 2) {
      return fail(res, 400, 'Họ và tên phải có ít nhất 2 ký tự', 'fullName');
    }
    if (!EMAIL_REGEX.test(email)) {
      return fail(res, 400, 'Email không đúng định dạng (ví dụ: ten@gmail.com)', 'email');
    }
    if (password.length < 6) {
      return fail(res, 400, 'Mật khẩu phải có ít nhất 6 ký tự', 'password');
    }
    if (password.length > 72) {
      return fail(res, 400, 'Mật khẩu quá dài (tối đa 72 ký tự)', 'password');
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return fail(res, 409, 'Email này đã được đăng ký, vui lòng dùng email khác hoặc đăng nhập', 'email');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Đăng ký công khai LUÔN là BUYER — không nhận role từ client, tránh tự phong Admin
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: 'BUYER' },
      select: { ...publicUserSelect },
    });

    const token = signToken(user.id);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return fail(res, 400, 'Vui lòng nhập đầy đủ email và mật khẩu');
    }
    if (!EMAIL_REGEX.test(email)) {
      return fail(res, 400, 'Email không đúng định dạng (ví dụ: ten@gmail.com)', 'email');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { ...publicUserSelect, passwordHash: true },
    });
    if (!user) {
      return fail(res, 401, 'Email này chưa được đăng ký tài khoản', 'email');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return fail(res, 401, 'Mật khẩu không đúng, vui lòng thử lại', 'password');
    }

    const token = signToken(user.id);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// GET /api/auth/me  (lấy thông tin user hiện tại từ token, dùng khi mở app lên)
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { ...publicUserSelect },
  });
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  res.json({ user: toPublicUser(user) });
});

module.exports = router;
