// src/controllers/adminWeb/dashboard.controller.js
const prisma = require('../../prisma');

exports.getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // ============ THỐNG KÊ TỔNG QUAN ============
        const [
            totalProducts,
            activeProducts,
            totalUsers,
            totalBuyers,
            totalOrders,
            totalRevenueResult,
            todayOrders,
            todayRevenueResult,
            monthRevenueResult,
            totalAccountsInStock,
            pendingConversations,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.user.count(),
            prisma.user.count({ where: { role: 'BUYER' } }),
            prisma.order.count(),
            prisma.order.aggregate({
                where: { status: { in: ['PAID', 'DELIVERED'] } },
                _sum: { totalAmount: true },
            }),
            prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma.order.aggregate({
                where: { createdAt: { gte: startOfToday }, status: { in: ['PAID', 'DELIVERED'] } },
                _sum: { totalAmount: true },
            }),
            prisma.order.aggregate({
                where: { createdAt: { gte: startOfMonth }, status: { in: ['PAID', 'DELIVERED'] } },
                _sum: { totalAmount: true },
            }),
            prisma.productAccount.count(),
            prisma.conversation.count({
                where: {
                    messages: {
                        some: { senderRole: 'USER', isRead: false },
                    },
                },
            }),
        ]);

        // ============ 7 NGÀY GẦN NHẤT (biểu đồ) ============
        const revenueByDay = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            const [orders, revenue] = await Promise.all([
                prisma.order.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
                prisma.order.aggregate({
                    where: {
                        createdAt: { gte: dayStart, lt: dayEnd },
                        status: { in: ['PAID', 'DELIVERED'] },
                    },
                    _sum: { totalAmount: true },
                }),
            ]);

            revenueByDay.push({
                label: dayStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                orders,
                revenue: Number(revenue._sum.totalAmount || 0),
            });
        }

        // ✅ Tính sẵn chiều cao cột (barHeight) để EJS không cần biểu thức CSS phức tạp
        const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);
        revenueByDay.forEach(d => {
            d.barHeight = Math.max(Math.round((d.revenue / maxRevenue) * 100), 2);
        });

        // ============ TOP 5 SẢN PHẨM BÁN CHẠY ============
        const topProductsRaw = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true, unitPrice: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });

        const topProducts = await Promise.all(
            topProductsRaw.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, imageUrl: true },
                });
                return {
                    productId: item.productId,
                    name: product?.name || 'Đã xóa',
                    imageUrl: product?.imageUrl,
                    quantitySold: item._sum.quantity || 0,
                    revenue: Number(item._sum.unitPrice || 0) * Number(item._sum.quantity || 0),
                };
            })
        );

        // ============ 5 ĐƠN HÀNG MỚI NHẤT ============
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { fullName: true, email: true } },
                payment: { select: { method: true, status: true } },
            },
        });

        // ============ 5 USER MỚI NHẤT ============
        const recentUsers = await prisma.user.findMany({
            where: { role: 'BUYER' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                email: true,
                walletBalance: true,
                createdAt: true,
            },
        });

        const stats = {
            totalProducts,
            activeProducts,
            hiddenProducts: totalProducts - activeProducts,
            totalUsers,
            totalBuyers,
            totalAdmins: totalUsers - totalBuyers,
            totalOrders,
            totalRevenue: Number(totalRevenueResult._sum.totalAmount || 0),
            todayOrders,
            todayRevenue: Number(todayRevenueResult._sum.totalAmount || 0),
            monthRevenue: Number(monthRevenueResult._sum.totalAmount || 0),
            totalAccountsInStock,
            pendingConversations,
        };

        res.render('dashboard', {
            title: 'Tổng quan',
            stats,
            revenueByDay,
            topProducts,
            recentOrders: recentOrders.map((o) => ({
                ...o,
                totalAmount: Number(o.totalAmount),
            })),
            recentUsers: recentUsers.map((u) => ({
                ...u,
                walletBalance: Number(u.walletBalance),
            })),
            success: req.flash('success'),
            error: req.flash('error'),
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Không tải được dashboard.');

        res.render('dashboard', {
            title: 'Tổng quan',
            stats: {
                totalProducts: 0, activeProducts: 0, hiddenProducts: 0,
                totalUsers: 0, totalBuyers: 0, totalAdmins: 0,
                totalOrders: 0, totalRevenue: 0, todayOrders: 0,
                todayRevenue: 0, monthRevenue: 0, totalAccountsInStock: 0,
                pendingConversations: 0,
            },
            revenueByDay: [],
            topProducts: [],
            recentOrders: [],
            recentUsers: [],
            success: req.flash('success'),
            error: req.flash('error'),
        });
    }
};