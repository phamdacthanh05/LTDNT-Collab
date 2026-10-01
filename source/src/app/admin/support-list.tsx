// src/app/admin/support-list.tsx
// File MỚI HOÀN TOÀN.
// Dành riêng cho tài khoản role = ADMIN (chủ shop duy nhất): xem danh sách mọi
// cuộc trò chuyện mà người mua đã gửi tới, để chọn vào trả lời.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAdminConversations, type AdminConversationSummary } from '../../services/adminSupport.api';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';
import { ExtraStyles } from '../../styles/ExtraStyles';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

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
    // Chặn Buyer truy cập trực tiếp màn hình Admin bằng cách gõ URL
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
      <View style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={ExtraStyles.screen} edges={['top']}>
      <View style={ExtraStyles.screenHeader}>
        <View style={GlobalStyles.productHeaderRow}>
          <Text style={ExtraStyles.screenHeaderTitle}>Hội thoại khách hàng</Text>
          <Pressable onPress={() => router.push('/profile')} style={GlobalStyles.logoutButton}>
            <Text style={GlobalStyles.logoutText}>Trang cá nhân</Text>
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
              <Text style={GlobalStyles.emptyTitle}>Chưa có hội thoại nào</Text>
              <Text style={GlobalStyles.emptyText}>
                Khi người mua gửi tin nhắn hỏi/hỗ trợ, hội thoại sẽ hiện ở đây.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={ExtraStyles.conversationItem}
            onPress={() => router.push(`/admin/chat/${item.id}`)}
          >
            <View style={ExtraStyles.conversationAvatar}>
              <Text style={ExtraStyles.conversationAvatarText}>🙋</Text>
            </View>
            <View style={ExtraStyles.conversationBody}>
              <Text style={ExtraStyles.conversationSubject} numberOfLines={1}>
                {item.user.fullName} ({item.user.email})
              </Text>
              <Text style={ExtraStyles.conversationLastMessage} numberOfLines={1}>
                {item.lastMessage
                  ? `${item.lastMessage.senderRole === 'ADMIN' ? 'Bạn: ' : ''}${item.lastMessage.content}`
                  : item.subject || 'Chưa có tin nhắn'}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.textMuted }}>{formatTime(item.updatedAt)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
