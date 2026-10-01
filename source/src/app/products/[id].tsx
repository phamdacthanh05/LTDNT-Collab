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
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';
import { ExtraStyles } from '../../styles/ExtraStyles';

function formatPrice(price: string) {
  const value = Number(price);
  if (!Number.isFinite(value)) return 'Liên hệ';
  return `${value.toLocaleString('vi-VN')}đ`;
}

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { addItem } = useCart();
  const { allowed } = useRoleGuard('BUYER');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // số lượng người dùng muốn mua

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
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Không thể tải sản phẩm.');
        }
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
      <SafeAreaView style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={GlobalStyles.center}>
        <Text style={GlobalStyles.errorText}>{error || 'Không tìm thấy sản phẩm.'}</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [GlobalStyles.backButton, pressed && GlobalStyles.buttonPressed]}
        >
          <Text style={GlobalStyles.backButtonText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const inStock = Number(product.stock) > 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    router.push('/cart');
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={GlobalStyles.detailContainer} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [GlobalStyles.topBack, pressed && GlobalStyles.topBackPressed]}
        >
          <Text style={GlobalStyles.topBackText}>‹  Quay lại</Text>
        </Pressable>

        <View style={GlobalStyles.detailImage}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={GlobalStyles.detailProductImage}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <Text style={GlobalStyles.detailImageIcon}>🛒</Text>
          )}
        </View>

        <View style={GlobalStyles.detailCard}>
          {product.category ? <Text style={GlobalStyles.category}>{product.category}</Text> : null}
          <Text style={GlobalStyles.name}>{product.name}</Text>
          <Text style={GlobalStyles.price}>{formatPrice(product.price)}</Text>

          <Text style={[GlobalStyles.stock, !inStock && GlobalStyles.stockOut]}>
            {inStock ? `Còn ${product.stock} sản phẩm` : 'Tạm hết hàng'}
          </Text>

          {/* Chọn số lượng muốn mua */}
          {inStock && (
            <View style={ExtraStyles.qtyRow}>
              <Pressable
                style={ExtraStyles.qtyButton}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Text style={ExtraStyles.qtyButtonText}>−</Text>
              </Pressable>
              <Text style={ExtraStyles.qtyValue}>{quantity}</Text>
              <Pressable
                style={ExtraStyles.qtyButton}
                onPress={() => setQuantity((q) => Math.min(Number(product.stock), q + 1))}
              >
                <Text style={ExtraStyles.qtyButtonText}>+</Text>
              </Pressable>
            </View>
          )}

          {product.description ? (
            <View style={GlobalStyles.descBox}>
              <Text style={GlobalStyles.descTitle}>Mô tả sản phẩm</Text>
              <Text style={GlobalStyles.descText}>{product.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[GlobalStyles.footer, { flexDirection: 'row', gap: 10 }]}>
        <Pressable
          style={({ pressed }) => [
            GlobalStyles.buttonOutline,
            { flex: 1 },
            pressed && GlobalStyles.buttonOutlinePressed,
          ]}
          disabled={!inStock}
          onPress={handleAddToCart}
        >
          <Text style={GlobalStyles.buttonOutlineText}>Thêm vào giỏ</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            GlobalStyles.buyButton,
            { flex: 1 },
            !inStock && GlobalStyles.buyButtonDisabled,
            pressed && inStock && GlobalStyles.buyButtonPressed,
          ]}
          disabled={!inStock}
          onPress={handleBuyNow}
        >
          <Text style={GlobalStyles.buyButtonText}>{inStock ? 'MUA NGAY' : 'HẾT HÀNG'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
