import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../../components/ProductCard';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { useCart } from '../../contexts/CartContext';
import { fetchProducts, type Product } from '../../services/api';
import { ExtraStyles } from '../../styles/ExtraStyles';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

export default function ProductListScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { allowed } = useRoleGuard('BUYER'); // Admin không vào được trang mua hàng
  const { addItem, totalQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tìm kiếm theo tên + lọc theo danh mục -> đều xử lý ở client, không cần thêm API mới
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải sản phẩm.');
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    let mounted = true;

    const run = async () => {
      setLoading(true);
      await load();
      if (mounted) setLoading(false);
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, router, load]);

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đăng xuất.';
      setError(message);
    }
  };

  // Lấy danh sách danh mục có sẵn từ chính danh sách sản phẩm đã tải về
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Áp dụng tìm kiếm + lọc danh mục lên danh sách sản phẩm
  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, search, selectedCategory]);

  if (authLoading || loading || !allowed) {
    return (
      <SafeAreaView style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.container} edges={['top']}>
      <View style={GlobalStyles.productHeader}>
        <View style={GlobalStyles.productHeaderRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={GlobalStyles.eyebrow}>DIGITAL RESOURCES</Text>
            <Text style={GlobalStyles.headerTitle}>Sản phẩm</Text>
            <Text style={GlobalStyles.headerSubtitle} numberOfLines={1}>
              Xin chào, {user?.fullName || 'bạn'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Giỏ hàng"
            onPress={() => router.push('/cart')}
            style={ExtraStyles.cartButton}
          >
            <Text style={ExtraStyles.cartButtonIcon}>🛒</Text>
            {totalQuantity > 0 && (
              <View style={ExtraStyles.cartButtonBadge}>
                <Text style={ExtraStyles.cartButtonBadgeText}>{totalQuantity}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đăng xuất"
            onPress={handleLogout}
            style={({ pressed }) => [
              GlobalStyles.logoutButton,
              { marginLeft: 8 },
              pressed && GlobalStyles.logoutButtonPressed,
            ]}
          >
            <Text style={GlobalStyles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </View>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={ExtraStyles.searchBar}>
        <Text style={ExtraStyles.searchIcon}>🔍</Text>
        <TextInput
          style={ExtraStyles.searchInput}
          placeholder="Tìm sản phẩm..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Chip lọc theo danh mục */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ExtraStyles.categoryRow}
        >
          <Pressable
            style={[ExtraStyles.categoryChip, !selectedCategory && ExtraStyles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[ExtraStyles.categoryChipText, !selectedCategory && ExtraStyles.categoryChipTextActive]}
            >
              Tất cả
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[ExtraStyles.categoryChip, selectedCategory === cat && ExtraStyles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              <Text
                style={[
                  ExtraStyles.categoryChipText,
                  selectedCategory === cat && ExtraStyles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {error ? (
        <View style={GlobalStyles.errorBox}>
          <Text style={GlobalStyles.errorText}>{error}</Text>
          <Pressable
            onPress={() => void load()}
            style={({ pressed }) => [GlobalStyles.retryButton, pressed && GlobalStyles.buttonPressed]}
          >
            <Text style={GlobalStyles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={GlobalStyles.listContent}
        columnWrapperStyle={GlobalStyles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={GlobalStyles.center}>
            <Text style={GlobalStyles.emptyTitle}>Chưa có sản phẩm</Text>
            <Text style={GlobalStyles.emptyText}>
              {error ? 'Không thể tải danh sách sản phẩm.' : 'Không tìm thấy sản phẩm phù hợp.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/products/${item.id}`)}
            onAddToCart={() => addItem(item, 1)}
          />
        )}
      />
    </SafeAreaView>
  );
}
