// src/controllers/adminWeb/support.controller.js
const prisma = require('../../prisma');

// ============ 1. DANH SÁCH HỘI THOẠI ============
exports.getConversations = async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.render('support/index', {
            title: 'Hỗ trợ Chat',
            conversations,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Không tải được danh sách hội thoại.');
        res.redirect('/admin/dashboard');
    }
};

// ============ 2. CHI TIẾT HỘI THOẠI ============
exports.getChatDetail = async (req, res) => {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                product: { select: { id: true, name: true } },
                messages: { orderBy: { createdAt: 'asc' } }
            }
        });

        if (!conversation) {
            req.flash('error', 'Không tìm thấy hội thoại.');
            return res.redirect('/admin/support');
        }

        // Đánh dấu tin nhắn của USER là đã đọc khi admin mở xem
        await prisma.message.updateMany({
            where: { conversationId: conversation.id, senderRole: 'USER', isRead: false },
            data: { isRead: true }
        });

        res.render('support/chat', {
            title: `Chat với ${conversation.user.fullName}`,
            conversation,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Lỗi khi tải hội thoại.');
        res.redirect('/admin/support');
    }
};

// ============ 3. ADMIN TRẢ LỜI ============
exports.postReply = async (req, res) => {
    const { content } = req.body;
    const { id } = req.params;

    if (content && content.trim()) {
        try {
            await prisma.$transaction([
                prisma.message.create({
                    data: {
                        conversationId: id,
                        senderRole: 'ADMIN',
                        senderUserId: null,
                        content: content.trim()
                    }
                }),
                prisma.conversation.update({
                    where: { id },
                    data: { updatedAt: new Date() }
                })
            ]);
        } catch (error) {
            console.error(error);
            req.flash('error', 'Không gửi được tin nhắn.');
        }
    }
    res.redirect(`/admin/support/${id}`);
};