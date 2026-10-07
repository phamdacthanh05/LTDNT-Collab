// src/controllers/adminWeb/wallet.controller.js
const prisma = require('../../prisma');

exports.getTransactions = async (req, res) => {
    try {
        const type = req.query.type || '';
        const search = (req.query.q || '').trim();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 30;
        const skip = (page - 1) * limit;

        const where = {};
        if (type && ['TOPUP', 'PURCHASE', 'REFUND'].includes(type)) {
            where.type = type;
        }
        if (search) {
            where.OR = [
                { user: { fullName: { contains: search } } },
                { user: { email: { contains: search } } },
                { description: { contains: search } },
            ];
        }

        const [transactions, totalCount, stats] = await Promise.all([
            prisma.walletTransaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { user: { select: { fullName: true, email: true } } },
            }),
            prisma.walletTransaction.count({ where }),
            Promise.all([
                prisma.walletTransaction.aggregate({
                    where: { type: 'TOPUP', status: 'SUCCESS' },
                    _sum: { amount: true },
                }),
                prisma.walletTransaction.aggregate({
                    where: { type: 'PURCHASE', status: 'SUCCESS' },
                    _sum: { amount: true },
                }),
                prisma.walletTransaction.aggregate({
                    where: { type: 'REFUND', status: 'SUCCESS' },
                    _sum: { amount: true },
                }),
            ]),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const [topupSum, purchaseSum, refundSum] = stats;

        res.render('wallet/index', {
            title: 'Giao dịch Ví',
            transactions: transactions.map(t => ({
                ...t,
                amount: Number(t.amount),
                balanceAfter: t.balanceAfter ? Number(t.balanceAfter) : null,
            })),
            totalTopup: Number(topupSum._sum.amount || 0),
            totalPurchase: Number(purchaseSum._sum.amount || 0),
            totalRefund: Number(refundSum._sum.amount || 0),
            pagination: { page, totalPages, totalCount, limit, hasPrev: page > 1, hasNext: page < totalPages },
            type,
            search,
            success: req.flash('success'),
            error: req.flash('error'),
        });
    } catch (error) {
        console.error('getTransactions error:', error);
        req.flash('error', 'Không tải được giao dịch.');
        res.redirect('/admin/dashboard');
    }
};