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
import { COLORS, GlobalStyles } from '../styles/GlobalStyles';
import { ExtraStyles } from '../styles/ExtraStyles';

function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')}đ`;
}

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
      <SafeAreaView style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={ExtraStyles.screen} edges={['top']}>
      <View style={ExtraStyles.screenHeader}>
        <Pressable onPress={() => router.back()}>
          <Text style={GlobalStyles.topBackText}>‹ Quay lại</Text>
        </Pressable>
        <Text style={[ExtraStyles.screenHeaderTitle, { marginTop: 6 }]}>Thanh toán</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}>
        {/* Tóm tắt đơn hàng */}
        <View style={ExtraStyles.summaryBox}>
          {items.map((it) => (
            <View key={it.product.id} style={ExtraStyles.summaryRow}>
              <Text style={ExtraStyles.summaryLabel} numberOfLines={1}>
                {it.product.name} x{it.quantity}
              </Text>
              <Text style={ExtraStyles.summaryValue}>
                {formatPrice(Number(it.product.price) * it.quantity)}
              </Text>
            </View>
          ))}
          <View style={[ExtraStyles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 }]}>
            <Text style={ExtraStyles.summaryTotalLabel}>Tổng thanh toán</Text>
            <Text style={ExtraStyles.summaryTotalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        {/* Thanh toán từ ví */}
        <Text style={[GlobalStyles.descTitle, { marginHorizontal: 16, marginTop: 20, marginBottom: 10 }]}>
          Thanh toán bằng số dư ví
        </Text>
        <View style={ExtraStyles.summaryBox}>
          <View style={ExtraStyles.summaryRow}>
            <Text style={ExtraStyles.summaryLabel}>Số dư hiện tại</Text>
            {balance === null ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={ExtraStyles.summaryValue}>{formatPrice(balance)}</Text>
            )}
          </View>
          {balance !== null && enough && (
            <View style={ExtraStyles.summaryRow}>
              <Text style={ExtraStyles.summaryLabel}>Số dư sau khi mua</Text>
              <Text style={ExtraStyles.summaryValue}>{formatPrice(balance - totalPrice)}</Text>
            </View>
          )}
        </View>

        {balance !== null && !enough && (
          <View style={ExtraStyles.dangerBanner}>
            <Text style={ExtraStyles.dangerBannerTitle}>Số dư ví không đủ</Text>
            <Text style={ExtraStyles.dangerBannerText}>
              Bạn còn thiếu {formatPrice(missing)}. Hãy nạp thêm tiền vào ví (qua MoMo) rồi quay lại thanh toán.
            </Text>
            <Pressable style={[GlobalStyles.button, { marginTop: 12 }]} onPress={goToWallet}>
              <Text style={GlobalStyles.buttonText}>NẠP TIỀN VÀO VÍ</Text>
            </Pressable>
          </View>
        )}

        <View style={ExtraStyles.noticeBanner}>
          <Text style={ExtraStyles.noticeBannerTitle}>Lưu ý về lịch sử mua hàng</Text>
          <Text style={ExtraStyles.noticeBannerText}>
            Sau khi thanh toán, tài khoản & mật khẩu được lưu trong Lịch sử mua hàng và sẽ tự động xoá sau 7 ngày.
          </Text>
        </View>
      </ScrollView>

      <View style={GlobalStyles.footer}>
        <Pressable
          style={({ pressed }) => [
            GlobalStyles.buyButton,
            (submitting || !enough) && GlobalStyles.buyButtonDisabled,
            pressed && !submitting && GlobalStyles.buyButtonPressed,
          ]}
          disabled={submitting || items.length === 0 || balance === null || !enough}
          onPress={handleConfirm}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={GlobalStyles.buyButtonText}>
              {balance !== null && !enough ? 'SỐ DƯ KHÔNG ĐỦ' : `THANH TOÁN ${formatPrice(totalPrice)}`}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
