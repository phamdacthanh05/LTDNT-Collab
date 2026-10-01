// Ví của tôi (chỉ khách): xem số dư, nạp tiền qua MoMo, xem lịch sử giao dịch.
// Mua hàng KHÔNG đi qua MoMo nữa: sản phẩm được trừ thẳng từ số dư ví này.
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useRoleGuard } from '../../hooks/use-role-guard';
import {
  confirmDevTopup, createTopup, fetchWallet, fetchWalletTransactions, syncTopup,
  type TopupSyncResult, type WalletInfo, type WalletTransaction,
} from '../../services/wallet.api';
import { ExtraStyles } from '../../styles/ExtraStyles';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

const PRESETS = [50000, 100000, 200000, 500000, 1000000];

function formatMoney(value: string | number) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString('vi-VN')}đ` : String(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

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
      showMessage({ type: 'success', title: 'Nạp tiền thành công', message: 'Số dư ví của bạn đã được cập nhật.' });
    } else if (result.status === 'FAILED') {
      showMessage({ type: 'error', title: 'Nạp tiền không thành công', message: result.message || 'Giao dịch đã bị huỷ hoặc thất bại, bạn chưa bị trừ tiền.' });
    } else {
      showMessage({
        type: 'info',
        title: 'Chưa ghi nhận thanh toán',
        message: 'MoMo chưa xác nhận giao dịch. Nếu bạn đã thanh toán xong, hãy bấm "Kiểm tra" ở giao dịch trong danh sách bên dưới sau ít phút.',
      });
    }
  };

  const handleTopup = async (dev = false) => {
    if (!wallet) return;
    if (amount < wallet.minTopup) {
      showMessage({ type: 'warning', title: 'Số tiền chưa hợp lệ', message: `Số tiền nạp tối thiểu ${formatMoney(wallet.minTopup)}.` });
      return;
    }
    if (amount > wallet.maxTopup) {
      showMessage({ type: 'warning', title: 'Số tiền chưa hợp lệ', message: `Số tiền nạp tối đa ${formatMoney(wallet.maxTopup)} mỗi lần.` });
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
        <Text style={[ExtraStyles.screenHeaderTitle, { marginTop: 6 }]}>Ví của tôi</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={ExtraStyles.walletCard}>
          <Text style={ExtraStyles.walletLabel}>Số dư ví</Text>
          <Text style={ExtraStyles.walletAmount}>{formatMoney(wallet.balance)}</Text>
        </View>

        <Text style={[GlobalStyles.descTitle, { marginHorizontal: 16, marginBottom: 10 }]}>Nạp tiền vào ví</Text>
        <View style={GlobalStyles.box}>
          <View style={ExtraStyles.amountChipRow}>
            {PRESETS.map((v) => {
              const active = amount === v;
              return (
                <Pressable
                  key={v}
                  style={[ExtraStyles.amountChip, active && ExtraStyles.amountChipActive]}
                  onPress={() => setAmountText(String(v))}
                >
                  <Text style={[ExtraStyles.amountChipText, active && ExtraStyles.amountChipTextActive]}>
                    {formatMoney(v)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={GlobalStyles.inputLabel}>Hoặc nhập số tiền khác (đ)</Text>
          <TextInput
            style={GlobalStyles.input}
            value={amountText}
            onChangeText={(t) => setAmountText(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder={`Tối thiểu ${wallet.minTopup.toLocaleString('vi-VN')}`}
            editable={!topping}
          />
          <Text style={ExtraStyles.readonlyNote}>
            Thanh toán bằng ví MoMo. Tiền chỉ vào ví sau khi MoMo xác nhận. Mua sản phẩm sẽ được trừ trực tiếp từ số dư này.
          </Text>

          <Pressable
            style={({ pressed }) => [GlobalStyles.button, topping && { opacity: 0.6 }, pressed && GlobalStyles.buttonPressed]}
            onPress={() => handleTopup(false)}
            disabled={topping}
          >
            {topping ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={GlobalStyles.buttonText}>NẠP {amount > 0 ? formatMoney(amount) : ''} QUA MOMO</Text>
            )}
          </Pressable>

          {wallet.devPayment && (
            <Pressable
              style={[GlobalStyles.buttonOutline, { marginTop: 10 }]}
              onPress={() => handleTopup(true)}
              disabled={topping}
            >
              <Text style={GlobalStyles.buttonOutlineText}>🧪 Nạp thử (dev, không trừ tiền thật)</Text>
            </Pressable>
          )}
        </View>

        <Text style={[GlobalStyles.descTitle, { marginHorizontal: 16, marginTop: 20, marginBottom: 10 }]}>
          Lịch sử giao dịch
        </Text>
        {transactions.length === 0 ? (
          <Text style={[GlobalStyles.emptyText, { textAlign: 'center' }]}>Chưa có giao dịch nào.</Text>
        ) : (
          transactions.map((t) => {
            const isIn = t.type !== 'PURCHASE';
            const ok = t.status === 'SUCCESS';
            const amountStyle = !ok
              ? ExtraStyles.txAmountMuted
              : isIn ? ExtraStyles.txAmountPlus : ExtraStyles.txAmountMinus;
            return (
              <View key={t.id} style={ExtraStyles.txRow}>
                <View style={{ flex: 1 }}>
                  <Text style={ExtraStyles.txTitle}>{TX_TITLE[t.type]}</Text>
                  <Text style={ExtraStyles.txMeta}>
                    {formatDate(t.createdAt)} · {STATUS_LABEL[t.status]}
                  </Text>
                  {t.status === 'PENDING' && t.type === 'TOPUP' && (
                    <Pressable
                      style={[ExtraStyles.smallButton, { flex: 0, alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 14 }]}
                      onPress={() => handleCheck(t.id)}
                      disabled={checkingId === t.id}
                    >
                      {checkingId === t.id ? (
                        <ActivityIndicator color={COLORS.primary} />
                      ) : (
                        <Text style={ExtraStyles.smallButtonText}>Kiểm tra</Text>
                      )}
                    </Pressable>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={amountStyle}>
                    {isIn ? '+' : '−'}{formatMoney(t.amount)}
                  </Text>
                  {ok && t.balanceAfter !== null && (
                    <Text style={ExtraStyles.txMeta}>Dư: {formatMoney(t.balanceAfter)}</Text>
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
