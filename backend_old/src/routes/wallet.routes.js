// src/routes/wallet.routes.js
// MỚI: Ví tiền — CHỈ khách (BUYER) dùng. Admin gọi vào sẽ bị 403 (Admin không có số dư).
const express = require('express');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireBuyerRole } = require('../middleware/adminRole.middleware');
const { createMomoPayment, queryMomoPayment } = require('../utils/momo');
const {
  MIN_TOPUP, MAX_TOPUP, toMomoOrderId, creditTopup, failTopup,
} = require('../utils/wallet');

const router = express.Router();
router.use(requireAuth, requireBuyerRole);

// Bật "nạp thử" khi dev local (không cần MoMo). PHẢI tắt (false) khi chạy thật.
const DEV_PAYMENT_ENABLED = String(process.env.ALLOW_DEV_PAYMENT).toLowerCase() === 'true';

// GET /api/wallet -> số dư + cấu hình nạp tiền
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { walletBalance: true },
    });
    res.json({
      balance: user.walletBalance,
      minTopup: MIN_TOPUP,
      maxTopup: MAX_TOPUP,
      devPayment: DEV_PAYMENT_ENABLED,
    });
  } catch (err) {
    console.error('wallet get error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// GET /api/wallet/transactions -> lịch sử nạp tiền / mua hàng (50 giao dịch gần nhất)
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, type: true, status: true, amount: true, balanceAfter: true,
        orderId: true, description: true, createdAt: true,
      },
    });
    res.json({ transactions });
  } catch (err) {
    console.error('wallet transactions error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
});

// POST /api/wallet/topup  body: { amount }
// Tạo giao dịch nạp PENDING + link thanh toán MoMo. Tiền CHƯA vào ví cho tới khi MoMo xác nhận.
router.post('/topup', async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isInteger(amount)) {
      return res.status(400).json({ message: 'Số tiền nạp phải là số nguyên (đồng)' });
    }
    if (amount < MIN_TOPUP) {
      return res.status(400).json({ message: `Số tiền nạp tối thiểu ${MIN_TOPUP.toLocaleString('vi-VN')}đ` });
    }
    if (amount > MAX_TOPUP) {
      return res.status(400).json({ message: `Số tiền nạp tối đa ${MAX_TOPUP.toLocaleString('vi-VN')}đ mỗi lần` });
    }

    const row = await prisma.walletTransaction.create({
      data: {
        userId: req.userId,
        type: 'TOPUP',
        status: 'PENDING',
        amount,
        description: 'Nạp tiền vào ví qua MoMo',
      },
    });

    // Dev: bỏ qua MoMo, app sẽ gọi /topup/dev-confirm ngay sau đó
    if (DEV_PAYMENT_ENABLED && req.body.dev === true) {
      return res.status(201).json({ transactionId: row.id, payUrl: null, dev: true });
    }

    const momoRes = await createMomoPayment({
      orderId: toMomoOrderId(row.id),
      amount,
      orderInfo: `Nap vi ${row.id}`,
    });

    if (!momoRes.payUrl) {
      await failTopup(row.id, { raw: momoRes });
      return res.status(502).json({ message: 'Không tạo được giao dịch MoMo, vui lòng thử lại' });
    }

    res.status(201).json({ transactionId: row.id, payUrl: momoRes.payUrl });
  } catch (err) {
    console.error('wallet topup error:', err.response?.data || err);
    res.status(500).json({ message: 'Lỗi khi tạo giao dịch nạp tiền' });
  }
});

// POST /api/wallet/topup/sync  body: { transactionId }
// App gọi sau khi khách đóng trang MoMo: backend tự hỏi MoMo xem đã trả tiền chưa rồi cộng ví.
// (Cần khi chạy local vì MoMo không gọi được IPN về localhost.)
router.post('/topup/sync', async (req, res) => {
  try {
    const row = await prisma.walletTransaction.findFirst({
      where: { id: String(req.body.transactionId || ''), userId: req.userId, type: 'TOPUP' },
    });
    if (!row) return res.status(404).json({ message: 'Không tìm thấy giao dịch nạp tiền' });

    if (row.status === 'SUCCESS') return res.json({ status: 'SUCCESS', credited: false });

    const momoRes = await queryMomoPayment(toMomoOrderId(row.id));
    if (Number(momoRes.resultCode) === 0) {
      await creditTopup(row.id, {
        transactionId: momoRes.transId,
        raw: momoRes,
        paidAmount: momoRes.amount,
      });
      return res.json({ status: 'SUCCESS', credited: true });
    }

    // 1000 = đang chờ khách xác nhận, 7000/7002 = đang xử lý -> vẫn để PENDING; còn lại coi như thất bại
    const pendingCodes = [1000, 7000, 7002, 9000];
    if (pendingCodes.includes(Number(momoRes.resultCode))) {
      return res.json({ status: 'PENDING', credited: false, message: 'MoMo chưa ghi nhận thanh toán' });
    }
    await failTopup(row.id, { raw: momoRes });
    res.json({ status: 'FAILED', credited: false, message: momoRes.message || 'Giao dịch không thành công' });
  } catch (err) {
    console.error('wallet sync error:', err.response?.data || err);
    res.status(500).json({ message: 'Không kiểm tra được trạng thái nạp tiền' });
  }
});

// POST /api/wallet/topup/dev-confirm  body: { transactionId }
// CHỈ DÙNG KHI DEV: coi như đã nạp thành công. Tự khoá (404) nếu ALLOW_DEV_PAYMENT != "true".
router.post('/topup/dev-confirm', async (req, res) => {
  if (!DEV_PAYMENT_ENABLED) return res.status(404).json({ message: 'Không tìm thấy' });
  try {
    const row = await prisma.walletTransaction.findFirst({
      where: { id: String(req.body.transactionId || ''), userId: req.userId, type: 'TOPUP' },
    });
    if (!row) return res.status(404).json({ message: 'Không tìm thấy giao dịch nạp tiền' });

    await creditTopup(row.id, { transactionId: `DEV-${Date.now()}`, raw: { dev: true } });
    res.json({ status: 'SUCCESS', credited: true });
  } catch (err) {
    console.error('wallet dev-confirm error:', err);
    res.status(500).json({ message: 'Lỗi xử lý nạp thử' });
  }
});

module.exports = router;
