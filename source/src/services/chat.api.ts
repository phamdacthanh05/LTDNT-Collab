// src/services/chat.api.ts
// File MỚI HOÀN TOÀN — chỉ import `api` (axios instance có sẵn) từ api.ts, không sửa file đó.
import { api } from './api';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderRole: 'USER' | 'ADMIN';
  senderUserId?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  subject?: string | null;
  product?: { id: string; name: string } | null;
  order?: { id: string; status: string } | null;
  updatedAt: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
};

export type ConversationDetail = {
  id: string;
  subject?: string | null;
  product?: { id: string; name: string } | null;
  order?: { id: string; status: string } | null;
  messages: ChatMessage[];
};

// Danh sách hội thoại của tôi
export async function fetchConversations() {
  const { data } = await api.get<{ conversations: ConversationSummary[] }>('/chat/conversations');
  return data.conversations;
}

// Chi tiết 1 hội thoại + toàn bộ tin nhắn
export async function fetchConversationDetail(id: string) {
  const { data } = await api.get<{ conversation: ConversationDetail }>(`/chat/conversations/${id}`);
  return data.conversation;
}

// Tạo hội thoại mới (vd bấm "Nhắn tin" từ trang chi tiết sản phẩm)
export async function startConversation(payload: {
  message: string;
  productId?: string;
  orderId?: string;
  subject?: string;
}) {
  const { data } = await api.post<{ conversation: ConversationDetail }>(
    '/chat/conversations',
    payload
  );
  return data.conversation;
}

// Gửi tin nhắn tiếp theo trong 1 hội thoại đã có
export async function sendChatMessage(conversationId: string, content: string) {
  const { data } = await api.post<{ message: ChatMessage }>(
    `/chat/conversations/${conversationId}/messages`,
    { content }
  );
  return data.message;
}
