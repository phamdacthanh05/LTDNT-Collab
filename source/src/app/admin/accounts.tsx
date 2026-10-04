// Admin: xem số tài khoản còn trong kho và nhập thêm tài khoản.
import { useRouter } from 'expo-router';
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
  fetchStockProducts,
  importAccounts,
  type AdminStockProduct,
} from '../../services/adminStock.api';
import { AdminStyles as styles } from '../../styles/AdminStyles';
import { COLORS } from '../../styles/GlobalStyles';

export default function AdminAccountsScreen() {
  const router = useRouter();
  const { allowed } = useRoleGuard('ADMIN');
  const { showMessage, showError } = useMessageBox();
  const [products, setProducts] = useState<AdminStockProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    try {
      setProducts(await fetchStockProducts());
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Không tải được kho tài khoản.');
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

  const lineCount = text.split(/\r?\n/).filter((l) => l.trim()).length;
  const selected = products.find((p) => p.id === selectedId);

  const handleImport = async () => {
    if (!selected) {
      showMessage({
        type: 'warning',
        title: 'Chưa chọn sản phẩm',
        message: 'Hãy chọn sản phẩm cần nhập tài khoản ở danh sách phía trên.',
      });
      return;
    }
    if (lineCount === 0) {
      showMessage({
        type: 'warning',
        title: 'Chưa có dữ liệu',
        message: 'Hãy dán danh sách tài khoản, mỗi dòng dạng email|matkhau.',
      });
      return;
    }
    setImporting(true);
    try {
      const r = await importAccounts(selected.id, text);
      setText('');
      await load();
      showMessage({
        type: r.invalid > 0 ? 'warning' : 'success',
        title: 'Nhập kho xong',
        message:
          `${r.message}.\nKho hiện có: ${r.available.toLocaleString('vi-VN')} tài khoản.` +
          (r.invalid > 0 ? `\n\nCó ${r.invalid} dòng sai định dạng đã bị bỏ qua.` : ''),
      });
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Không nhập được tài khoản.',
        'Nhập kho thất bại'
      );
    } finally {
      setImporting(false);
    }
  };

  if (!allowed || loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main} edges={['top', 'bottom']}>
      {/* ============ Top Bar ============ */}
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
          <Text style={styles.greeting}>QUẢN TRỊ · KHO</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Kho tài khoản
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
        {/* ============ Bước 1: Chọn sản phẩm ============ */}
        <Text style={[styles.sectionTitle, styles.sectionTitleFirst]}>
          BƯỚC 1 · CHỌN SẢN PHẨM
        </Text>
        {products.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptyText}>
              Hãy thêm sản phẩm trước khi nhập kho tài khoản.
            </Text>
          </View>
        ) : (
          products.map((p) => {
            const active = p.id === selectedId;
            return (
              <Pressable
                key={p.id}
                style={({ pressed }) => [
                  styles.stockRow,
                  active && styles.stockRowActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => setSelectedId(p.id)}
              >
                <View style={styles.stockBody}>
                  <Text style={styles.stockName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.stockMeta}>
                    {p.category || 'Chưa phân loại'}
                  </Text>
                </View>
                <View style={styles.stockCountWrap}>
                  <Text
                    style={[
                      styles.stockCount,
                      p.available === 0 && styles.stockCountEmpty,
                    ]}
                  >
                    {p.available.toLocaleString('vi-VN')}
                  </Text>
                  <Text style={styles.stockCountLabel}>còn trong kho</Text>
                </View>
              </Pressable>
            );
          })
        )}

        {/* ============ Bước 2: Dán danh sách ============ */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
          BƯỚC 2 · DÁN DANH SÁCH TÀI KHOẢN
        </Text>
        <Text style={styles.sectionHint}>
          Mỗi dòng 1 tài khoản, dạng <Text style={styles.importHintStrong}>email|matkhau</Text> (có thể thêm |ghi chú).
          Dòng sai định dạng sẽ bị bỏ qua.
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.importInput}
            multiline
            value={text}
            onChangeText={setText}
            placeholder={'email1@gmail.com|matkhau1\nemail2@gmail.com|matkhau2'}
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!importing}
          />

          <Text style={styles.importHint}>
            Đã nhập:{' '}
            <Text style={styles.importHintStrong}>
              {lineCount.toLocaleString('vi-VN')} dòng
            </Text>
            {selected ? (
              <>
                {' → '}
                <Text style={styles.importHintStrong}>{selected.name}</Text>
              </>
            ) : null}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              importing && { opacity: 0.6 },
              pressed && !importing && styles.pressed,
            ]}
            onPress={handleImport}
            disabled={importing}
            accessibilityRole="button"
          >
            {importing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>NHẬP VÀO KHO</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}