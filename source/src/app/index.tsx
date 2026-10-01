import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';
import { fetchConversations } from '../services/chat.api';
import { fetchProducts, type Product } from '../services/api';
import { fetchWallet } from '../services/wallet.api';
import { COLORS, GlobalStyles } from '../styles/GlobalStyles';
import { ExtraStyles } from '../styles/ExtraStyles';

// Chỉ hiện vài sản phẩm nổi bật đầu tiên trên trang chủ, xem hết thì qua trang Sản phẩm
const FEATURED_COUNT = 6;

type MenuItem = {
  key: string;
  icon: string;
  label: string;
  hint: string;
  path: string;
  params?: Record<string, string>;
  badge?: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { addItem, totalQuantity } = useCart();
  const isAdmin = user?.role === 'ADMIN'; // phân quyền: Admin thấy bảng quản trị, Buyer thấy cửa hàng
  const [unreadChat, setUnreadChat] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [balance, setBalance] = useState<number | null>(null); // số dư ví — CHỈ khách mới có

  const loadUnread = useCallback(async () => {
    if (!user || isAdmin) return;
    try {
      const conversations = await fetchConversations();
      setUnreadChat(conversations.reduce((sum, c) => sum + c.unreadCount, 0));
    } catch {}
  }, [user, isAdmin]);

  const loadFeatured = useCallback(async () => {
    if (!user || isAdmin) return;
    try {
      const data = await fetchProducts();
      setFeaturedProducts(data.slice(0, FEATURED_COUNT));
    } catch {}
  }, [user, isAdmin]);

  // Số dư ví: tải lại mỗi lần quay về trang chủ (vừa nạp tiền / vừa mua hàng xong). Admin không có ví.
  useFocusEffect(
    useCallback(() => {
      if (!user || isAdmin) return;
      fetchWallet().then((w) => setBalance(Number(w.balance))).catch(() => {});
    }, [user, isAdmin])
  );

  useEffect(() => { loadUnread(); }, [loadUnread]);
  useEffect(() => { loadFeatured(); }, [loadFeatured]);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  if (isLoading) {
    return <SafeAreaView style={GlobalStyles.center}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>;
  }

  if (!user) {
    return (
      <SafeAreaView style={GlobalStyles.screen} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={GlobalStyles.authContainer} showsVerticalScrollIndicator={false}>
          <View style={GlobalStyles.logoArea}>
            <View style={GlobalStyles.cartCircle}><Text style={GlobalStyles.cartIcon}>🛒</Text></View>
            <Text style={GlobalStyles.logoText}>DIGITAL RESOURCES</Text>
            <Text style={GlobalStyles.logoSubText}>Kho tài nguyên số dành cho bạn</Text>
          </View>
          <View style={GlobalStyles.box}>
            <Text style={GlobalStyles.title}>Mọi tài nguyên, một nơi</Text>
            <Text style={GlobalStyles.subtitle}>
              Tool, tài khoản số, Canva Pro và nhiều sản phẩm hữu ích — nhanh, gọn và dễ sử dụng.
            </Text>
            <Pressable style={({ pressed }) => [GlobalStyles.button, pressed && GlobalStyles.buttonPressed]} onPress={() => router.push('/auth/login')}>
              <Text style={GlobalStyles.buttonText}>Đăng nhập</Text>
            </Pressable>
            <View style={{ height: 12 }} />
            <Pressable style={({ pressed }) => [GlobalStyles.buttonOutline, pressed && GlobalStyles.buttonOutlinePressed]} onPress={() => router.push('/auth/register')}>
              <Text style={GlobalStyles.buttonOutlineText}>Tạo tài khoản miễn phí</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const buyerMenu: MenuItem[] = [
    { key: 'products', icon: '🛍️', label: 'Sản phẩm', hint: 'Khám phá kho tài nguyên', path: '/products' },
    { key: 'wallet', icon: '💰', label: 'Ví của tôi', hint: 'Nạp tiền qua MoMo', path: '/wallet' },
    { key: 'purchases', icon: '🔑', label: 'Lịch sử mua hàng', hint: 'Tài khoản đã mua (xoá sau 7 ngày)', path: '/purchases' },
    { key: 'chat', icon: '💬', label: 'Tin nhắn', hint: 'Liên hệ & hỗ trợ', path: '/chat', badge: unreadChat },
    { key: 'orders', icon: '📦', label: 'Đơn hàng', hint: 'Theo dõi giao dịch', path: '/profile', params: { tab: 'orders' } },
    { key: 'profile', icon: '👤', label: 'Tài khoản', hint: 'Thông tin & bảo mật', path: '/profile' },
  ];

  const adminMenu: MenuItem[] = [
    { key: 'support', icon: '💬', label: 'Hội thoại khách', hint: 'Xem & trả lời khách hàng', path: '/admin/support-list' },
    { key: 'products', icon: '🛍️', label: 'Quản lý sản phẩm', hint: 'Thêm, sửa, xoá sản phẩm', path: '/admin/products' },
    { key: 'stock', icon: '🗄️', label: 'Kho tài khoản', hint: 'Xem & nhập tài khoản bán', path: '/admin/accounts' },
    { key: 'profile', icon: '👤', label: 'Tài khoản', hint: 'Thông tin & bảo mật', path: '/profile' },
  ];

  const menuItems = isAdmin ? adminMenu : buyerMenu;

  return (
    <SafeAreaView style={ExtraStyles.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[ExtraStyles.screenHeader, { borderBottomWidth: 0, paddingBottom: 6 }]}>
          <View style={GlobalStyles.productHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={ExtraStyles.homeGreeting}>{isAdmin ? 'QUẢN TRỊ VIÊN' : 'CHÀO MỪNG TRỞ LẠI'}</Text>
              <Text style={ExtraStyles.homeUserName}>{user.fullName}</Text>
            </View>
            {!isAdmin && balance !== null && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Số dư ví"
                onPress={() => router.push('/wallet' as any)}
                style={ExtraStyles.walletMiniChip}
              >
                <Text style={ExtraStyles.walletMiniChipText}>💰 {balance.toLocaleString('vi-VN')}đ</Text>
              </Pressable>
            )}
            {!isAdmin && (
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
            )}

            <Pressable onPress={handleLogout} style={({ pressed }) => [GlobalStyles.logoutButton, { marginLeft: 8 }, pressed && GlobalStyles.logoutButtonPressed]}>
              <Text style={GlobalStyles.logoutText}>Đăng xuất</Text>
            </Pressable>
          </View>
        </View>

        <View style={ExtraStyles.homeHero}>
          <Text style={ExtraStyles.homeHeroEyebrow}>DIGITAL RESOURCES</Text>
          <Text style={ExtraStyles.homeHeroTitle}>{isAdmin ? 'Bảng điều khiển Admin' : 'Kho tài nguyên số của bạn'}</Text>
          <Text style={ExtraStyles.homeHeroText}>
            {isAdmin
              ? 'Quản lý sản phẩm, kho tài khoản và trả lời khách hàng.'
              : 'Nạp tiền vào ví, mua sản phẩm và nhận hỗ trợ ngay trong một ứng dụng.'}
          </Text>
        </View>

        {!isAdmin && featuredProducts.length > 0 && (
          <>
            <Text style={ExtraStyles.homeSectionTitle}>Sản phẩm nổi bật</Text>
            <Text style={ExtraStyles.homeSectionText}>Vài gợi ý từ kho tài nguyên số.</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[ExtraStyles.featuredRow, { paddingTop: 12 }]}
            >
              {featuredProducts.map((product) => (
                <View key={product.id} style={ExtraStyles.featuredCardWrap}>
                  <ProductCard
                    product={product}
                    onPress={() => router.push(`/products/${product.id}`)}
                    onAddToCart={() => addItem(product, 1)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={ExtraStyles.homeSectionTitle}>Truy cập nhanh</Text>
        <Text style={ExtraStyles.homeSectionText}>Chọn một chức năng để bắt đầu.</Text>

        <View style={ExtraStyles.menuGrid}>
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [ExtraStyles.menuItem, pressed && ExtraStyles.menuItemPressed]}
              onPress={() => item.params ? router.push({ pathname: item.path, params: item.params } as any) : router.push(item.path as any)}
            >
              {!!item.badge && item.badge > 0 && (
                <View style={ExtraStyles.menuBadge}><Text style={ExtraStyles.menuBadgeText}>{item.badge}</Text></View>
              )}
              <View style={ExtraStyles.menuIconCircle}><Text style={ExtraStyles.menuIcon}>{item.icon}</Text></View>
              <Text style={ExtraStyles.menuLabel}>{item.label}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 5 }}>{item.hint}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
