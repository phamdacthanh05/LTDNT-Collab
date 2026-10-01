// Admin: danh sách sản phẩm — thêm, sửa, ẩn/hiện và xoá.
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useRoleGuard } from '../../hooks/use-role-guard';
import {
  deleteProduct, fetchStockProducts, updateProduct, type AdminStockProduct,
} from '../../services/adminStock.api';
import { ExtraStyles } from '../../styles/ExtraStyles';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

function formatPrice(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString('vi-VN')}đ` : value;
}

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
      showError(err instanceof Error ? err.message : 'Không tải được danh sách sản phẩm.');
    }
  }, [showError]);

  // Tải lại mỗi lần quay về màn này (vừa thêm/sửa xong ở màn form)
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
      showError(err instanceof Error ? err.message : 'Không cập nhật được sản phẩm.');
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
        (p.available > 0 ? `\n\n${p.available.toLocaleString('vi-VN')} tài khoản còn trong kho cũng sẽ bị xoá.` : '') +
        '\n\nNếu sản phẩm đã từng có người mua, hệ thống sẽ chỉ ẨN nó để giữ lịch sử đơn hàng của khách.',
      confirmText: 'Xoá',
      cancelText: 'Huỷ',
      onConfirm: async () => {
        setBusyId(p.id);
        try {
          const r = await deleteProduct(p.id);
          await load();
          if (r.deleted) showSuccess(r.message, 'Đã xoá sản phẩm');
          else showMessage({ type: 'info', title: 'Đã ẩn sản phẩm', message: r.message });
        } catch (err) {
          showError(err instanceof Error ? err.message : 'Không xoá được sản phẩm.', 'Xoá thất bại');
        } finally {
          setBusyId(null);
        }
      },
    });
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
        <Text style={[ExtraStyles.screenHeaderTitle, { marginTop: 6 }]}>Quản lý sản phẩm</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Pressable
          style={({ pressed }) => [GlobalStyles.button, { marginHorizontal: 16, marginBottom: 16 }, pressed && GlobalStyles.buttonPressed]}
          onPress={() => router.push('/admin/product-form' as any)}
        >
          <Text style={GlobalStyles.buttonText}>+ THÊM SẢN PHẨM</Text>
        </Pressable>

        {products.length === 0 && (
          <Text style={[GlobalStyles.emptyText, { textAlign: 'center' }]}>Chưa có sản phẩm nào.</Text>
        )}

        {products.map((p) => (
          <View key={p.id} style={ExtraStyles.adminProductCard}>
            <View style={ExtraStyles.adminProductTop}>
              <View style={ExtraStyles.adminProductThumb}>
                {p.imageUrl ? (
                  <Image source={{ uri: p.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <Text style={{ fontSize: 22 }}>🛒</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ExtraStyles.adminProductName} numberOfLines={2}>{p.name}</Text>
                <Text style={ExtraStyles.adminProductMeta}>
                  {p.category || 'Chưa phân loại'} · Kho: {p.available.toLocaleString('vi-VN')}
                </Text>
                <Text style={ExtraStyles.adminProductPrice}>{formatPrice(p.price)}</Text>
                {!p.isActive && (
                  <View style={ExtraStyles.hiddenBadge}>
                    <Text style={ExtraStyles.hiddenBadgeText}>Đang ẩn khỏi cửa hàng</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={ExtraStyles.adminProductActions}>
              <Pressable
                style={ExtraStyles.smallButton}
                disabled={busyId === p.id}
                onPress={() => router.push({ pathname: '/admin/product-form', params: { id: p.id } } as any)}
              >
                <Text style={ExtraStyles.smallButtonText}>Sửa</Text>
              </Pressable>
              <Pressable style={ExtraStyles.smallButton} disabled={busyId === p.id} onPress={() => handleToggle(p)}>
                <Text style={ExtraStyles.smallButtonText}>{p.isActive ? 'Ẩn' : 'Hiện'}</Text>
              </Pressable>
              <Pressable
                style={[ExtraStyles.smallButton, ExtraStyles.smallButtonDanger]}
                disabled={busyId === p.id}
                onPress={() => confirmDelete(p)}
              >
                {busyId === p.id ? (
                  <ActivityIndicator color={COLORS.danger} />
                ) : (
                  <Text style={ExtraStyles.smallButtonDangerText}>Xoá</Text>
                )}
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
