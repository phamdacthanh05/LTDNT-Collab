// src/controllers/adminWeb/user.controller.js
const prisma = require('../../prisma');

// ============ 1. DANH SÁCH NGƯỜI DÙNG ============
exports.getUsers = async (req, res) => {
    try {
        const search = (req.query.q || '').trim();
        const role = req.query.role || ''; // 'ADMIN' | 'BUYER' | ''
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 20;
        const skip = (page - 1) * limit;

        const where = {};
        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
            ];
        }
        if (role && ['ADMIN', 'BUYER'].includes(role)) {
            where.role = role;
        }

        const [users, totalCount, stats] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true, fullName: true, email: true, role: true,
                    walletBalance: true, address: true, createdAt: true,
                    _count: { select: { orders: true } },
                },
            }),
            prisma.user.count({ where }),
            Promise.all([
                prisma.user.count({ where: { role: 'BUYER' } }),
                prisma.user.count({ where: { role: 'ADMIN' } }),
                prisma.user.aggregate({
                    where: { role: 'BUYER' },
                    _sum: { walletBalance: true },
                }),
            ]),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const [totalBuyers, totalAdmins, walletSum] = stats;

        res.render('users/index', {
            title: 'Quản lý Người dùng',
            users: users.map(u => ({
                ...u,
                walletBalance: Number(u.walletBalance),
            })),
            totalBuyers,
            totalAdmins,
            totalWallet: Number(walletSum._sum.walletBalance || 0),
            pagination: {
                page,
                totalPages,
                totalCount,
                limit,
                hasPrev: page > 1,
                hasNext: page < totalPages,
            },
            search,
            role,
            success: req.flash('success'),
            error: req.flash('error'),
        });
    } catch (error) {
        console.error('getUsers error:', error);
        req.flash('error', 'Không tải được danh sách người dùng.');
        res.redirect('/admin/dashboard');
    }
};

// ============ 2. CHI TIẾT 1 USER ============
exports.getUserDetail = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, fullName: true, email: true, role: true,
                walletBalance: true, address: true, createdAt: true, updatedAt: true,
            },
        });

        if (!user) {
            req.flash('error', 'Không tìm thấy người dùng.');
            return res.redirect('/admin/users');
        }

        const [orders, walletTransactions, purchaseHistory] = await Promise.all([
            prisma.order.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { items: { include: { product: { select: { name: true } } } } },
            }),
            prisma.walletTransaction.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            prisma.purchaseHistory.findMany({
                where: { userId: user.id },
                orderBy: { purchasedAt: 'desc' },
                take: 10,
            }),
        ]);

        res.render('users/detail', {
            title: `Người dùng: ${user.fullName}`,
            user: { ...user, walletBalance: Number(user.walletBalance) },
            orders: orders.map(o => ({ ...o, totalAmount: Number(o.totalAmount) })),
            walletTransactions: walletTransactions.map(t => ({
                ...t,
                amount: Number(t.amount),
                balanceAfter: t.balanceAfter ? Number(t.balanceAfter) : null,
            })),
            purchaseHistory: purchaseHistory.map(p => ({
                ...p,
                unitPrice: Number(p.unitPrice),
            })),
            success: req.flash('success'),
            error: req.flash('error'),
        });
    } catch (error) {
        console.error('getUserDetail error:', error);
        req.flash('error', 'Lỗi khi tải thông tin người dùng.');
        res.redirect('/admin/users');
    }
};

// ============ 3. CỘNG / TRỪ TIỀN VÍ (ADMIN) ============
exports.adjustWallet = async (req, res) => {
    const { userId } = req.params;
    const { amount, type, reason } = req.body;

    try {
        const adjustAmount = parseInt(amount);
        if (!Number.isInteger(adjustAmount) || adjustAmount <= 0) {
            req.flash('error', 'Số tiền phải là số nguyên dương.');
            return res.redirect(`/admin/users/${userId}`);
        }
        if (!['CREDIT', 'DEBIT'].includes(type)) {
            req.flash('error', 'Loại giao dịch không hợp lệ.');
            return res.redirect(`/admin/users/${userId}`);
        }

        const result = await prisma.$transaction(async (tx) => {
            // Khoá dòng user
            await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error('Không tìm thấy người dùng.');

            const currentBalance = Number(user.walletBalance);
            const newBalance = type === 'CREDIT'
                ? currentBalance + adjustAmount
                : currentBalance - adjustAmount;

            if (newBalance < 0) {
                throw new Error(`Số dư không đủ. Hiện có ${currentBalance.toLocaleString('vi-VN')}đ, không thể trừ ${adjustAmount.toLocaleString('vi-VN')}đ.`);
            }

            await tx.user.update({
                where: { id: userId },
                data: { walletBalance: newBalance },
            });

            await tx.walletTransaction.create({
                data: {
                    userId,
                    type: type === 'CREDIT' ? 'TOPUP' : 'REFUND',
                    status: 'SUCCESS',
                    amount: adjustAmount,
                    balanceAfter: newBalance,
                    description: reason || (type === 'CREDIT' ? 'Admin cộng tiền' : 'Admin trừ tiền'),
                },
            });

            return { newBalance };
        });

        req.flash('success', `Đã ${type === 'CREDIT' ? 'cộng' : 'trừ'} ${adjustAmount.toLocaleString('vi-VN')}đ. Số dư mới: ${result.newBalance.toLocaleString('vi-VN')}đ`);
    } catch (error) {
        console.error('adjustWallet error:', error);
        req.flash('error', error.message || 'Lỗi khi điều chỉnh ví.');
    }
    res.redirect(`/admin/users/${userId}`);
};

// ============ 4. ĐỔI ROLE (CẨN THẬN) ============
exports.changeRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
        if (!['ADMIN', 'BUYER'].includes(role)) {
            req.flash('error', 'Role không hợp lệ.');
            return res.redirect(`/admin/users/${userId}`);
        }

        // Không cho tự đổi role của chính mình
        if (userId === req.session.adminId) {
            req.flash('error', 'Không thể đổi role của chính bạn.');
            return res.redirect(`/admin/users/${userId}`);
        }

        await prisma.user.update({ where: { id: userId }, data: { role } });
        req.flash('success', `Đã đổi role thành ${role}.`);
    } catch (error) {
        console.error('changeRole error:', error);
        req.flash('error', 'Lỗi khi đổi role.');
    }
    res.redirect(`/admin/users/${userId}`);
};