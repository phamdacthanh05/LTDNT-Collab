// Admin: xem số tài khoản còn trong kho và nhập thêm tài khoản (1 lần có thể dán hàng chục nghìn dòng).
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { fetchStockProducts, importAccounts, type AdminStockProduct } from '../../services/adminStock.api';
import { ExtraStyles } from '../../styles/ExtraStyles';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

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
      showMessage({ type: 'warning', title: 'Chưa chọn sản phẩm', message: 'Hãy chọn sản phẩm cần nhập tài khoản ở danh sách phía trên.' });
      return;
    }
    if (lineCount === 0) {
      showMessage({ type: 'warning', title: 'Chưa có dữ liệu', message: 'Hãy dán danh sách tài khoản, mỗi dòng dạng email|matkhau.' });
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
      showError(err instanceof Error ? err.message : 'Không nhập được tài khoản.', 'Nhập kho thất bại');
    } finally {
      setImporting(false);
    }
  };

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
        <Text style={[ExtraStyles.screenHeaderTitle, { marginTop: 6 }]}>Kho tài khoản</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[GlobalStyles.descTitle, { marginHorizontal: 16, marginBottom: 10 }]}>1. Chọn sản phẩm</Text>
        {products.map((p) => {
          const active = p.id === selectedId;
          return (
            <Pressable
              key={p.id}
              style={[ExtraStyles.stockRow, active && ExtraStyles.stockRowActive]}
              onPress={() => setSelectedId(p.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={ExtraStyles.stockName}>{p.name}</Text>
                <Text style={ExtraStyles.stockMeta}>{p.category || 'Chưa phân loại'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[ExtraStyles.stockCount, p.available === 0 && ExtraStyles.stockCountEmpty]}>
                  {p.available.toLocaleString('vi-VN')}
                </Text>
                <Text style={ExtraStyles.stockMeta}>còn trong kho</Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={[GlobalStyles.descTitle, { marginHorizontal: 16, marginTop: 14, marginBottom: 10 }]}>
          2. Dán danh sách tài khoản
        </Text>
        <View style={GlobalStyles.box}>
          <TextInput
            style={ExtraStyles.importInput}
            multiline
            value={text}
            onChangeText={setText}
            placeholder={'email1@gmail.com|matkhau1\nemail2@gmail.com|matkhau2'}
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!importing}
          />
          <Text style={ExtraStyles.importHint}>
            Mỗi dòng 1 tài khoản, dạng email|matkhau (có thể thêm |ghi chú). Dòng sai định dạng sẽ bị bỏ qua.
            {'\n'}Đã nhập: {lineCount.toLocaleString('vi-VN')} dòng
            {selected ? ` → "${selected.name}"` : ''}
          </Text>
          <Pressable
            style={({ pressed }) => [GlobalStyles.button, { marginTop: 14 }, pressed && GlobalStyles.buttonPressed]}
            onPress={handleImport}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={GlobalStyles.buttonText}>NHẬP VÀO KHO</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
