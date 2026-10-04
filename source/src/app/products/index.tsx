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
import { useCart } from '../../contexts/CartContext';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { fetchProducts, type Product } from '../../services/api';
import { COLORS } from '../../styles/GlobalStyles';
import { ProductListStyles as styles } from '../../styles/ProductListStyles';

export default function ProductListScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { allowed } = useRoleGuard('BUYER');
  const { addItem, totalQuantity } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.');
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      const matchSearch =
        !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, search, selectedCategory]);

  if (authLoading || loading || !allowed) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main} edges={['top']}>
      {/* Top Bar đồng bộ Dashboard */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>CỬA HÀNG</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Sản phẩm
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/cart')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Text style={{ fontSize: 19 }}>🛒</Text>
          {totalQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalQuantity}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm sản phẩm..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Category Chips */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <Pressable
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              Tất cả
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void load()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.productRow}
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm</Text>
            <Text style={styles.emptySubtitle}>
              {error ? 'Không thể tải danh sách.' : 'Không tìm thấy sản phẩm phù hợp.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productCardWrap}>
            <ProductCard
              product={item}
              onPress={() => router.push(`/products/${item.id}`)}
              onAddToCart={() => addItem(item, 1)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}