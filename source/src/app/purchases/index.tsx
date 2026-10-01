// Lịch sử mua hàng của khách: tài khoản + mật khẩu đã mua, tự xoá sau 7 ngày.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { fetchPurchaseHistory, type PurchaseItem } from '../../services/purchase.api';
import { ExtraStyles } from '../../styles/ExtraStyles';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function expireLabel(item: PurchaseItem) {
  if (item.hoursLeft < 1) return 'Sắp bị xoá (dưới 1 giờ)';
  if (item.hoursLeft < 24) return `Sẽ bị xoá sau ${item.hoursLeft} giờ`;
  return `Sẽ bị xoá sau ${item.daysLeft} ngày`;
}

function AccountCard({ item }: { item: PurchaseItem }) {
  const [showPassword, setShowPassword] = useState(false);
  const urgent = item.hoursLeft < 24;

  return (
    <View style={ExtraStyles.purchaseAccount}>
      <Text style={ExtraStyles.purchaseProduct}>{item.productName}</Text>

      <View style={ExtraStyles.purchaseFieldRow}>
        <Text style={ExtraStyles.purchaseFieldLabel}>Tài khoản</Text>
        {/* selectable: nhấn giữ để sao chép */}
        <Text style={ExtraStyles.purchaseFieldValue} selectable>{item.accountUsername}</Text>
      </View>
      <View style={ExtraStyles.purchaseFieldRow}>
        <Text style={ExtraStyles.purchaseFieldLabel}>Mật khẩu</Text>
        <Text style={ExtraStyles.purchaseFieldValue} selectable>
          {showPassword ? item.accountPassword : '••••••••'}
        </Text>
        <Pressable style={ExtraStyles.purchaseToggle} onPress={() => setShowPassword((v) => !v)}>
          <Text style={ExtraStyles.purchaseToggleText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
        </Pressable>
      </View>
      {item.accountNote ? <Text style={ExtraStyles.purchaseNote}>Ghi chú: {item.accountNote}</Text> : null}

      <View
        style={[
          ExtraStyles.expireBadge,
          { backgroundColor: urgent ? COLORS.dangerSoft : COLORS.warningSoft },
        ]}
      >
        <Text style={[ExtraStyles.expireBadgeText, { color: urgent ? COLORS.danger : COLORS.warning }]}>
          ⏳ {expireLabel(item)}
        </Text>
      </View>
    </View>
  );
}

export default function PurchaseHistoryScreen() {
  const router = useRouter();
  const { allowed } = useRoleGuard('BUYER');
  const { showError } = useMessageBox();
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchPurchaseHistory();
      setItems(data.items);
      setNotice(data.notice);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Không tải được lịch sử mua hàng.');
    }
  }, [showError]);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [allowed, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Gom các tài khoản theo đơn hàng
  const groups = useMemo(() => {
    const map = new Map<string, PurchaseItem[]>();
    for (const it of items) {
      const key = it.orderId || it.id;
      map.set(key, [...(map.get(key) || []), it]);
    }
    return Array.from(map.entries());
  }, [items]);

  if (!allowed || loading) {
    return (
      <SafeAreaView style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={ExtraStyles.screen} edges={['top']}>
      <View style={ExtraStyles.screenHeader}>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={GlobalStyles.topBackText}>‹ Trang chủ</Text>
        </Pressable>
        <Text style={[ExtraStyles.screenHeaderTitle, { marginTop: 6 }]}>Lịch sử mua hàng</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={ExtraStyles.noticeBanner}>
          <Text style={ExtraStyles.noticeBannerTitle}>⚠️ Thông báo xoá dữ liệu</Text>
          <Text style={ExtraStyles.noticeBannerText}>
            {notice || 'Lịch sử mua hàng sẽ tự động xoá sau 7 ngày kể từ ngày mua. Hãy lưu lại tài khoản và mật khẩu.'}
          </Text>
        </View>

        {groups.length === 0 ? (
          <View style={[GlobalStyles.center, { paddingTop: 60 }]}>
            <Text style={GlobalStyles.emptyTitle}>Chưa có lịch sử mua hàng</Text>
            <Text style={GlobalStyles.emptyText}>Các tài khoản bạn mua sẽ hiện ở đây trong 7 ngày.</Text>
            <Pressable style={[GlobalStyles.retryButton, { marginTop: 16 }]} onPress={() => router.push('/products')}>
              <Text style={GlobalStyles.retryButtonText}>Xem sản phẩm</Text>
            </Pressable>
          </View>
        ) : (
          groups.map(([key, list]) => (
            <View key={key} style={ExtraStyles.purchaseGroup}>
              <View style={ExtraStyles.purchaseGroupHeader}>
                <Text style={ExtraStyles.purchaseGroupTitle}>
                  Đơn #{(list[0].orderId || key).slice(0, 8)} · {list.length} tài khoản
                </Text>
                <Text style={ExtraStyles.purchaseGroupDate}>{formatDate(list[0].purchasedAt)}</Text>
              </View>
              {list.map((it) => (
                <AccountCard key={it.id} item={it} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
