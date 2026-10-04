// Ví của tôi (chỉ khách): xem số dư, nạp tiền qua MoMo, xem lịch sử giao dịch.
// Mua hàng KHÔNG đi qua MoMo nữa: sản phẩm được trừ thẳng từ số dư ví này.
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useRoleGuard } from '../../hooks/use-role-guard';
import {
  confirmDevTopup,
  createTopup,
  fetchWallet,
  fetchWalletTransactions,
  syncTopup,
  type TopupSyncResult,
  type WalletInfo,
  type WalletTransaction,
} from '../../services/wallet.api';
import { COLORS } from '../../styles/GlobalStyles';
import { WalletStyles as styles } from '../../styles/WalletStyles';
import { formatDate, formatMoney } from '../../utils/format';

const PRESETS = [50000, 100000, 200000, 500000, 1000000];

const TX_TITLE: Record<WalletTransaction['type'], string> = {
  TOPUP: 'Nạp tiền qua MoMo',
  PURCHASE: 'Mua hàng',
  REFUND: 'Hoàn tiền',
};

const STATUS_LABEL: Record<WalletTransaction['status'], string> = {
  PENDING: 'Chờ MoMo xác nhận',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
};

const STATUS_COLOR: Record<WalletTransaction['status'], string> = {
  PENDING: COLORS.warning,
  SUCCESS: COLORS.success,
  FAILED: COLORS.danger,
};

