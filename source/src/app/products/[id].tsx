import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { fetchProductDetail, type Product } from '../../services/api';
import { COLORS } from '../../styles/GlobalStyles';
import { ProductDetailStyles as styles } from '../../styles/ProductDetailStyles';
import { formatPrice } from '../../utils/format';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { addItem } = useCart();
  const { allowed } = useRoleGuard('BUYER');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setError('Thiếu mã sản phẩm.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductDetail(id);
        if (mounted) setProduct(data);
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !allowed) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: COLORS.danger, fontSize: 14, marginBottom: 16 }}>
          {error || 'Không tìm thấy sản phẩm.'}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.btnSolid}>
          <Text style={styles.btnSolidText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const inStock = Number(product.stock) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🛒</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          {product.category && <Text style={styles.category}>{product.category}</Text>}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          <Text style={[styles.stockBadge, inStock ? styles.stockIn : styles.stockOut]}>
            {inStock ? `Còn ${product.stock} sản phẩm` : 'Tạm hết hàng'}
          </Text>

          {inStock && (
            <View style={styles.qtyRow}>
              <Pressable
                style={styles.qtyButton}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                style={styles.qtyButton}
                onPress={() =>
                  setQuantity((q) => Math.min(Number(product.stock), q + 1))
                }
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </Pressable>
            </View>
          )}

          {product.description && (
            <View style={styles.descBox}>
              <Text style={styles.descTitle}>Mô tả sản phẩm</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
          disabled={!inStock}
          onPress={() => {
            addItem(product, quantity);
            router.push('/cart');
          }}
        >
          <Text style={styles.btnOutlineText}>Thêm vào giỏ</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.btnSolid,
            !inStock && styles.btnSolidDisabled,
            pressed && inStock && styles.pressed,
          ]}
          disabled={!inStock}
          onPress={() => {
            addItem(product, quantity);
            router.push('/checkout');
          }}
        >
          <Text style={styles.btnSolidText}>
            {inStock ? 'MUA NGAY' : 'HẾT HÀNG'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}