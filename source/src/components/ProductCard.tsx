import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import type { Product } from '../services/api';
import { GlobalStyles } from '../styles/GlobalStyles';
import { ExtraStyles } from '../styles/ExtraStyles';

function formatPrice(price: string) {
  const value = Number(price);
  if (!Number.isFinite(value)) return 'Liên hệ';
  return `${value.toLocaleString('vi-VN')}đ`;
}

type Props = {
  product: Product;
  onPress: () => void; // Bấm vào card -> xem chi tiết sản phẩm
  onAddToCart: () => void; // Bấm nút -> thêm nhanh vào giỏ hàng
};

// Card hiển thị 1 sản phẩm: ảnh, tên, danh mục, giá và nút "Thêm vào giỏ"
export function ProductCard({ product, onPress, onAddToCart }: Props) {
  const inStock = Number(product.stock) > 0;

  return (
    <Pressable
      style={({ pressed }) => [GlobalStyles.card, pressed && GlobalStyles.cardPressed]}
      onPress={onPress}
    >
      <View style={GlobalStyles.imagePlaceholder}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={GlobalStyles.productImage}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <Text style={GlobalStyles.imagePlaceholderIcon}>🛒</Text>
        )}
      </View>

      <Text style={GlobalStyles.cardName} numberOfLines={2}>
        {product.name}
      </Text>
      {product.category ? <Text style={GlobalStyles.cardCategory}>{product.category}</Text> : null}
      <Text style={GlobalStyles.cardPrice}>{formatPrice(product.price)}</Text>

      <Pressable
        style={ExtraStyles.cardAddButton}
        disabled={!inStock}
        onPress={(e) => {
          e.stopPropagation(); // không mở trang chi tiết khi bấm nút này
          onAddToCart();
        }}
      >
        <Text style={ExtraStyles.cardAddButtonText}>
          {inStock ? '+ Thêm vào giỏ' : 'Hết hàng'}
        </Text>
      </Pressable>
    </Pressable>
  );
}
