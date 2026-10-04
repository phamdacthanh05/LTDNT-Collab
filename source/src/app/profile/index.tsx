import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useAuth } from '../../contexts/AuthContext';
import {
  changeMyPassword,
  fetchMyOrderHistory,
  fetchProfile,
  updateProfile,
  type Profile,
  type ProfileOrder,
} from '../../services/profile.api';
import { COLORS } from '../../styles/GlobalStyles';
import { ProfileStyles as styles } from '../../styles/ProfileStyles';
import { formatMoney } from '../../utils/format';

const ORDER_STATUS_LABEL: Record<ProfileOrder['status'], string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
};

const ORDER_STATUS_COLOR: Record<
  ProfileOrder['status'],
  { bg: string; text: string }
> = {
  PENDING: { bg: COLORS.warningSoft, text: COLORS.warning },
  PAID: { bg: COLORS.successSoft, text: COLORS.success },
  DELIVERED: { bg: COLORS.primarySoft, text: COLORS.primaryDark },
  CANCELLED: { bg: COLORS.dangerSoft, text: COLORS.danger },
};

type Tab = 'info' | 'password' | 'orders';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { showMessage, showError, showSuccess } = useMessageBox();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(
    initialTab === 'orders' || initialTab === 'password' ? initialTab : 'info'
  );

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProfile();
      setProfile(data);
      setFullName(data.fullName);
      setAddress(data.address || '');
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
      await loadProfile();
      setLoading(false);
    })();
  }, [authLoading, user]);

  useEffect(() => {
    if (tab === 'orders' && orders.length === 0) {
      (async () => {
        setOrdersLoading(true);
        try {
          const data = await fetchMyOrderHistory();
          setOrders(data);
        } catch (err: any) {
          showError(err.message);
        } finally {
          setOrdersLoading(false);
        }
      })();
    }
  }, [tab]);

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const updated = await updateProfile({ fullName, address });
      setProfile(updated);
      showSuccess('Đã cập nhật thông tin tài khoản.');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showMessage({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận.',
      });
      return;
    }
    if (newPassword.length < 6) {
      showMessage({
        type: 'warning',
        title: 'Mật khẩu quá ngắn',
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage({
        type: 'warning',
        title: 'Mật khẩu không khớp',
        message: 'Mật khẩu xác nhận không giống mật khẩu mới.',
      });
      return;
    }
    setChangingPassword(true);
    try {
      await changeMyPassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Đã đổi mật khẩu thành công.');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    showMessage({
      type: 'warning',
      title: 'Đăng xuất?',
      message: 'Bạn có chắc muốn đăng xuất khỏi tài khoản này?',
      confirmText: 'Đăng xuất',
      cancelText: 'Ở lại',
      onConfirm: async () => {
        try {
          await logout();
          router.replace('/auth/login');
        } catch (err: any) {
          showError(err?.message || 'Không thể đăng xuất.');
        }
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Text style={{ color: COLORS.danger, fontSize: 14 }}>
          {error || 'Không tải được thông tin'}
        </Text>
      </SafeAreaView>
    );
  }

  const isAdmin = profile.role === 'ADMIN';
  const initials = (profile.fullName || '?').trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.main} edges={['top']}>
      {/* ============ Top Bar với nút BACK ============ */}
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
          <Text style={styles.greeting}>{isAdmin ? 'QUẢN TRỊ VIÊN' : 'TÀI KHOẢN'}</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            {isAdmin ? 'Hồ sơ quản trị' : 'Tài khoản của tôi'}
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
        >
          <Text style={styles.logoutIcon}>⏻</Text>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>

      {/* ============ Profile Hero ============ */}
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileHeroBody}>
          <Text style={styles.profileName} numberOfLines={1}>
            {profile.fullName}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {profile.email}
          </Text>
          <View style={[styles.rolePill, isAdmin && styles.rolePillAdmin]}>
            <Text
              style={[styles.rolePillText, isAdmin && styles.rolePillTextAdmin]}
            >
              {isAdmin ? '👑 Quản trị viên' : '🛍️ Khách hàng'}
            </Text>
          </View>
        </View>
      </View>

      {/* ============ Wallet Hero ============ */}
      {!isAdmin && (
        <View style={styles.walletHero}>
          <View style={styles.walletHeroBlobA} />
          <View style={styles.walletHeroBlobB} />

          <Text style={styles.walletHeroLabel}>SỐ DƯ VÍ</Text>
          <Text style={styles.walletHeroAmount}>
            {formatMoney(profile.walletBalance ?? '0')}
          </Text>

          <Pressable
            onPress={() => router.push('/wallet' as any)}
            style={({ pressed }) => [styles.walletHeroBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.walletHeroBtnText}>＋ Nạp tiền / Lịch sử ví</Text>
          </Pressable>
        </View>
      )}

      {/* ============ Admin Quick Actions ============ */}
      {isAdmin && (
        <>
          <Text style={styles.adminSectionTitle}>TÁC VỤ QUẢN TRỊ</Text>

          <Pressable
            onPress={() => router.push('/admin/support-list' as any)}
            style={({ pressed }) => [styles.adminActionCard, pressed && styles.pressed]}
          >
            <View style={styles.adminActionIcon}>
              <Text style={styles.adminActionIconText}>💬</Text>
            </View>
            <View style={styles.adminActionBody}>
              <Text style={styles.adminActionLabel}>Hội thoại khách hàng</Text>
              <Text style={styles.adminActionHint}>Xem & trả lời tin nhắn</Text>
            </View>
            <Text style={styles.adminActionChevron}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/admin/products' as any)}
            style={({ pressed }) => [styles.adminActionCard, pressed && styles.pressed]}
          >
            <View style={styles.adminActionIcon}>
              <Text style={styles.adminActionIconText}>🛍️</Text>
            </View>
            <View style={styles.adminActionBody}>
              <Text style={styles.adminActionLabel}>Quản lý sản phẩm</Text>
              <Text style={styles.adminActionHint}>Thêm, sửa, xoá sản phẩm</Text>
            </View>
            <Text style={styles.adminActionChevron}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/admin/accounts' as any)}
            style={({ pressed }) => [styles.adminActionCard, pressed && styles.pressed]}
          >
            <View style={styles.adminActionIcon}>
              <Text style={styles.adminActionIconText}>🗄️</Text>
            </View>
            <View style={styles.adminActionBody}>
              <Text style={styles.adminActionLabel}>Kho tài khoản</Text>
              <Text style={styles.adminActionHint}>Nhập & kiểm soát kho</Text>
            </View>
            <Text style={styles.adminActionChevron}>›</Text>
          </Pressable>
        </>
      )}

      {/* ============ Tab Bar ============ */}
      <View style={styles.tabBar}>
        {(
          [
            { key: 'info', label: 'Thông tin' },
            { key: 'password', label: 'Mật khẩu' },
            ...(isAdmin ? [] : [{ key: 'orders', label: 'Đơn hàng' }]),
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tabButton, tab === t.key && styles.tabButtonActive]}
            onPress={() => setTab(t.key)}
          >
            <Text
              style={[
                styles.tabButtonText,
                tab === t.key && styles.tabButtonTextActive,
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ============ TAB: INFO ============ */}
      {tab === 'info' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {profile.email}
              </Text>
            </View>
            <Text style={styles.infoHint}>
              Email không thể thay đổi. Liên hệ hỗ trợ nếu cần.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>THÔNG TIN CÁ NHÂN</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Họ và tên"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.inputLabel}>Địa chỉ giao hàng</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={address}
              onChangeText={setAddress}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              placeholderTextColor={COLORS.textSecondary}
              multiline
            />

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
              onPress={handleSaveInfo}
              disabled={savingInfo}
            >
              {savingInfo ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>LƯU THAY ĐỔI</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* ============ TAB: PASSWORD ============ */}
      {tab === 'password' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>ĐỔI MẬT KHẨU</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              placeholder="Mật khẩu hiện tại"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Ít nhất 6 ký tự"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>ĐỔI MẬT KHẨU</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* ============ TAB: ORDERS ============ */}
      {tab === 'orders' &&
        !isAdmin &&
        (ordersLoading ? (
          <View style={styles.loadingScreen}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Pressable
                style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
                onPress={() => router.push('/purchases' as any)}
              >
                <Text style={styles.outlineBtnText}>
                  🔑 Xem tài khoản đã mua (lịch sử 7 ngày)
                </Text>
              </Pressable>
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
                <Text style={styles.emptyText}>
                  Các đơn hàng bạn đặt sẽ hiện ở đây để theo dõi.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                  onPress={() => router.push('/products')}
                >
                  <Text style={styles.emptyButtonText}>Xem sản phẩm</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => {
              const statusColor = ORDER_STATUS_COLOR[item.status];
              return (
                <View style={styles.orderItem}>
                  <View style={styles.orderTopRow}>
                    <Text style={styles.orderId}>
                      #{item.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <View
                      style={[
                        styles.orderStatusBadge,
                        { backgroundColor: statusColor.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.orderStatusText,
                          { color: statusColor.text },
                        ]}
                      >
                        {ORDER_STATUS_LABEL[item.status]}
                      </Text>
                    </View>
                  </View>

                  {item.items.map((it) => (
                    <Text key={it.id} style={styles.orderProductLine}>
                      • {it.product.name}  ×{it.quantity}
                    </Text>
                  ))}

                  <View style={styles.orderDivider} />
                  <Text style={styles.orderTotal}>
                    {formatMoney(item.totalAmount)}
                  </Text>
                </View>
              );
            }}
          />
        ))}
    </SafeAreaView>
  );
}