// src/controllers/adminSupport.controller.js
// File MỚI HOÀN TOÀN.
//
// LƯU Ý THIẾT KẾ QUAN TRỌNG:
// Dự án đã có sẵn model Conversation/Message + toàn bộ logic nghiệp vụ phía Admin
// (adminListConversations, adminGetConversationDetail, adminReply) trong
// `chat.controller.js`. Để tránh tạo ra 2 hệ thống chat song song (dữ liệu trùng lặp,
// dễ lệch nhau), controller này KHÔNG viết lại logic đó, mà chỉ tái sử dụng
// (require + export lại) các hàm đã có. Phần thêm mới thực sự ở đây là CÁCH XÁC THỰC:
// route của controller này được bảo vệ bằng JWT + role ADMIN (xem adminSupport.routes.js
// và adminRole.middleware.js) — dành cho khi bạn đã có tài khoản ADMIN đăng nhập thật,
// thay cho cơ chế x-admin-secret tạm thời trước đó (vẫn được giữ nguyên, không xoá).
const chatController = require('./chat.controller');

module.exports = {
  // GET /api/admin-support/conversations
  listConversations: chatController.adminListConversations,

  // GET /api/admin-support/conversations/:id
  getConversationDetail: chatController.adminGetConversationDetail,

  // POST /api/admin-support/conversations/:id/messages   body: { content }
  reply: chatController.adminReply,
};
