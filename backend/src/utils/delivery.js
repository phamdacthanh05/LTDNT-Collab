// src/utils/delivery.js
// MỚI: Giao tài khoản cho khách sau khi đơn hàng được thanh toán.
//
// Với mỗi sản phẩm trong đơn (số lượng N):
//   1. Lấy N dòng đầu tiên trong kho `product_accounts` (khoá dòng bằng FOR UPDATE để 2 người
//      mua cùng lúc không bao giờ nhận trùng 1 tài khoản)
//   2. XOÁ các dòng đó khỏi kho
//   3. Chép tài khoản/mật khẩu sang `purchase_history` (hiện ở "Lịch sử mua hàng" của khách,
//      hết hạn sau 7 ngày)
//   4. Đồng bộ lại `products.stock` = số tài khoản còn lại trong kho
// Tất cả nằm trong 1 transaction: lỗi giữa chừng thì rollback, không mất tài khoản nào.
const prisma = require('../prisma');

const RETENTION_DAYS = 7;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

class OutOfStockError extends Error {
  constructor(productName, needed, available) {
    super(`Sản phẩm "${productName}" chỉ còn ${available} tài khoản, không đủ ${needed}`);
    this.name = 'OutOfStockError';
  }
}

// Chạy BÊN TRONG một transaction có sẵn (tx) — để checkout bằng ví có thể gom
// "trừ tiền + tạo đơn + giao tài khoản" vào cùng 1 transaction: lỗi ở bước nào cũng rollback hết.
async function deliverOrderTx(tx, orderId) {
  // Khoá dòng đơn hàng để tránh giao 2 lần khi IPN + sync cùng chạy
  await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new Error('Không tìm thấy đơn hàng');
  if (order.status === 'DELIVERED') return { alreadyDelivered: true, delivered: 0 };
  if (order.status === 'CANCELLED') throw new Error('Đơn hàng đã bị huỷ');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + RETENTION_MS);
  let delivered = 0;

  for (const item of order.items) {
    const quantity = Number(item.quantity);

    // LIMIT là số nguyên đã ép kiểu (không nhận chuỗi từ client) nên nhúng thẳng vào câu lệnh là an toàn.
    // Không dùng ORDER BY createdAt để tránh filesort khi kho có hàng trăm nghìn dòng.
    const limit = Math.max(1, Math.trunc(quantity));
    const accounts = await tx.$queryRawUnsafe(
      `SELECT id, username, password, note
         FROM product_accounts
        WHERE productId = ?
        ORDER BY id
        LIMIT ${limit}
        FOR UPDATE`,
      item.productId
    );

    if (accounts.length < quantity) {
      throw new OutOfStockError(item.product.name, quantity, accounts.length);
    }

    await tx.purchaseHistory.createMany({
      data: accounts.map((a) => ({
        userId: order.userId,
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        accountUsername: a.username,
        accountPassword: a.password,
        accountNote: a.note,
        unitPrice: item.unitPrice,
        purchasedAt: now,
        expiresAt,
      })),
    });

    // "Loại bỏ tài khoản đó ra khỏi db" — mỗi tài khoản chỉ bán 1 lần
    await tx.productAccount.deleteMany({
      where: { id: { in: accounts.map((a) => a.id) } },
    });

    const remaining = await tx.productAccount.count({ where: { productId: item.productId } });
    await tx.product.update({ where: { id: item.productId }, data: { stock: remaining } });

    delivered += accounts.length;
  }

  await tx.order.update({ where: { id: order.id }, data: { status: 'DELIVERED' } });
  return { alreadyDelivered: false, delivered };
}

// Giao hàng độc lập (transaction riêng) — dùng khi cần giao lại một đơn đã PAID.
function deliverOrder(orderId) {
  return prisma.$transaction((tx) => deliverOrderTx(tx, orderId), { timeout: 30000, maxWait: 10000 });
}

module.exports = { deliverOrder, deliverOrderTx, OutOfStockError, RETENTION_DAYS };
