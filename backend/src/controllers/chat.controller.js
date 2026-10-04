// src/controllers/chat.controller.js
// File MỚI HOÀN TOÀN.
//
// Lưu ý thiết kế: đây là shop 1 chủ (không phải sàn đa người bán) nên "người bán" = Admin/Shop,
// không phải một User cụ thể. Vì dự án hiện chưa có hệ thống tài khoản Admin riêng, các route
// phía Admin (adminReply, adminListConversations, adminGetConversation) được bảo vệ tạm bằng
// một "khoá bí mật" đơn giản (header x-admin-secret khớp với biến ADMIN_SECRET trong .env),
// KHÔNG dùng JWT. Đây là giải pháp tạm để bạn test 2 chiều ngay; khi cần bạn có thể thay bằng
// một hệ thống tài khoản Admin thật (route/controller mới khác) mà không ảnh hưởng phần này.
const prisma = require('../prisma');

// ---------- Phía người mua (yêu cầu đăng nhập, lấy danh tính qua req.userId từ token) ----------

// POST /api/chat/conversations   body: { productId?, orderId?, subject?, message }
// Tạo cuộc trò chuyện mới kèm tin nhắn đầu tiên
async function createConversation(req, res) {
  try {
    const { productId, orderId, subject, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    if (orderId) {
      const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.userId } });
      if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.userId,
        productId: productId || null,
        orderId: orderId || null,
        subject: subject || null,
        messages: {
          create: {
            senderRole: 'USER',
            senderUserId: req.userId,
            content: message.trim(),
          },
        },
      },
      include: { messages: true, product: true, order: true },
    });

    res.status(201).json({ conversation });
  } catch (err) {
    console.error('chat createConversation error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// GET /api/chat/conversations  -> danh sách hội thoại của user hiện tại, kèm tin nhắn cuối + số tin chưa đọc
async function listMyConversations(req, res) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      include: {
        product: { select: { id: true, name: true } },
        order: { select: { id: true, status: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }, // chỉ lấy tin nhắn cuối để hiển thị preview
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await prisma.message.count({
          where: { conversationId: c.id, senderRole: 'ADMIN', isRead: false },
        });
        return {
          id: c.id,
          subject: c.subject,
          product: c.product,
          order: c.order,
          updatedAt: c.updatedAt,
          lastMessage: c.messages[0] || null,
          unreadCount,
        };
      })
    );

    res.json({ conversations: result });
  } catch (err) {
    console.error('chat listMyConversations error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// GET /api/chat/conversations/:id  -> chi tiết 1 hội thoại + toàn bộ tin nhắn (chỉ chủ hội thoại xem được)
async function getConversationDetail(req, res) {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        product: { select: { id: true, name: true } },
        order: { select: { id: true, status: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy hội thoại' });

    // Khi người mua mở hội thoại ra xem, đánh dấu các tin nhắn từ ADMIN là đã đọc
    await prisma.message.updateMany({
      where: { conversationId: conversation.id, senderRole: 'ADMIN', isRead: false },
      data: { isRead: true },
    });

    res.json({ conversation });
  } catch (err) {
    console.error('chat getConversationDetail error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// POST /api/chat/conversations/:id/messages   body: { content }
async function sendMessage(req, res) {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy hội thoại' });

    const [newMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderRole: 'USER',
          senderUserId: req.userId,
          content: content.trim(),
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }, // đẩy hội thoại lên đầu danh sách
      }),
    ]);

    res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error('chat sendMessage error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// ---------- Phía Admin/Shop (bảo vệ tạm bằng ADMIN_SECRET, xem middleware trong chat.routes.js) ----------

// GET /api/chat/admin/conversations -> toàn bộ hội thoại (để admin chọn trả lời)
async function adminListConversations(req, res) {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ conversations });
  } catch (err) {
    console.error('chat adminListConversations error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// GET /api/chat/admin/conversations/:id -> chi tiết hội thoại bất kỳ (không giới hạn theo userId)
async function adminGetConversationDetail(req, res) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy hội thoại' });
    res.json({ conversation });
  } catch (err) {
    console.error('chat adminGetConversationDetail error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

// POST /api/chat/admin/conversations/:id/messages   body: { content }
async function adminReply(req, res) {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation) return res.status(404).json({ message: 'Không tìm thấy hội thoại' });

    const [newMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderRole: 'ADMIN',
          senderUserId: null,
          content: content.trim(),
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error('chat adminReply error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại' });
  }
}

module.exports = {
  createConversation,
  listMyConversations,
  getConversationDetail,
  sendMessage,
  adminListConversations,
  adminGetConversationDetail,
  adminReply,
};
