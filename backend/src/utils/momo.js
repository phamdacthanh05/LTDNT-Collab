const crypto = require('crypto');
const axios = require('axios');

// Tài liệu chính thức: https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime
// Luồng: Backend gọi API "create" của Momo -> nhận payUrl -> app mở payUrl (WebView/trình duyệt)
// -> user thanh toán trên Momo -> Momo gọi ngược IPN URL của mình để báo kết quả (server-to-server)
async function createMomoPayment({ orderId, amount, orderInfo }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const redirectUrl = process.env.MOMO_REDIRECT_URL;
  const ipnUrl = process.env.MOMO_IPN_URL;
  const requestId = `${orderId}-${Date.now()}`;
  const requestType = 'captureWallet';
  const extraData = '';

  // Chuỗi ký PHẢI đúng thứ tự alphabet theo tài liệu Momo, sai thứ tự -> sai chữ ký
  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const body = {
    partnerCode,
    accessKey,
    requestId,
    amount: String(amount),
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi',
  };

  const { data } = await axios.post(process.env.MOMO_ENDPOINT, body);
  // data.payUrl là link để mở cho user thanh toán
  return data;
}

// Xác minh chữ ký khi Momo gọi IPN về, tránh giả mạo request
function verifyMomoSignature(payload) {
  const {
    partnerCode, orderId, requestId, amount, orderInfo, orderType,
    transId, resultCode, message, payType, responseTime, extraData, signature,
  } = payload;

  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
    `&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}` +
    `&requestId=${requestId}&responseTime=${responseTime}` +
    `&resultCode=${resultCode}&transId=${transId}`;

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  return expectedSignature === signature;
}

// MỚI: Hỏi trực tiếp Momo xem giao dịch đã thanh toán chưa (API "query").
// Dùng khi Momo không gọi được IPN về máy local (localhost) — backend tự đối soát,
// KHÔNG tin dữ liệu do app gửi lên nên không thể bị giả mạo.
async function queryMomoPayment(orderId) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const requestId = `${orderId}-q-${Date.now()}`;

  const rawSignature =
    `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const endpoint =
    process.env.MOMO_QUERY_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query';
  const { data } = await axios.post(endpoint, {
    partnerCode, requestId, orderId, signature, lang: 'vi',
  });
  return data; // resultCode === 0 nghĩa là đã thanh toán thành công
}

module.exports = { createMomoPayment, verifyMomoSignature, queryMomoPayment };
