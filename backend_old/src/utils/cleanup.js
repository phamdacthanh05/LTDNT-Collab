// src/utils/cleanup.js
// MỚI: Xoá lịch sử mua hàng (tài khoản/mật khẩu) đã quá 7 ngày.
const prisma = require('../prisma');

async function purgeExpiredPurchases() {
  const { count } = await prisma.purchaseHistory.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  if (count > 0) console.log(`[cleanup] Đã xoá ${count} bản ghi lịch sử mua hàng quá hạn 7 ngày`);
  return count;
}

// Chạy 1 lần lúc khởi động, sau đó mỗi giờ 1 lần.
function startCleanupJob() {
  const run = () => purgeExpiredPurchases().catch((e) => console.error('[cleanup] lỗi:', e.message));
  run();
  const timer = setInterval(run, 60 * 60 * 1000);
  timer.unref(); // không giữ tiến trình sống chỉ vì job này
}

module.exports = { purgeExpiredPurchases, startCleanupJob };
