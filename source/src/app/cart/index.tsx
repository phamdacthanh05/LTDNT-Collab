import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { CartStyles as styles } from '../../styles/CartStyles';
import { formatPrice } from '../../utils/format';

export default function CartScreen() {
  const router = useRouter();
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const { allowed } = useRoleGuard('BUYER');

  if (!allowed) return <SafeAreaView style={styles.screen} />;

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

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
          <Text style={styles.greeting}>GIỎ HÀNG</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Sản phẩm đã chọn
          </Text>
        </View>

        {itemCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{itemCount}</Text>
          </View>
        )}
      </View>

      {/* ============ Danh sách sản phẩm ============ */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptyText}>
              Hãy chọn vài sản phẩm để bắt đầu mua sắm nhé.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
              onPress={() => router.push('/products')}
            >
              <Text style={styles.emptyButtonText}>Xem sản phẩm</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cartLine}>
            <View style={styles.cartLineImage}>
              {item.product.imageUrl ? (
                <Image
                  source={{ uri: item.product.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 28 }}>🛍️</Text>
                </View>
              )}
            </View>

            <View style={styles.cartLineBody}>
              <Text style={styles.cartLineName} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={styles.cartLinePrice}>
                {formatPrice(Number(item.product.price))}
              </Text>

              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <Text style={styles.qtyButtonText}>−</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>

                <Pressable
                  style={styles.removeBtn}
                  onPress={() => removeItem(item.product.id)}
                >
                  <Text style={styles.removeBtnText}>Xoá</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {/* ============ Footer: Tổng tiền + Đặt hàng ============ */}
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.checkoutBtn, pressed && styles.checkoutBtnPressed]}
            onPress={() => router.push('/checkout')}
            accessibilityRole="button"
            accessibilityLabel="Đặt hàng"
          >
            <Text style={styles.checkoutBtnText}>ĐẶT HÀNG</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}