const express = require('express');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireBuyerRole } = require('../middleware/adminRole.middleware');
const { deliverOrderTx, OutOfStockError } = require('../utils/delivery');

const router = express.Router();
router.use(requireAuth, requireBuyerRole); // đơn hàng: phải đăng nhập và là BUYER

const MAX_QTY_PER_ITEM = 100;

// Lỗi nghiệp vụ có mã HTTP riêng; ném bên trong transaction để rollback toàn bộ
class CheckoutError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

// POST /api/orders  body: { items: [{ productId, quantity }] }
// THANH TOÁN BẰNG VÍ: một transaction duy nhất gồm
//   1. khoá dòng user (2 lần bấm mua cùng lúc không thể tiêu quá số dư)
//   2. kiểm tra hàng trong kho + số dư ví
//   3. tạo đơn, trừ ví, ghi sổ giao dịch
//   4. lấy tài khoản từ kho giao cho khách
// Bước nào lỗi (hết hàng, thiếu tiền...) thì rollback hết: không mất tiền, không mất tài khoản.
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Gộp các dòng trùng productId lại thành 1 dòng
    const merged = new Map();
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Số lượng sản phẩm không hợp lệ' });
      }
      merged.set(item.productId, (merged.get(item.productId) || 0) + quantity);
    }
    const productIds = [...merged.keys()];

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Khoá ví của khách cho tới hết transaction
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${req.userId} FOR UPDATE`;
        const user = await tx.user.findUnique({
          where: { id: req.userId },
          select: { walletBalance: true },
        });
        if (!user) throw new CheckoutError(401, 'Tài khoản không tồn tại');

        // 2. Kiểm tra sản phẩm + kho
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, isActive: true },
        });
        if (products.length !== productIds.length) {
          throw new CheckoutError(400, 'Có sản phẩm không tồn tại hoặc đã ngừng bán');
        }

        let totalAmount = 0;
        const orderItemsData = [];
        for (const product of products) {
          const quantity = merged.get(product.id);
          if (quantity > MAX_QTY_PER_ITEM) {
            throw new CheckoutError(400, `Mỗi lần chỉ mua tối đa ${MAX_QTY_PER_ITEM} tài khoản cho "${product.name}"`);
          }
          const available = await tx.productAccount.count({ where: { productId: product.id } });
          if (available < quantity) {
            throw new CheckoutError(
              400,
              available === 0
                ? `"${product.name}" đã hết hàng`
                : `"${product.name}" chỉ còn ${available} tài khoản, bạn đang chọn ${quantity}`
            );
          }
          totalAmount += Number(product.price) * quantity;
          orderItemsData.push({ productId: product.id, quantity, unitPrice: product.price });
        }

        // 3. Kiểm tra số dư
        const balance = Number(user.walletBalance);
        if (balance < totalAmount) {
          throw new CheckoutError(
            402,
            `Số dư ví không đủ. Cần ${totalAmount.toLocaleString('vi-VN')}đ, hiện có ${balance.toLocaleString('vi-VN')}đ. Vui lòng nạp thêm tiền vào ví.`,
            { code: 'INSUFFICIENT_BALANCE', required: totalAmount, balance, missing: totalAmount - balance }
          );
        }

        // 4. Tạo đơn (đã thanh toán bằng ví) + trừ ví + ghi sổ
        const order = await tx.order.create({
          data: {
            userId: req.userId,
            totalAmount,
            status: 'PAID',
            items: { create: orderItemsData },
            payment: { create: { method: 'WALLET', status: 'SUCCESS' } },
          },
        });

        const updated = await tx.user.update({
          where: { id: req.userId },
          data: { walletBalance: { decrement: totalAmount } },
          select: { walletBalance: true },
        });

        await tx.walletTransaction.create({
          data: {
            userId: req.userId,
            type: 'PURCHASE',
            status: 'SUCCESS',
            amount: totalAmount,
            balanceAfter: updated.walletBalance,
            orderId: order.id,
            description: `Thanh toán đơn hàng #${order.id.slice(0, 8)}`,
          },
        });

        // 5. Giao tài khoản (đổi đơn sang DELIVERED)
        const delivery = await deliverOrderTx(tx, order.id);

        return { orderId: order.id, totalAmount, balance: updated.walletBalance, delivered: delivery.delivered };
      },
      { timeout: 30000, maxWait: 10000 }
    );

    const order = await prisma.order.findUnique({
      where: { id: result.orderId },
      include: { items: { include: { product: true } }, payment: true },
    });
    res.status(201).json({ order, balance: result.balance, delivered: result.delivered });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.status).json({ message: err.message, ...err.extra });
    }
    if (err instanceof OutOfStockError) {
      return res.status(400).json({ message: err.message });
    }
    console.error('checkout error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// GET /api/orders -> danh sách đơn hàng của user hiện tại
router.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { items: { include: { product: true } }, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ orders });
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { items: { include: { product: true } }, payment: true },
  });
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  res.json({ order });
});

module.exports = router;
