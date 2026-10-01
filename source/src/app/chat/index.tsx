// src/app/chat/index.tsx
// File MỚI HOÀN TOÀN.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { fetchConversations, type ConversationSummary } from '../../services/chat.api';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';
import { ExtraStyles } from '../../styles/ExtraStyles';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

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
      <View style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={ExtraStyles.screen} edges={['top']}>
      <View style={ExtraStyles.screenHeader}>
        <View style={GlobalStyles.productHeaderRow}>
          <Text style={ExtraStyles.screenHeaderTitle}>Tin nhắn</Text>
          <Pressable onPress={() => router.push('/chat/new')} style={GlobalStyles.logoutButton}>
            <Text style={GlobalStyles.logoutText}>+ Liên hệ Shop</Text>
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={GlobalStyles.errorBox}>
          <Text style={GlobalStyles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !error ? (
            <View style={GlobalStyles.center}>
              <Text style={GlobalStyles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={GlobalStyles.emptyText}>
                Bấm nút &quot;+ Liên hệ Shop&quot; ở trên để bắt đầu cuộc trò chuyện đầu tiên.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={ExtraStyles.conversationItem}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <View style={ExtraStyles.conversationAvatar}>
              <Text style={ExtraStyles.conversationAvatarText}>🛎️</Text>
            </View>
            <View style={ExtraStyles.conversationBody}>
              <Text style={ExtraStyles.conversationSubject} numberOfLines={1}>
                {item.subject || item.product?.name || 'Hỗ trợ khách hàng'}
              </Text>
              <Text style={ExtraStyles.conversationLastMessage} numberOfLines={1}>
                {item.lastMessage
                  ? `${item.lastMessage.senderRole === 'USER' ? 'Bạn: ' : ''}${item.lastMessage.content}`
                  : 'Chưa có tin nhắn'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
                {formatTime(item.updatedAt)}
              </Text>
              {item.unreadCount > 0 && (
                <View style={ExtraStyles.unreadBadge}>
                  <Text style={ExtraStyles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
