// Lịch sử mua hàng của khách: tài khoản + mật khẩu đã mua, tự xoá sau 7 ngày.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { fetchPurchaseHistory, type PurchaseItem } from '../../services/purchase.api';
import { COLORS } from '../../styles/GlobalStyles';
import { PurchaseStyles as styles } from '../../styles/PurchaseStyles';
import { formatDate } from '../../utils/format';

function expireLabel(item: PurchaseItem) {
  if (item.hoursLeft < 1) return 'Sắp bị xoá (dưới 1 giờ)';
  if (item.hoursLeft < 24) return `Sẽ bị xoá sau ${item.hoursLeft} giờ`;
  return `Sẽ bị xoá sau ${item.daysLeft} ngày`;
}

/* ------------------------------------------------------------------ */
/*  Account Card                                                       */
/* ------------------------------------------------------------------ */
function AccountCard({ item, isFirst }: { item: PurchaseItem; isFirst: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const urgent = item.hoursLeft < 24;

  return (
    <View style={[styles.accountCard, isFirst && styles.accountCardFirst]}>
      <Text style={styles.accountProduct}>{item.productName}</Text>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Tài khoản</Text>
        <Text style={[styles.fieldValue, styles.fieldValueMono]} selectable>
          {item.accountUsername}
        </Text>
      </View>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Mật khẩu</Text>
        <Text style={[styles.fieldValue, styles.fieldValueMono]} selectable>
          {showPassword ? item.accountPassword : '••••••••'}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.toggleBtn, pressed && styles.pressed]}
          onPress={() => setShowPassword((v) => !v)}
        >
          <Text style={styles.toggleBtnText}>{showPassword ? 'Ẩn' : 'Hiện'}</Text>
        </Pressable>
      </View>

      {item.accountNote ? (
        <View style={styles.noteRow}>
          <Text style={styles.noteIcon}>📝</Text>
          <Text style={styles.noteText}>{item.accountNote}</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.expireBadge,
          urgent ? styles.expireBadgeUrgent : styles.expireBadgeNormal,
        ]}
      >
        <Text
          style={[
            styles.expireBadgeText,
            urgent ? styles.expireBadgeTextUrgent : styles.expireBadgeTextNormal,
          ]}
        >
          ⏳ {expireLabel(item)}
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */
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
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main} edges={['top', 'bottom']}>
      {/* ============ Top Bar đồng bộ Dashboard ============ */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Về trang chủ"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.greeting}>TÀI KHOẢN ĐÃ MUA</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Lịch sử mua hàng
          </Text>
        </View>

        {items.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{items.length}</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ============ Notice ============ */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeIcon}>⚠️</Text>
          <View style={styles.noticeBody}>
            <Text style={styles.noticeTitle}>Dữ liệu sẽ tự xoá sau 7 ngày</Text>
            <Text style={styles.noticeText}>
              {notice ||
                'Lịch sử mua hàng sẽ tự động xoá sau 7 ngày kể từ ngày mua. Hãy lưu lại tài khoản và mật khẩu.'}
            </Text>
          </View>
        </View>

        {/* ============ Danh sách đơn hàng ============ */}
        {groups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Chưa có lịch sử mua hàng</Text>
            <Text style={styles.emptyText}>
              Các tài khoản bạn mua sẽ hiện ở đây trong 7 ngày.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
              onPress={() => router.push('/products')}
            >
              <Text style={styles.emptyButtonText}>Xem sản phẩm</Text>
            </Pressable>
          </View>
        ) : (
          groups.map(([key, list]) => {
            const orderCode = (list[0].orderId || key).slice(0, 8).toUpperCase();
            return (
              <View key={key} style={styles.group}>
                {/* Group header */}
                <View style={styles.groupHeader}>
                  <View style={styles.groupHeaderLeft}>
                    <View style={styles.groupIconWrap}>
                      <Text style={styles.groupIcon}>📦</Text>
                    </View>
                    <View style={styles.groupBody}>
                      <Text style={styles.groupTitle} numberOfLines={1}>
                        Đơn #{orderCode}
                      </Text>
                      <Text style={styles.groupDate}>
                        {formatDate(list[0].purchasedAt)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.groupCount}>{list.length} TK</Text>
                </View>

                {/* Danh sách tài khoản trong đơn */}
                {list.map((it, idx) => (
                  <AccountCard key={it.id} item={it} isFirst={idx === 0} />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}