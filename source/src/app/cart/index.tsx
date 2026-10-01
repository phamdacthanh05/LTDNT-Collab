import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';
import { useRoleGuard } from '../../hooks/use-role-guard';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';
import { ExtraStyles } from '../../styles/ExtraStyles';

function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')}đ`;
}

export default function CartScreen() {
  const router = useRouter();
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const { allowed } = useRoleGuard('BUYER');

  if (!allowed) return <SafeAreaView style={GlobalStyles.center} />;

  return (
    <SafeAreaView style={ExtraStyles.screen} edges={['top']}>
      <View style={ExtraStyles.screenHeader}>
        <View style={GlobalStyles.productHeaderRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={GlobalStyles.topBackText}>‹ Quay lại</Text>
          </Pressable>
        </View>
        <Text style={[ExtraStyles.screenHeaderTitle, { marginTop: 6 }]}>Giỏ hàng</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={[GlobalStyles.center, { paddingTop: 60 }]}>
            <Text style={GlobalStyles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={GlobalStyles.emptyText}>Hãy chọn vài sản phẩm để bắt đầu mua sắm nhé.</Text>
            <Pressable
              style={[GlobalStyles.retryButton, { marginTop: 16 }]}
              onPress={() => router.push('/products')}
            >
              <Text style={GlobalStyles.retryButtonText}>Xem sản phẩm</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={ExtraStyles.cartLine}>
            <View style={ExtraStyles.cartLineImage}>
              {item.product.imageUrl ? (
                <Image
                  source={{ uri: item.product.imageUrl }}
                  style={{ width: '100%', height: '100%', borderRadius: 14 }}
                  contentFit="cover"
                />
              ) : null}
            </View>

            <View style={ExtraStyles.cartLineBody}>
              <Text style={ExtraStyles.cartLineName} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={ExtraStyles.cartLinePrice}>{formatPrice(Number(item.product.price))}</Text>

              <View style={ExtraStyles.qtyRow}>
                <Pressable
                  style={ExtraStyles.qtyButton}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <Text style={ExtraStyles.qtyButtonText}>−</Text>
                </Pressable>
                <Text style={ExtraStyles.qtyValue}>{item.quantity}</Text>
                <Pressable
                  style={ExtraStyles.qtyButton}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Text style={ExtraStyles.qtyButtonText}>+</Text>
                </Pressable>

                <Pressable
                  style={ExtraStyles.cartLineRemove}
                  onPress={() => removeItem(item.product.id)}
                >
                  <Text style={ExtraStyles.cartLineRemoveText}>Xoá</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={[GlobalStyles.footer, { flexDirection: 'row', alignItems: 'center' }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Tổng cộng</Text>
            <Text style={{ color: COLORS.primaryDark, fontSize: 20, fontWeight: '900' }}>
              {formatPrice(totalPrice)}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [GlobalStyles.buyButton, { paddingHorizontal: 26 }, pressed && GlobalStyles.buyButtonPressed]}
            onPress={() => router.push('/checkout')}
          >
            <Text style={GlobalStyles.buyButtonText}>ĐẶT HÀNG</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
