// Thanh toán bằng SỐ DƯ VÍ. Khách nạp tiền vào ví trước (màn "Ví của tôi"),
// rồi mua hàng sẽ được trừ thẳng từ ví — không phải trả MoMo cho từng sản phẩm.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../components/MessageBox';
import { useCart } from '../contexts/CartContext';
import { useRoleGuard } from '../hooks/use-role-guard';
import { createOrder, InsufficientBalanceError } from '../services/api';
import { fetchWallet } from '../services/wallet.api';
import { CheckoutStyles as styles } from '../styles/CheckoutStyles';
import { COLORS } from '../styles/GlobalStyles';
import { formatPrice } from '../utils/format';

export default function CheckoutScreen() {
  const router = useRouter();
  const { allowed } = useRoleGuard('BUYER');
  const { showMessage, showError } = useMessageBox();
  const { items, totalPrice, clearCart } = useCart();
  const [balance, setBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      const w = await fetchWallet();
      setBalance(Number(w.balance));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Không tải được số dư ví.');
    }
  }, [showError]);

  // Tải lại số dư mỗi lần vào màn (kể cả khi vừa nạp tiền xong rồi quay lại)
  useEffect(() => {
    if (allowed) loadBalance();
  }, [allowed, loadBalance]);

  const enough = balance !== null && balance >= totalPrice;
  const missing = balance === null ? 0 : Math.max(0, totalPrice - balance);
  const goToWallet = () => router.push('/wallet' as any);

  const handleConfirm = async () => {
    if (items.length === 0 || balance === null) return;

    if (!enough) {
      showMessage({
        type: 'warning',
        title: 'Số dư ví không đủ',
        message: `Bạn cần nạp thêm ${formatPrice(missing)} để thanh toán đơn hàng này.`,
        confirmText: 'Nạp tiền ngay',
        cancelText: 'Để sau',
        onConfirm: goToWallet,
      });
      return;
    }

    setSubmitting(true);
    try {
      // Backend: trừ ví + tạo đơn + giao tài khoản trong 1 transaction (lỗi thì không mất tiền)
      const result = await createOrder(
        items.map((it) => ({ productId: it.product.id, quantity: it.quantity }))
      );
      setBalance(Number(result.balance));
      clearCart();
      showMessage({
        type: 'success',
        title: 'Mua hàng thành công 🎉',
        message:
          `Đã trừ ${formatPrice(totalPrice)} từ ví, số dư còn ${formatPrice(Number(result.balance))}.\n\n` +
          'Tài khoản và mật khẩu bạn vừa mua đã có trong "Lịch sử mua hàng".\n\n' +
          'Lưu ý: lịch sử mua hàng sẽ tự động bị xoá sau 7 ngày, hãy lưu lại thông tin sớm.',
        confirmText: 'Xem tài khoản đã mua',
        onConfirm: () => router.replace('/purchases' as any),
      });
    } catch (error) {
      if (error instanceof InsufficientBalanceError) {
        setBalance(error.balance);
        showMessage({
          type: 'warning',
          title: 'Số dư ví không đủ',
          message: `Bạn cần nạp thêm ${formatPrice(error.missing)} để thanh toán đơn hàng này.`,
          confirmText: 'Nạp tiền ngay',
          cancelText: 'Để sau',
          onConfirm: goToWallet,
        });
      } else {
        showError(error instanceof Error ? error.message : 'Không thể đặt hàng.', 'Đặt hàng thất bại');
        loadBalance(); // kho/giá có thể đã đổi -> cập nhật lại
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!allowed) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main} edges={['top', 'bottom']}>
      {/* ============ Top Bar đồng bộ Dashboard ============ */}
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
          <Text style={styles.greeting}>THANH TOÁN</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Xác nhận đơn hàng
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============ Tóm tắt đơn hàng ============ */}
        <Text style={styles.sectionTitle}>ĐƠN HÀNG CỦA BẠN</Text>
        <View style={styles.card}>
          {items.map((it) => (
            <View key={it.product.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {it.product.name}
                <Text style={styles.itemQty}>  x{it.quantity}</Text>
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(Number(it.product.price) * it.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        {/* ============ Ví thanh toán ============ */}
        <Text style={styles.sectionTitle}>PHƯƠNG THỨC THANH TOÁN</Text>
        <View style={styles.card}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconWrap}>
              <Text style={styles.walletIcon}>💰</Text>
            </View>
            <View style={styles.walletHeaderText}>
              <Text style={styles.walletHeaderLabel}>VÍ DIGITAL RESOURCES</Text>
              <Text style={styles.walletHeaderSub}>Trừ trực tiếp từ số dư ví</Text>
            </View>
          </View>

          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Số dư hiện tại</Text>
            {balance === null ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.walletValueHighlight}>{formatPrice(balance)}</Text>
            )}
          </View>

          {balance !== null && enough && (
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Số dư sau khi mua</Text>
              <Text style={styles.walletValue}>{formatPrice(balance - totalPrice)}</Text>
            </View>
          )}

          {balance !== null && !enough && (
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Còn thiếu</Text>
              <Text style={styles.walletValueEmpty}>{formatPrice(missing)}</Text>
            </View>
          )}
        </View>

        {/* ============ Cảnh báo số dư không đủ ============ */}
        {balance !== null && !enough && (
          <View style={styles.dangerBanner}>
            <Text style={styles.dangerTitle}>⚠️ Số dư ví không đủ</Text>
            <Text style={styles.dangerText}>
              Bạn còn thiếu {formatPrice(missing)}. Hãy nạp thêm tiền vào ví (qua MoMo) rồi quay lại thanh toán.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
              onPress={goToWallet}
              accessibilityRole="button"
            >
              <Text style={styles.dangerButtonText}>NẠP TIỀN VÀO VÍ</Text>
            </Pressable>
          </View>
        )}

        {/* ============ Lưu ý ============ */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeTitle}>📌 Lưu ý về lịch sử mua hàng</Text>
          <Text style={styles.noticeText}>
            Sau khi thanh toán, tài khoản & mật khẩu được lưu trong Lịch sử mua hàng và sẽ tự động xoá sau 7 ngày.
          </Text>
        </View>
      </ScrollView>

      {/* ============ Nút xác nhận ============ */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            (submitting || !enough || items.length === 0 || balance === null) &&
              styles.confirmButtonDisabled,
            pressed && !submitting && styles.confirmButtonPressed,
          ]}
          disabled={submitting || items.length === 0 || balance === null || !enough}
          onPress={handleConfirm}
          accessibilityRole="button"
          accessibilityLabel="Xác nhận thanh toán"
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.confirmButtonText}>
              {balance !== null && !enough
                ? 'SỐ DƯ KHÔNG ĐỦ'
                : `THANH TOÁN ${formatPrice(totalPrice)}`}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}