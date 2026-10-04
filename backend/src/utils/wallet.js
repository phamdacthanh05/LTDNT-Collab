// src/utils/wallet.js
// MỚI: Logic ví tiền của khách (BUYER).
//   - Nạp tiền: tạo giao dịch TOPUP ở trạng thái PENDING -> khách trả bằng MoMo -> MoMo báo về
//     (IPN hoặc sync) -> cộng số dư. Hàm creditTopup() chạy 1 lần duy nhất cho mỗi giao dịch.
//   - Mua hàng: trừ ví nằm trong routes/order.routes.js (cùng transaction với việc giao tài khoản).
// Admin KHÔNG có ví: tiền khách nạp đi thẳng vào MoMo của chủ shop và được quản lý trong MoMo.
const prisma = require('../prisma');

// Tiền tố gắn vào mã đơn gửi sang MoMo để IPN biết đây là giao dịch nạp ví
const TOPUP_PREFIX = 'TOPUP_';
const MIN_TOPUP = 10000; // MoMo yêu cầu tối thiểu 1.000đ; shop đặt 10.000đ cho đỡ rác
const MAX_TOPUP = 50000000; // MoMo giới hạn 50.000.000đ / giao dịch

const toMomoOrderId = (txId) => `${TOPUP_PREFIX}${txId}`;
const isTopupOrderId = (orderId) => typeof orderId === 'string' && orderId.startsWith(TOPUP_PREFIX);
const fromMomoOrderId = (orderId) => orderId.slice(TOPUP_PREFIX.length);

// Ghi nhận nạp tiền thành công và cộng số dư. An toàn khi bị gọi nhiều lần (IPN + sync + dev).
async function creditTopup(txId, { transactionId, raw, paidAmount } = {}) {
  return prisma.$transaction(
    async (tx) => {
      // Khoá dòng giao dịch: 2 request đồng thời sẽ xếp hàng, request sau thấy SUCCESS và bỏ qua
      await tx.$queryRaw`SELECT id FROM wallet_transactions WHERE id = ${txId} FOR UPDATE`;

      const row = await tx.walletTransaction.findUnique({ where: { id: txId } });
      if (!row || row.type !== 'TOPUP') throw new Error('Không tìm thấy giao dịch nạp tiền');
      if (row.status === 'SUCCESS') return { credited: false, alreadyDone: true, balance: null };

      // Chống sửa số tiền: số tiền MoMo xác nhận phải đúng bằng số tiền đã tạo
      if (paidAmount !== undefined && Number(paidAmount) !== Number(row.amount)) {
        await tx.walletTransaction.update({
          where: { id: txId },
          data: { status: 'FAILED', rawResponse: raw ? JSON.stringify(raw) : undefined },
        });
        throw new Error('Số tiền MoMo xác nhận không khớp với giao dịch nạp');
      }

      const user = await tx.user.update({
        where: { id: row.userId },
        data: { walletBalance: { increment: row.amount } },
        select: { walletBalance: true },
      });

      await tx.walletTransaction.update({
        where: { id: txId },
        data: {
          status: 'SUCCESS',
          balanceAfter: user.walletBalance,
          transactionId: transactionId ? String(transactionId) : undefined,
          rawResponse: raw ? JSON.stringify(raw) : undefined,
        },
      });

      return { credited: true, alreadyDone: false, balance: user.walletBalance };
    },
    { timeout: 15000, maxWait: 10000 }
  );
}

async function failTopup(txId, { transactionId, raw } = {}) {
  await prisma.walletTransaction.updateMany({
    where: { id: txId, status: 'PENDING' }, // không bao giờ đổi 1 giao dịch đã SUCCESS thành FAILED
    data: {
      status: 'FAILED',
      transactionId: transactionId ? String(transactionId) : undefined,
      rawResponse: raw ? JSON.stringify(raw) : undefined,
    },
  });
}

module.exports = {
  TOPUP_PREFIX, MIN_TOPUP, MAX_TOPUP,
  toMomoOrderId, isTopupOrderId, fromMomoOrderId,
  creditTopup, failTopup,
};
