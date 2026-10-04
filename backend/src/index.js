require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const profileRoutes = require('./routes/profile.routes'); // MỚI: trang cá nhân
const chatRoutes = require('./routes/chat.routes');       // MỚI: tin nhắn trong app
const purchaseRoutes = require('./routes/purchase.routes'); // MỚI: lịch sử mua hàng
const walletRoutes = require('./routes/wallet.routes');       // MỚI: ví tiền (nạp MoMo, số dư) — chỉ BUYER
const adminRoutes = require('./routes/admin.routes');       // MỚI: quản lý kho tài khoản (ADMIN)
const { startCleanupJob } = require('./utils/cleanup');      // MỚI: dọn lịch sử quá 7 ngày
const adminSupportRoutes = require('./routes/adminSupport.routes'); // MỚI: Admin xem & trả lời hội thoại (JWT + role ADMIN)
const adminUsersRoutes = require('./routes/adminUsers.routes'); // Quản lý người dùng (ADMIN)
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' })); // 20mb để admin nhập hàng chục nghìn tài khoản 1 lần

app.get('/', (req, res) => res.json({ ok: true, service: 'digital-resources-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/profile', profileRoutes); // MỚI
app.use('/api/chat', chatRoutes);       // MỚI
app.use('/api/admin-support', adminSupportRoutes); // MỚI
app.use('/api/purchases', purchaseRoutes); // MỚI
app.use('/api/wallet', walletRoutes);      // MỚI
app.use('/api/admin/users', adminUsersRoutes); // MỚI
app.use('/api/admin', adminRoutes);        // MỚI

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  startCleanupJob();
});
