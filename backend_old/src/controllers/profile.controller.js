// src/controllers/profile.controller.js
// File MỚI HOÀN TOÀN — không đụng tới auth.routes.js hay bất kỳ controller nào khác.
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

function toPublicProfile(user) {
  const { passwordHash, walletBalance, ...publicUser } = user;
  // Admin KHÔNG có số dư ví (tiền thu chi quản lý trong MoMo) -> không trả walletBalance.
  // Chỉ BUYER mới có số dư ví.
  if (user.role === 'ADMIN') return publicUser;
  return { ...publicUser, walletBalance };
}

// GET /api/profile/me
// Trả về thông tin tài khoản: họ tên, email, số điện thoại, số dư ví
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ user: toPublicProfile(user) });
  } catch (err) {
    console.error('profile getMe error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// PUT /api/profile/me   body: { fullName?, address? }
async function updateMe(req, res) {
  try {
    const { fullName, address } = req.body;

    const data = {};
    if (typeof fullName === 'string' && fullName.trim()) data.fullName = fullName.trim();
    if (typeof address === 'string') data.address = address.trim() || null; // MỚI: địa chỉ giao hàng

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
    }

    const user = await prisma.user.update({ where: { id: req.userId }, data });
    res.json({ user: toPublicProfile(user) });
  } catch (err) {
    console.error('profile updateMe error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// PUT /api/profile/change-password   body: { oldPassword, newPassword }
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('profile changePassword error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// GET /api/profile/orders  -> lịch sử đơn hàng của user hiện tại (dùng cho tab trong trang cá nhân)
async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: { include: { product: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    console.error('profile getMyOrders error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

module.exports = { getMe, updateMe, changePassword, getMyOrders };
