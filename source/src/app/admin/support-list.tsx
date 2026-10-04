// src/app/admin/support-list.tsx
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
import {
  fetchAdminConversations,
  type AdminConversationSummary,
} from '../../services/adminSupport.api';
import { ChatStyles as styles } from '../../styles/ChatStyles';
import { COLORS } from '../../styles/GlobalStyles';
import { formatShortDate } from '../../utils/format';

export default function AdminSupportListScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<AdminConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAdminConversations();
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
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.replace('/profile');
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

  if (loading || authLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

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
          <Text style={styles.greeting}>
            HỘI THOẠI KHÁCH HÀNG
            {conversations.length > 0 ? ` · ${conversations.length}` : ''}
          </Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Hỗ trợ người mua
          </Text>
        </View>
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
              <Text style={styles.emptyTitle}>Chưa có hội thoại nào</Text>
              <Text style={styles.emptyText}>
                Khi người mua gửi tin nhắn hỏi/hỗ trợ, hội thoại sẽ hiện ở đây.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.conversationItem, pressed && styles.pressed]}
            onPress={() => router.push(`/admin/chat/${item.id}` as any)}
          >
            <View style={styles.conversationAvatar}>
              <Text style={styles.conversationAvatarText}>🙋</Text>
            </View>

            <View style={styles.conversationBody}>
              <Text style={styles.conversationSubject} numberOfLines={1}>
                {item.user.fullName}
              </Text>
              <Text style={styles.conversationLastMessage} numberOfLines={1}>
                {item.lastMessage
                  ? `${item.lastMessage.senderRole === 'ADMIN' ? 'Bạn: ' : ''}${item.lastMessage.content}`
                  : item.subject || 'Chưa có tin nhắn'}
              </Text>
            </View>

            <View style={styles.conversationMeta}>
              <Text style={styles.conversationTime}>
                {formatShortDate(item.updatedAt)}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}