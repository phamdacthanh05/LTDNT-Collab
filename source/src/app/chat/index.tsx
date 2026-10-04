// src/app/chat/index.tsx
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { fetchConversations, type ConversationSummary } from '../../services/chat.api';
import { ChatStyles as styles } from '../../styles/ChatStyles';
import { COLORS } from '../../styles/GlobalStyles';
import { formatShortDate } from '../../utils/format';

export default function ChatListScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchConversations();
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
      return;
    }
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [authLoading, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <SafeAreaView style={styles.main} edges={['top', 'bottom']}>
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
          <Text style={styles.greeting}>HỘP THƯ</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Tin nhắn
            {totalUnread > 0 ? ` · ${totalUnread} chưa đọc` : ''}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/chat/new')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Liên hệ Shop"
        >
          <Text style={styles.iconButtonText}>＋</Text>
        </Pressable>
      </View>

      {/* ============ Error ============ */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ============ Danh sách hội thoại ============ */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptyText}>
                Bấm nút ＋ ở trên để bắt đầu cuộc trò chuyện đầu tiên với Shop.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                onPress={() => router.push('/chat/new')}
              >
                <Text style={styles.emptyButtonText}>Liên hệ Shop</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.conversationItem, pressed && styles.pressed]}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <View style={styles.conversationAvatar}>
              <Text style={styles.conversationAvatarText}>🛎️</Text>
            </View>

            <View style={styles.conversationBody}>
              <Text style={styles.conversationSubject} numberOfLines={1}>
                {item.subject || item.product?.name || 'Hỗ trợ khách hàng'}
              </Text>
              <Text style={styles.conversationLastMessage} numberOfLines={1}>
                {item.lastMessage
                  ? `${item.lastMessage.senderRole === 'USER' ? 'Bạn: ' : ''}${item.lastMessage.content}`
                  : 'Chưa có tin nhắn'}
              </Text>
            </View>

            <View style={styles.conversationMeta}>
              <Text style={styles.conversationTime}>
                {formatShortDate(item.updatedAt)}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}