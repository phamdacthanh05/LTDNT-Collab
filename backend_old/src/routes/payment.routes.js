// Thanh toán qua MoMo: CHỈ dùng để NẠP TIỀN VÀO VÍ (xem routes/wallet.routes.js).
// Mua hàng không còn đi qua MoMo — khách trả bằng số dư ví.
const express = require('express');
const { verifyMomoSignature } = require('../utils/momo');
const { isTopupOrderId, fromMomoOrderId, creditTopup, failTopup } = require('../utils/wallet');

const router = express.Router();

// MoMo gọi ngược (server-to-server) về endpoint này để báo kết quả nạp tiền — KHÔNG phải nơi user nhìn thấy
router.post('/momo/ipn', async (req, res) => {
  try {
    const isValid = verifyMomoSignature(req.body);
    if (!isValid) return res.status(400).json({ message: 'Chữ ký không hợp lệ' });

    const { orderId, resultCode, transId, amount } = req.body;
    if (!isTopupOrderId(orderId)) {
      // Không phải giao dịch nạp ví của hệ thống này -> bỏ qua
      return res.status(204).send();
    }

    const txId = fromMomoOrderId(orderId);
    if (Number(resultCode) === 0) {
      // Thanh toán OK -> cộng tiền vào ví (idempotent, gọi lại nhiều lần không cộng trùng)
      await creditTopup(txId, { transactionId: transId, raw: req.body, paidAmount: amount });
    } else {
      await failTopup(txId, { transactionId: transId, raw: req.body });
    }

    res.status(204).send();
  } catch (err) {
    console.error('momo ipn error:', err);
    res.status(500).json({ message: 'Lỗi xử lý IPN' });
  }
});

// User được MoMo redirect về đây sau khi thanh toán xong (chỉ để hiển thị UI, KHÔNG dùng để cộng tiền)
router.get('/momo/return', (req, res) => {
  res.send(
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="font-family:sans-serif;text-align:center;padding:48px 16px">' +
    '<h2>Đã xử lý xong</h2><p>Vui lòng quay lại ứng dụng để xem số dư ví.</p></body></html>'
  );
});

module.exports = router;
