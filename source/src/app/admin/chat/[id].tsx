// src/app/admin/chat/[id].tsx
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
import { ChatStyles as styles } from '../../../styles/ChatStyles';
import { COLORS } from '../../../styles/GlobalStyles';
import { formatTime } from '../../../utils/format';

const POLL_INTERVAL_MS = 4000;

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

  const load = useCallback(
    async (silent = false) => {
      try {
        const data = await fetchAdminConversationDetail(id);
        setConversation(data);
        if (!silent) setError(null);
      } catch (err: any) {
        if (!silent) setError(err.message);
      }
    },
    [id]
  );

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
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error && !conversation) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Text style={{ color: COLORS.danger, fontSize: 14, marginBottom: 16 }}>
          {error}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
        >
          <Text style={styles.emptyButtonText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const customerName = conversation?.user.fullName || 'Khách hàng';
  const subject = conversation?.subject;

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.flex1} edges={['top']}>
        {/* ============ Top Bar ============ */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.heading}>
            <Text style={styles.greeting}>KHÁCH HÀNG</Text>
            <Text style={styles.topTitle} numberOfLines={1}>
              {customerName}
              {subject ? ` · ${subject}` : ''}
            </Text>
          </View>
        </View>

        {/* ============ Messages ============ */}
        <FlatList
          ref={listRef}
          data={conversation?.messages || []}
          keyExtractor={(item) => item.id}
          style={styles.flex1}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMine = item.senderRole === 'ADMIN';
            return (
              <View
                style={[
                  styles.bubbleRow,
                  isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isMine ? styles.bubbleMine : styles.bubbleTheirs,
                  ]}
                >
                  <Text
                    style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}
                  >
                    {item.content}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleTime,
                      isMine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs,
                    ]}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* ============ Composer ============ */}
        <View style={styles.composerRow}>
          <TextInput
            style={styles.composerInput}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập trả lời cho khách..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
          />
          <Pressable
            style={[
              styles.sendButton,
              (sending || !input.trim()) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={sending || !input.trim()}
            accessibilityRole="button"
            accessibilityLabel="Gửi trả lời"
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}