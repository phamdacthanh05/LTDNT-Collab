const jwt = require('jsonwebtoken');

// Gắn vào các route cần đăng nhập mới được gọi
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // dạng "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // gắn userId vào request để các route sau dùng
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = { requireAuth };
