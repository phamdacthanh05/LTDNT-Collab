require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

// Import Routes (API cho Mobile App)
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const profileRoutes = require('./routes/profile.routes');
const chatRoutes = require('./routes/chat.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const walletRoutes = require('./routes/wallet.routes');
const { startCleanupJob } = require('./utils/cleanup');
const adminUsersRoutes = require('./routes/adminUsers.routes');

// Import Routes cho Admin Web (EJS)
const adminWebRoutes = require('./routes/adminWeb');

const app = express();

// ============ 1. CẤU HÌNH EJS CHO ADMIN WEB ============
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// ============ 2. MIDDLEWARE CƠ BẢN ============
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));

// ============ 3. SESSION & FLASH (CHO ADMIN) ============
app.use(session({
    secret: process.env.SESSION_SECRET || 'bi_mat_admin_123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(flash());

// ============ 4. MOUNT ROUTES ============
app.get('/', (req, res) => res.json({ ok: true, service: 'digital-resources-backend' }));

// API cho Mobile App
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin/users', adminUsersRoutes);
// Web Admin Dashboard
app.use('/admin', adminWebRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
    console.log(`Admin Dashboard tại http://localhost:${PORT}/admin/login`);
    startCleanupJob();
});