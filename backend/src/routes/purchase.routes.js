// src/routes/purchase.routes.js
// MỚI: Lịch sử mua hàng của khách (tài khoản + mật khẩu đã mua).
// Mỗi bản ghi tự hết hạn sau 7 ngày kể từ lúc mua (xem utils/cleanup.js).
const express = require('express');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireBuyerRole } = require('../middleware/adminRole.middleware');
const { purgeExpiredPurchases } = require('../utils/cleanup');
const { RETENTION_DAYS } = require('../utils/delivery');

const router = express.Router();
router.use(requireAuth, requireBuyerRole);

// GET /api/purchases
router.get('/', async (req, res) => {
  try {
    // Dọn bản ghi quá hạn trước khi trả về, để khách không bao giờ thấy dữ liệu đã hết hạn
    await purgeExpiredPurchases();

    const rows = await prisma.purchaseHistory.findMany({
      where: { userId: req.userId, expiresAt: { gt: new Date() } },
      orderBy: [{ purchasedAt: 'desc' }, { productName: 'asc' }],
    });

    const now = Date.now();
    const items = rows.map((r) => {
      const msLeft = r.expiresAt.getTime() - now;
      return {
        id: r.id,
        orderId: r.orderId,
        productId: r.productId,
        productName: r.productName,
        accountUsername: r.accountUsername,
        accountPassword: r.accountPassword,
        accountNote: r.accountNote,
        unitPrice: r.unitPrice,
        purchasedAt: r.purchasedAt,
        expiresAt: r.expiresAt,
        hoursLeft: Math.max(0, Math.floor(msLeft / 3600000)),
        daysLeft: Math.max(0, Math.ceil(msLeft / 86400000)),
      };
    });

    res.json({
      retentionDays: RETENTION_DAYS,
      notice: `Lịch sử mua hàng sẽ tự động xoá sau ${RETENTION_DAYS} ngày kể từ ngày mua. Hãy lưu lại tài khoản và mật khẩu trước khi hết hạn.`,
      items,
    });
  } catch (err) {
    console.error('purchases list error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

module.exports = router;
