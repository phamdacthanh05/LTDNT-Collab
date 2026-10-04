// src/services/adminSupport.api.ts
// File MỚI HOÀN TOÀN — chỉ import `api` (axios instance có sẵn) từ api.ts, không sửa file đó.
// Dùng cho màn hình dành riêng cho Admin (role = ADMIN) xem & trả lời hội thoại của Buyer.
import { api } from './api';

export type AdminChatMessage = {
  id: string;
  conversationId: string;
  senderRole: 'USER' | 'ADMIN';
  senderUserId?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type AdminConversationSummary = {
  id: string;
  subject?: string | null;
  user: { id: string; fullName: string; email: string }; // người mua đã gửi hội thoại này
  product?: { id: string; name: string } | null;
  updatedAt: string;
  lastMessage: AdminChatMessage | null;
};

export type AdminConversationDetail = {
  id: string;
  subject?: string | null;
  user: { id: string; fullName: string; email: string };
  product?: { id: string; name: string } | null;
  order?: { id: string; status: string } | null;
  messages: AdminChatMessage[];
};

// Danh sách toàn bộ hội thoại từ mọi người mua (dành cho Admin)
export async function fetchAdminConversations() {
  const { data } = await api.get<{ conversations: AdminConversationSummary[] }>(
    '/admin-support/conversations'
  );
  return data.conversations;
}

// Chi tiết 1 hội thoại bất kỳ + toàn bộ tin nhắn (dành cho Admin)
export async function fetchAdminConversationDetail(id: string) {
  const { data } = await api.get<{ conversation: AdminConversationDetail }>(
    `/admin-support/conversations/${id}`
  );
  return data.conversation;
}

// Admin gửi tin nhắn trả lời trong 1 hội thoại
export async function sendAdminReply(conversationId: string, content: string) {
  const { data } = await api.post<{ message: AdminChatMessage }>(
    `/admin-support/conversations/${conversationId}/messages`,
    { content }
  );
  return data.message;
}
