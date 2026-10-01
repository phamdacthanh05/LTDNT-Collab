// src/app/admin/chat/[id].tsx
// File MỚI HOÀN TOÀN.
// Dành riêng cho tài khoản role = ADMIN: xem toàn bộ tin nhắn của 1 hội thoại
// và gửi trả lời cho người mua tương ứng.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchAdminConversationDetail,
  sendAdminReply,
  type AdminChatMessage,
  type AdminConversationDetail,
} from '../../../services/adminSupport.api';
import { COLORS, GlobalStyles } from '../../../styles/GlobalStyles';
import { ExtraStyles } from '../../../styles/ExtraStyles';

// Tự làm mới tin nhắn mỗi 4 giây, giống cách màn hình chat của Buyer đang làm
const POLL_INTERVAL_MS = 4000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [conversation, setConversation] = useState<AdminConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<AdminChatMessage>>(null);

  const load = useCallback(async (silent = false) => {
    try {
      const data = await fetchAdminConversationDetail(id);
      setConversation(data);
      if (!silent) setError(null);
    } catch (err: any) {
      if (!silent) setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.replace('/profile');
      return;
    }
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();

    const interval = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load, authLoading, user]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;

    setSending(true);
    setInput('');
    try {
      await sendAdminReply(id, content);
      await load(true);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && !conversation) {
    return (
      <View style={GlobalStyles.center}>
        <Text style={GlobalStyles.errorText}>{error}</Text>
        <Pressable onPress={() => router.back()} style={GlobalStyles.backButton}>
          <Text style={GlobalStyles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={ExtraStyles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={GlobalStyles.topBack}>
          <Pressable onPress={() => router.back()}>
            <Text style={GlobalStyles.topBackText}>
              {'‹ '}
              {conversation?.user.fullName || 'Khách hàng'}
              {conversation?.subject ? ` — ${conversation.subject}` : ''}
            </Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={conversation?.messages || []}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={ExtraStyles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            // Ở màn hình Admin, tin nhắn của "mình" (Admin) hiển thị lệch phải
            const isMine = item.senderRole === 'ADMIN';
            return (
              <View
                style={[
                  ExtraStyles.bubbleRow,
                  isMine ? ExtraStyles.bubbleRowMine : ExtraStyles.bubbleRowTheirs,
                ]}
              >
                <View style={[ExtraStyles.bubble, isMine ? ExtraStyles.bubbleMine : ExtraStyles.bubbleTheirs]}>
                  <Text style={isMine ? ExtraStyles.bubbleTextMine : ExtraStyles.bubbleTextTheirs}>
                    {item.content}
                  </Text>
                  <Text
                    style={[
                      ExtraStyles.bubbleTime,
                      isMine ? ExtraStyles.bubbleTimeMine : ExtraStyles.bubbleTimeTheirs,
                    ]}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={ExtraStyles.composerRow}>
          <TextInput
            style={ExtraStyles.composerInput}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập trả lời cho khách..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <Pressable
            style={[ExtraStyles.sendButton, (sending || !input.trim()) && ExtraStyles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending || !input.trim()}
          >
            <Text style={ExtraStyles.sendButtonText}>➤</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
