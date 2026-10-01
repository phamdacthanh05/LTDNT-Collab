
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
import { ExtraStyles } from '../../styles/ExtraStyles';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

function formatMoney(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString('vi-VN')}đ` : value;
}

const ORDER_STATUS_LABEL: Record<ProfileOrder['status'], string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
};

const ORDER_STATUS_COLOR: Record<ProfileOrder['status'], { bg: string; text: string }> = {
  PENDING: { bg: COLORS.warningSoft, text: COLORS.warning },
  PAID: { bg: COLORS.successSoft, text: COLORS.success },
  DELIVERED: { bg: COLORS.primarySoft, text: COLORS.primary },
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

  // form chỉnh sửa thông tin
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState(''); // MỚI: địa chỉ giao hàng
  const [savingInfo, setSavingInfo] = useState(false);

  // form đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // lịch sử đơn hàng
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProfile();
      setProfile(data);
      setFullName(data.fullName);
      setAddress(data.address || ''); // MỚI
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
      showMessage({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận.' });
      return;
    }
    if (newPassword.length < 6) {
      showMessage({ type: 'warning', title: 'Mật khẩu quá ngắn', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage({ type: 'warning', title: 'Mật khẩu không khớp', message: 'Mật khẩu xác nhận không giống mật khẩu mới.' });
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

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <View style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={GlobalStyles.center}>
        <Text style={GlobalStyles.errorText}>{error || 'Không tải được thông tin'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={ExtraStyles.screen} edges={['top']}>
      <View style={ExtraStyles.screenHeader}>
        <View style={GlobalStyles.productHeaderRow}>
          <Text style={ExtraStyles.screenHeaderTitle}>Tài khoản của tôi</Text>
          <Pressable onPress={handleLogout} style={GlobalStyles.logoutButton}>
            <Text style={GlobalStyles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </View>
      </View>

      {/* Số dư ví CHỈ hiển thị với khách. Admin không có số dư (tiền thu chi quản lý trong MoMo). */}
      {profile.role !== 'ADMIN' && (
        <View style={ExtraStyles.walletCard}>
          <Text style={ExtraStyles.walletLabel}>Số dư ví</Text>
          <Text style={ExtraStyles.walletAmount}>{formatMoney(profile.walletBalance ?? '0')}</Text>
          <Pressable
            style={ExtraStyles.walletTopupButton}
            onPress={() => router.push('/wallet' as any)}
          >
            <Text style={ExtraStyles.walletTopupButtonText}>+ Nạp tiền / Lịch sử ví</Text>
          </Pressable>
        </View>
      )}

      {profile.role === 'ADMIN' && (
        <View>
          <Pressable
            style={[GlobalStyles.button, { marginHorizontal: 16, marginBottom: 8 }]}
            onPress={() => router.push('/admin/support-list')}
          >
            <Text style={GlobalStyles.buttonText}>QUẢN LÝ HỘI THOẠI KHÁCH HÀNG</Text>
          </Pressable>
          <Pressable
            style={[GlobalStyles.button, { marginHorizontal: 16, marginBottom: 8 }]}
            onPress={() => router.push('/admin/products' as any)}
          >
            <Text style={GlobalStyles.buttonText}>QUẢN LÝ SẢN PHẨM</Text>
          </Pressable>
          <Pressable
            style={[GlobalStyles.button, { marginHorizontal: 16, marginBottom: 4 }]}
            onPress={() => router.push('/admin/accounts' as any)}
          >
            <Text style={GlobalStyles.buttonText}>QUẢN LÝ KHO TÀI KHOẢN</Text>
          </Pressable>
        </View>
      )}

      <View style={ExtraStyles.tabBar}>
        {(
          [
            { key: 'info', label: 'Thông tin' },
            { key: 'password', label: 'Đổi mật khẩu' },
            ...(profile.role === 'ADMIN' ? [] : [{ key: 'orders', label: 'Đơn hàng' }]),
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <Pressable
            key={t.key}
            style={[ExtraStyles.tabButton, tab === t.key && ExtraStyles.tabButtonActive]}
            onPress={() => setTab(t.key)}
          >
            <Text
              style={[
                ExtraStyles.tabButtonText,
                tab === t.key && ExtraStyles.tabButtonTextActive,
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'info' && (
        <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
          <View style={ExtraStyles.infoCard}>
            <View style={ExtraStyles.infoRow}>
              <Text style={ExtraStyles.infoLabel}>Email</Text>
              <Text style={ExtraStyles.infoValue}>{profile.email}</Text>
            </View>
            <View style={[ExtraStyles.infoRow, ExtraStyles.infoRowLast]}>
              <Text style={ExtraStyles.infoLabel}>Email không thể thay đổi</Text>
            </View>
          </View>

          <View style={GlobalStyles.box}>
            <Text style={GlobalStyles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={GlobalStyles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Họ và tên"
            />
            <Text style={GlobalStyles.inputLabel}>Địa chỉ giao hàng</Text>
            <TextInput
              style={GlobalStyles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              multiline
            />
            <Pressable style={GlobalStyles.button} onPress={handleSaveInfo} disabled={savingInfo}>
              {savingInfo ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={GlobalStyles.buttonText}>LƯU THAY ĐỔI</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {tab === 'password' && (
        <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
          <View style={GlobalStyles.box}>
            <Text style={GlobalStyles.inputLabel}>Mật khẩu hiện tại</Text>
            <TextInput
              style={GlobalStyles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              placeholder="Mật khẩu hiện tại"
            />
            <Text style={GlobalStyles.inputLabel}>Mật khẩu mới</Text>
            <TextInput
              style={GlobalStyles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Ít nhất 6 ký tự"
            />
            <Text style={GlobalStyles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={GlobalStyles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Nhập lại mật khẩu mới"
            />
            <Pressable
              style={GlobalStyles.button}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={GlobalStyles.buttonText}>ĐỔI MẬT KHẨU</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {tab === 'orders' && profile.role !== 'ADMIN' &&
        (ordersLoading ? (
          <View style={GlobalStyles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
            ListHeaderComponent={
              <Pressable
                style={[GlobalStyles.buttonOutline, { marginHorizontal: 16, marginBottom: 12 }]}
                onPress={() => router.push('/purchases' as any)}
              >
                <Text style={GlobalStyles.buttonOutlineText}>🔑 Xem tài khoản đã mua (lịch sử 7 ngày)</Text>
              </Pressable>
            }
            ListEmptyComponent={
              <View style={GlobalStyles.center}>
                <Text style={GlobalStyles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusColor = ORDER_STATUS_COLOR[item.status];
              return (
                <View style={ExtraStyles.orderItem}>
                  <View style={ExtraStyles.orderTopRow}>
                    <Text style={ExtraStyles.orderId}>#{item.id.slice(0, 8)}</Text>
                    <View
                      style={[ExtraStyles.orderStatusBadge, { backgroundColor: statusColor.bg }]}
                    >
                      <Text style={[ExtraStyles.orderStatusText, { color: statusColor.text }]}>
                        {ORDER_STATUS_LABEL[item.status]}
                      </Text>
                    </View>
                  </View>
                  {item.items.map((it) => (
                    <Text key={it.id} style={ExtraStyles.orderProductLine}>
                      {it.product.name} x{it.quantity}
                    </Text>
                  ))}
                  <Text style={ExtraStyles.orderTotal}>{formatMoney(item.totalAmount)}</Text>
                </View>
              );
            }}
          />
        ))}
    </SafeAreaView>
  );
}
