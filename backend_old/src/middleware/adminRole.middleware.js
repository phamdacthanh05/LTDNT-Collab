// src/middleware/adminRole.middleware.js
// Phân quyền theo role (ADMIN / BUYER). Dùng SAU requireAuth (requireAuth gắn req.userId).
// Role luôn được tra lại từ DB, không tin dữ liệu client gửi lên.
const prisma = require('../prisma');

function requireRole(role, forbiddenMessage) {
  return async function (req, res, next) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, role: true },
      });

      if (!user) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại' });
      }
      if (user.role !== role) {
        return res.status(403).json({ message: forbiddenMessage });
      }

      req.userRole = user.role;
      next();
    } catch (err) {
      console.error('requireRole error:', err);
      res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
    }
  };
}

// Chỉ ADMIN (chủ shop) mới được qua
const requireAdminRole = requireRole('ADMIN', 'Chỉ Admin mới có quyền truy cập chức năng này');

// MỚI: Chỉ BUYER (khách) mới được qua — dùng cho đặt hàng / thanh toán / lịch sử mua
const requireBuyerRole = requireRole('BUYER', 'Tài khoản Admin không thể mua hàng, vui lòng dùng tài khoản khách');

module.exports = { requireAdminRole, requireBuyerRole };
