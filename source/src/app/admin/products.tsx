// Admin: danh sách sản phẩm — thêm, sửa, ẩn/hiện và xoá.
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import {
  deleteProduct,
  fetchStockProducts,
  updateProduct,
  type AdminStockProduct,
} from '../../services/adminStock.api';
import { AdminStyles as styles } from '../../styles/AdminStyles';
import { COLORS } from '../../styles/GlobalStyles';
import { formatPrice } from '../../utils/format';

export default function AdminProductsScreen() {
  const router = useRouter();
  const { allowed } = useRoleGuard('ADMIN');
  const { showMessage, showError, showSuccess } = useMessageBox();
  const [products, setProducts] = useState<AdminStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setProducts(await fetchStockProducts());
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Không tải được danh sách sản phẩm.'
      );
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      if (!allowed) return;
      (async () => {
        await load();
        setLoading(false);
      })();
    }, [allowed, load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleToggle = async (p: AdminStockProduct) => {
    setBusyId(p.id);
    try {
      await updateProduct(p.id, { isActive: !p.isActive });
      await load();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Không cập nhật được sản phẩm.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (p: AdminStockProduct) => {
    showMessage({
      type: 'warning',
      title: 'Xoá sản phẩm?',
      message:
        `Bạn sắp xoá "${p.name}".` +
        (p.available > 0
          ? `\n\n${p.available.toLocaleString('vi-VN')} tài khoản còn trong kho cũng sẽ bị xoá.`
          : '') +
        '\n\nNếu sản phẩm đã từng có người mua, hệ thống sẽ chỉ ẨN nó để giữ lịch sử đơn hàng của khách.',
      confirmText: 'Xoá',
      cancelText: 'Huỷ',
      onConfirm: async () => {
        setBusyId(p.id);
        try {
          const r = await deleteProduct(p.id);
          await load();
          if (r.deleted) showSuccess(r.message, 'Đã xoá sản phẩm');
          else
            showMessage({ type: 'info', title: 'Đã ẩn sản phẩm', message: r.message });
        } catch (err) {
          showError(
            err instanceof Error ? err.message : 'Không xoá được sản phẩm.',
            'Xoá thất bại'
          );
        } finally {
          setBusyId(null);
        }
      },
    });
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
          <Text style={styles.greeting}>QUẢN TRỊ · SẢN PHẨM</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            {products.length > 0 ? `${products.length} sản phẩm` : 'Quản lý sản phẩm'}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/admin/product-form' as any)}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Thêm sản phẩm"
        >
          <Text style={styles.iconButtonText}>＋</Text>
        </Pressable>
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
        {products.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptyText}>
              Bấm nút ＋ ở trên để thêm sản phẩm đầu tiên.
            </Text>
          </View>
        ) : (
          products.map((p) => (
            <View key={p.id} style={styles.productCard}>
              {/* Top: thumb + info */}
              <View style={styles.productTop}>
                <View style={styles.productThumb}>
                  {p.imageUrl ? (
                    <Image
                      source={{ uri: p.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <Text style={styles.productThumbIcon}>🛒</Text>
                  )}
                </View>

                <View style={styles.productBody}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={styles.productMeta}>
                    {p.category || 'Chưa phân loại'} · Kho:{' '}
                    {p.available.toLocaleString('vi-VN')}
                  </Text>
                  <Text style={styles.productPrice}>{formatPrice(p.price)}</Text>

                  {!p.isActive && (
                    <View style={styles.hiddenBadge}>
                      <Text style={styles.hiddenBadgeText}>
                        Đang ẩn khỏi cửa hàng
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.productActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.smallButton,
                    pressed && styles.pressed,
                  ]}
                  disabled={busyId === p.id}
                  onPress={() =>
                    router.push({
                      pathname: '/admin/product-form',
                      params: { id: p.id },
                    } as any)
                  }
                >
                  <Text style={styles.smallButtonText}>Sửa</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.smallButton,
                    pressed && styles.pressed,
                  ]}
                  disabled={busyId === p.id}
                  onPress={() => handleToggle(p)}
                >
                  <Text style={styles.smallButtonText}>
                    {p.isActive ? 'Ẩn' : 'Hiện'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.smallButton,
                    styles.smallButtonDanger,
                    pressed && styles.pressed,
                  ]}
                  disabled={busyId === p.id}
                  onPress={() => confirmDelete(p)}
                >
                  {busyId === p.id ? (
                    <ActivityIndicator color={COLORS.danger} size="small" />
                  ) : (
                    <Text style={styles.smallButtonDangerText}>Xoá</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}