export default function WalletScreen() {
  const router = useRouter();
  const { allowed } = useRoleGuard('BUYER');
  const { showMessage, showError } = useMessageBox();

  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [amountText, setAmountText] = useState('100000');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topping, setTopping] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const amount = Number(amountText.replace(/\D/g, '')) || 0;

  const load = useCallback(async () => {
    try {
      const [w, tx] = await Promise.all([fetchWallet(), fetchWalletTransactions()]);
      setWallet(w);
      setTransactions(tx);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Không tải được ví.');
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

  const reportResult = async (result: TopupSyncResult) => {
    await load();
    if (result.credited || result.status === 'SUCCESS') {
      showMessage({
        type: 'success',
        title: 'Nạp tiền thành công',
        message: 'Số dư ví của bạn đã được cập nhật.',
      });
    } else if (result.status === 'FAILED') {
      showMessage({
        type: 'error',
        title: 'Nạp tiền không thành công',
        message:
          result.message || 'Giao dịch đã bị huỷ hoặc thất bại, bạn chưa bị trừ tiền.',
      });
    } else {
      showMessage({
        type: 'info',
        title: 'Chưa ghi nhận thanh toán',
        message:
          'MoMo chưa xác nhận giao dịch. Nếu bạn đã thanh toán xong, hãy bấm "Kiểm tra" ở giao dịch trong danh sách bên dưới sau ít phút.',
      });
    }
  };

  const handleTopup = async (dev = false) => {
    if (!wallet) return;
    if (amount < wallet.minTopup) {
      showMessage({
        type: 'warning',
        title: 'Số tiền chưa hợp lệ',
        message: `Số tiền nạp tối thiểu ${formatMoney(wallet.minTopup)}.`,
      });
      return;
    }
    if (amount > wallet.maxTopup) {
      showMessage({
        type: 'warning',
        title: 'Số tiền chưa hợp lệ',
        message: `Số tiền nạp tối đa ${formatMoney(wallet.maxTopup)} mỗi lần.`,
      });
      return;
    }

    setTopping(true);
    try {
      const topup = await createTopup(amount, dev);
      if (dev || !topup.payUrl) {
        await reportResult(await confirmDevTopup(topup.transactionId));
      } else {
        await WebBrowser.openBrowserAsync(topup.payUrl);
        // Quay lại app: backend tự hỏi MoMo đã nhận tiền chưa rồi mới cộng ví
        await reportResult(await syncTopup(topup.transactionId));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Không thể nạp tiền.', 'Nạp tiền thất bại');
      await load();
    } finally {
      setTopping(false);
    }
  };

  const handleCheck = async (id: string) => {
    setCheckingId(id);
    try {
      await reportResult(await syncTopup(id));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Không kiểm tra được giao dịch.');
    } finally {
      setCheckingId(null);
    }
  };

  if (!allowed || loading || !wallet) {
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
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.greeting}>VÍ CỦA TÔI</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Số dư & giao dịch
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
        {/* ============ Hero: Số dư ============ */}
        <View style={styles.walletHero}>
          <View style={styles.walletHeroBlobA} />
          <View style={styles.walletHeroBlobB} />

          <Text style={styles.walletHeroLabel}>SỐ DƯ KHẢ DỤNG</Text>
          <Text style={styles.walletHeroAmount}>{formatMoney(wallet.balance)}</Text>
          <Text style={styles.walletHeroSub}>
            Dùng để mua sản phẩm trực tiếp — không cần trả MoMo cho từng đơn.
          </Text>

          {wallet.devPayment && (
            <View style={styles.walletHeroChipRow}>
              <Text style={styles.walletHeroChipText}>🧪 Chế độ dev đang bật</Text>
            </View>
          )}
        </View>

        {/* ============ Nạp tiền ============ */}
        <Text style={styles.sectionTitle}>NẠP TIỀN VÀO VÍ</Text>
        <View style={styles.card}>
          {/* Preset chips */}
          <View style={styles.amountChipRow}>
            {PRESETS.map((v) => {
              const active = amount === v;
              return (
                <Pressable
                  key={v}
                  style={[styles.amountChip, active && styles.amountChipActive]}
                  onPress={() => setAmountText(String(v))}
                >
                  <Text
                    style={[
                      styles.amountChipText,
                      active && styles.amountChipTextActive,
                    ]}
                  >
                    {formatMoney(v)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Input số tiền */}
          <Text style={styles.inputLabel}>Hoặc nhập số tiền khác (đ)</Text>
          <TextInput
            style={styles.input}
            value={amountText}
            onChangeText={(t) => setAmountText(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder={`Tối thiểu ${wallet.minTopup.toLocaleString('vi-VN')}`}
            placeholderTextColor={COLORS.textSecondary}
            editable={!topping}
          />
          <Text style={styles.inputNote}>
            Thanh toán bằng ví MoMo. Tiền chỉ vào ví sau khi MoMo xác nhận. Mua sản phẩm sẽ được trừ trực tiếp từ số dư này.
          </Text>

          {/* Nút nạp MoMo */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              topping && { opacity: 0.6 },
              pressed && styles.pressed,
            ]}
            onPress={() => handleTopup(false)}
            disabled={topping}
            accessibilityRole="button"
          >
            {topping ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>
                NẠP {amount > 0 ? formatMoney(amount) : ''} QUA MOMO
              </Text>
            )}
          </Pressable>

          {/* Nút nạp dev */}
          {wallet.devPayment && (
            <Pressable
              style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
              onPress={() => handleTopup(true)}
              disabled={topping}
            >
              <Text style={styles.outlineBtnText}>
                🧪 Nạp thử (dev, không trừ tiền thật)
              </Text>
            </Pressable>
          )}
        </View>

        {/* ============ Lịch sử giao dịch ============ */}
        <Text style={styles.sectionTitle}>LỊCH SỬ GIAO DỊCH</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyTx}>
            <Text style={styles.emptyTxIcon}>📭</Text>
            <Text style={styles.emptyTxTitle}>Chưa có giao dịch nào</Text>
            <Text style={styles.emptyTxText}>
              Các giao dịch nạp tiền và mua hàng sẽ xuất hiện tại đây.
            </Text>
          </View>
        ) : (
          transactions.map((t) => {
            const isIn = t.type !== 'PURCHASE';
            const ok = t.status === 'SUCCESS';
            const amountStyle = !ok
              ? styles.txAmountMuted
              : isIn
              ? styles.txAmountPlus
              : styles.txAmountMinus;

            const iconWrapStyle = !ok
              ? styles.txIconWrapMuted
              : isIn
              ? styles.txIconWrapPlus
              : styles.txIconWrapMinus;

            const icon = !ok ? '⏳' : isIn ? '↓' : '↑';

            return (
              <View key={t.id} style={styles.txRow}>
                <View style={[styles.txIconWrap, iconWrapStyle]}>
                  <Text style={styles.txIcon}>{icon}</Text>
                </View>

                <View style={styles.txBody}>
                  <Text style={styles.txTitle}>{TX_TITLE[t.type]}</Text>
                  <Text style={styles.txMeta}>{formatDate(t.createdAt)}</Text>

                  <View style={styles.txStatusRow}>
                    <View
                      style={[
                        styles.txStatusDot,
                        { backgroundColor: STATUS_COLOR[t.status] },
                      ]}
                    />
                    <Text
                      style={[
                        styles.txStatusText,
                        { color: STATUS_COLOR[t.status] },
                      ]}
                    >
                      {STATUS_LABEL[t.status]}
                    </Text>
                  </View>

                  {t.status === 'PENDING' && t.type === 'TOPUP' && (
                    <Pressable
                      style={({ pressed }) => [styles.checkBtn, pressed && styles.pressed]}
                      onPress={() => handleCheck(t.id)}
                      disabled={checkingId === t.id}
                    >
                      {checkingId === t.id ? (
                        <ActivityIndicator color={COLORS.primaryDark} size="small" />
                      ) : (
                        <Text style={styles.checkBtnText}>Kiểm tra</Text>
                      )}
                    </Pressable>
                  )}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmount, amountStyle]}>
                    {isIn ? '+' : '−'}
                    {formatMoney(t.amount)}
                  </Text>
                  {ok && t.balanceAfter !== null && (
                    <Text style={styles.txBalanceAfter}>
                      Dư: {formatMoney(t.balanceAfter)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}