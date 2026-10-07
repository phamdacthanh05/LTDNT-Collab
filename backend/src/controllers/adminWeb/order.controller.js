// src/controllers/adminWeb/order.controller.js
const prisma = require('../../prisma');

// ============ 1. DANH SÁCH ĐƠN HÀNG ============
exports.getOrders = async (req, res) => {
    try {
        const status = req.query.status || '';
        const search = (req.query.q || '').trim();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 20;
        const skip = (page - 1) * limit;

        const where = {};
        if (status && ['PENDING', 'PAID', 'DELIVERED', 'CANCELLED'].includes(status)) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { user: { fullName: { contains: search } } },
                { user: { email: { contains: search } } },
                { id: { contains: search } },
            ];
        }

        const [orders, totalCount, stats] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: { select: { fullName: true, email: true } },
                    items: { include: { product: { select: { name: true } } } },
                    payment: true,
                },
            }),
            prisma.order.count({ where }),
            Promise.all([
                prisma.order.count(),
                prisma.order.count({ where: { status: 'DELIVERED' } }),
                prisma.order.count({ where: { status: 'PENDING' } }),
                prisma.order.aggregate({
                    where: { status: { in: ['PAID', 'DELIVERED'] } },
                    _sum: { totalAmount: true },
                }),
            ]),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const [totalOrders, deliveredOrders, pendingOrders, revenueSum] = stats;

        res.render('orders/index', {
            title: 'Quản lý Đơn hàng',
            orders: orders.map(o => ({ ...o, totalAmount: Number(o.totalAmount) })),
            totalOrders,
            deliveredOrders,
            pendingOrders,
            totalRevenue: Number(revenueSum._sum.totalAmount || 0),
            pagination: { page, totalPages, totalCount, limit, hasPrev: page > 1, hasNext: page < totalPages },
            status,
            search,
            success: req.flash('success'),
            error: req.flash('error'),
        });
    } catch (error) {
        console.error('getOrders error:', error);
        req.flash('error', 'Không tải được danh sách đơn hàng.');
        res.redirect('/admin/dashboard');
    }
};

// ============ 2. CHI TIẾT ĐƠN HÀNG ============
exports.getOrderDetail = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, fullName: true, email: true, walletBalance: true } },
                items: { include: { product: true } },
                payment: true,
            },
        });

        if (!order) {
            req.flash('error', 'Không tìm thấy đơn hàng.');
            return res.redirect('/admin/orders');
        }

        const purchaseHistory = await prisma.purchaseHistory.findMany({
            where: { orderId: order.id },
        });

        res.render('orders/detail', {
            title: `Đơn hàng #${order.id.slice(0, 8)}`,
            order: {
                ...order,
                totalAmount: Number(order.totalAmount),
                user: { ...order.user, walletBalance: Number(order.user.walletBalance) },
                items: order.items.map(i => ({ ...i, unitPrice: Number(i.unitPrice) })),
            },
            purchaseHistory: purchaseHistory.map(p => ({ ...p, unitPrice: Number(p.unitPrice) })),
            success: req.flash('success'),
            error: req.flash('error'),
        });
    } catch (error) {
        console.error('getOrderDetail error:', error);
        req.flash('error', 'Lỗi khi tải đơn hàng.');
        res.redirect('/admin/orders');
    }
};

// ============ 3. CẬP NHẬT TRẠNG THÁI ĐƠN ============
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (!['PENDING', 'PAID', 'DELIVERED', 'CANCELLED'].includes(status)) {
            req.flash('error', 'Trạng thái không hợp lệ.');
            return res.redirect(`/admin/orders/${id}`);
        }

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            req.flash('error', 'Không tìm thấy đơn hàng.');
            return res.redirect('/admin/orders');
        }

        // Không cho đổi trạng thái đơn đã DELIVERED hoặc CANCELLED (đã hoàn tất)
        if (order.status === 'DELIVERED' && status !== 'DELIVERED') {
            req.flash('error', 'Đơn hàng đã giao, không thể đổi trạng thái.');
            return res.redirect(`/admin/orders/${id}`);
        }
        if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
            req.flash('error', 'Đơn hàng đã hủy, không thể đổi trạng thái.');
            return res.redirect(`/admin/orders/${id}`);
        }

        await prisma.order.update({ where: { id }, data: { status } });
        req.flash('success', `Đã cập nhật trạng thái thành ${status}.`);
    } catch (error) {
        console.error('updateStatus error:', error);
        req.flash('error', 'Lỗi khi cập nhật trạng thái.');
    }
    res.redirect(`/admin/orders/${id}`);
};