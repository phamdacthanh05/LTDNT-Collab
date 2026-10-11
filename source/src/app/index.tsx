import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { fetchProducts, type Product } from '../services/api';
import { fetchConversations } from '../services/chat.api';
import { fetchWallet } from '../services/wallet.api';
import { COLORS, GlobalStyles } from '../styles/GlobalStyles';

const FEATURED_COUNT = 6;

/* ------------------------------------------------------------------ */
/*  Design tokens - ĐỒNG BỘ với GlobalStyles.COLORS (OCEAN BLUE)       */
/* ------------------------------------------------------------------ */
const T = {
  bg: COLORS.background,
  sidebar: COLORS.surface,
  card: COLORS.surface,
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,
  primarySoft: COLORS.primarySoft,
  accent: COLORS.accent,
  accentSoft: COLORS.accentSoft,
  text: COLORS.textPrimary,
  muted: COLORS.textSecondary,
  border: COLORS.border,
  danger: COLORS.danger,
  shadow: COLORS.shadow,
};

// Sidebar luôn mở, chiều rộng cố định nhưng co lại trên màn hình nhỏ
const SCREEN_W = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_W < 400 ? 210 : 244;

type MenuItem = {
  key: string;
  icon: string;
  label: string;
  hint: string;
  path: string;
  params?: Record<string, string>;
  badge?: number;
};

/* ------------------------------------------------------------------ */
/*  Screen                                                            */
/* ------------------------------------------------------------------ */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoading, logout } = useAuth();
  const { addItem, totalQuantity } = useCart();
  const isAdmin = user?.role === 'ADMIN';

  const [unreadChat, setUnreadChat] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  /* ---------------- data loading ---------------- */
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

  useFocusEffect(
    useCallback(() => {
      if (!user || isAdmin) return;
      fetchWallet()
        .then((w) => setBalance(Number(w.balance)))
        .catch(() => {});
    }, [user, isAdmin])
  );

  useEffect(() => {
    loadUnread();
  }, [loadUnread]);
  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  /* ---------------- loading ---------------- */
  if (isLoading) {
    return (
      <SafeAreaView style={GlobalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  /* ---------------- guest ---------------- */
  if (!user) {
    return (
      <SafeAreaView style={GlobalStyles.screen} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={GlobalStyles.authContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={GlobalStyles.logoArea}>
            <View style={GlobalStyles.cartCircle}>
              <Text style={GlobalStyles.cartIcon}>🛒</Text>
            </View>
            <Text style={GlobalStyles.logoText}>DIGITAL RESOURCES</Text>
            <Text style={GlobalStyles.logoSubText}>Kho tài nguyên số dành cho bạn</Text>
          </View>
          <View style={GlobalStyles.box}>
            <Text style={GlobalStyles.title}>Mọi tài nguyên, một nơi</Text>
            <Text style={GlobalStyles.subtitle}>
              Tool, tài khoản số, Canva Pro và nhiều sản phẩm hữu ích — nhanh, gọn và dễ sử dụng.
            </Text>
            <Pressable
              style={({ pressed }) => [GlobalStyles.button, pressed && GlobalStyles.buttonPressed]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={GlobalStyles.buttonText}>Đăng nhập</Text>
            </Pressable>
            <View style={{ height: 12 }} />
            <Pressable
              style={({ pressed }) => [
                GlobalStyles.buttonOutline,
                pressed && GlobalStyles.buttonOutlinePressed,
              ]}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={GlobalStyles.buttonOutlineText}>Tạo tài khoản miễn phí</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------- menus ---------------- */
  const buyerMenu: MenuItem[] = [
    { key: 'products', icon: '🛍️', label: 'Sản phẩm', hint: 'Khám phá kho tài nguyên', path: '/products' },
    { key: 'wallet', icon: '💰', label: 'Ví của tôi', hint: 'Nạp tiền qua MoMo', path: '/wallet' },
    { key: 'purchases', icon: '🔑', label: 'Lịch sử mua hàng', hint: 'Xoá sau 7 ngày', path: '/purchases' },
    { key: 'chat', icon: '💬', label: 'Tin nhắn', hint: 'Liên hệ & hỗ trợ', path: '/chat', badge: unreadChat },
    { key: 'orders', icon: '📦', label: 'Đơn hàng', hint: 'Theo dõi giao dịch', path: '/profile', params: { tab: 'orders' } },
    { key: 'profile', icon: '👤', label: 'Tài khoản', hint: 'Thông tin & bảo mật', path: '/profile' },
  ];

  const adminMenu: MenuItem[] = [
    { key: 'support', icon: '💬', label: 'Hội thoại khách', hint: 'Xem & trả lời khách', path: '/admin/support-list' },
    { key: 'products', icon: '🛍️', label: 'Quản lý sản phẩm', hint: 'Thêm, sửa, xoá', path: '/admin/products' },
    { key: 'stock', icon: '🗄️', label: 'Kho tài khoản', hint: 'Xem & nhập kho', path: '/admin/accounts' },
    { key: 'profile', icon: '👤', label: 'Tài khoản', hint: 'Thông tin & bảo mật', path: '/profile' },
    { key: 'users', icon: '👥', label: 'Quản lý người dùng', hint: 'Thêm, sửa, xoá tài khoản', path: '/admin/users' },
  ];

  const menuItems = isAdmin ? adminMenu : buyerMenu;
  const initials = (user.fullName || '?').trim().charAt(0).toUpperCase();

  const go = (item: MenuItem) => {
    if (item.params) {
      router.push({ pathname: item.path, params: item.params } as any);
    } else {
      router.push(item.path as any);
    }
  };

  /* ---------------- main ---------------- */
  return (
    <View style={styles.root}>
      {/* ================= SIDEBAR (luôn mở, bên trái) ================= */}
      <View
        style={[
          styles.sidebar,
          { width: SIDEBAR_WIDTH, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 14 },
        ]}
      >
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Text style={{ fontSize: 16 }}>🛒</Text>
          </View>
          <Text style={styles.brandText} numberOfLines={1}>
            DIGITAL{'\n'}RESOURCES
          </Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.fullName}
            </Text>
            <View style={[styles.rolePill, isAdmin && styles.rolePillAdmin]}>
              <Text style={[styles.rolePillText, isAdmin && styles.rolePillTextAdmin]}>
                {isAdmin ? 'Quản trị viên' : 'Khách hàng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet (buyer only) */}
        {!isAdmin && balance !== null && (
          <Pressable
            onPress={() => router.push('/wallet' as any)}
            style={({ pressed }) => [styles.walletCard, pressed && styles.pressed]}
          >
            <Text style={styles.walletLabel}>Số dư ví</Text>
            <Text style={styles.walletValue}>{balance.toLocaleString('vi-VN')}đ</Text>
          </Pressable>
        )}

        {/* Menu */}
        <Text style={styles.sectionLabel}>CHỨC NĂNG</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => go(item)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <View style={styles.menuIconWrap}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.menuHint} numberOfLines={1}>
                  {item.hint}
                </Text>
              </View>
              {!!item.badge && item.badge > 0 ? (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              ) : (
                <Text style={styles.menuChevron}>›</Text>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
        >
          <Text style={styles.logoutIcon}>⏻</Text>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
        <Text style={styles.version}>v1.0</Text>
      </View>

      {/* ================= MAIN CONTENT (bên phải) ================= */}
      <SafeAreaView style={styles.main} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{isAdmin ? 'BẢNG ĐIỀU KHIỂN' : 'XIN CHÀO 👋'}</Text>
            <Text style={styles.topTitle} numberOfLines={1}>
              {isAdmin ? 'Quản trị hệ thống' : 'Kho tài nguyên số'}
            </Text>
          </View>

          {!isAdmin && (
            <Pressable
              onPress={() => router.push('/cart')}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Giỏ hàng"
            >
              <Text style={{ fontSize: 19 }}>🛒</Text>
              {totalQuantity > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalQuantity}</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>

        {/* Scroll content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroBlobA} />
            <View style={styles.heroBlobB} />

            <Text style={styles.heroEyebrow}>DIGITAL RESOURCES</Text>
            <Text style={styles.heroTitle}>
              {isAdmin ? 'Bảng điều khiển Admin' : 'Kho tài nguyên số của bạn'}
            </Text>
            <Text style={styles.heroText}>
              {isAdmin
                ? 'Quản lý sản phẩm, kho tài khoản và trả lời khách hàng.'
                : 'Nạp tiền vào ví, mua sản phẩm và nhận hỗ trợ ngay trong một ứng dụng.'}
            </Text>

            <Pressable
              onPress={() => router.push((isAdmin ? '/admin/products' : '/products') as any)}
              style={({ pressed }) => [styles.heroCta, pressed && styles.heroCtaPressed]}
            >
              <Text style={styles.heroCtaText}>
                {isAdmin ? 'Quản lý sản phẩm' : 'Khám phá ngay'}
              </Text>
              <Text style={styles.heroCtaArrow}>›</Text>
            </Pressable>
          </View>

          {/* Featured Section (Buyer only) */}
          {!isAdmin && featuredProducts.length > 0 && (
            <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
                <Pressable onPress={() => router.push('/products' as any)}>
                  <Text style={styles.seeAllText}>Xem tất cả ›</Text>
                </Pressable>
              </View>
              <View style={styles.productsGrid}>
                {featuredProducts.map((product) => (
                  <View key={product.id} style={{ width: '48%', marginBottom: 12 }}>
                    <ProductCard
                      product={product}
                      onPress={() => router.push(`/products/${product.id}` as any)}
                      onAddToCart={() => addItem(product)}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: T.bg,
  },
  sidebar: {
    backgroundColor: T.sidebar,
    borderRightWidth: 1,
    borderRightColor: T.border,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    backgroundColor: T.bg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: T.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: T.primary,
    lineHeight: 15,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.primarySoft,
    padding: 8,
    borderRadius: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: T.text,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  rolePillAdmin: {
    backgroundColor: T.accentSoft,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: T.muted,
  },
  rolePillTextAdmin: {
    color: T.accent,
  },
  walletCard: {
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.border,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  walletLabel: {
    fontSize: 11,
    color: T.muted,
  },
  walletValue: {
    fontSize: 15,
    fontWeight: '800',
    color: T.primary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.muted,
    marginBottom: 6,
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  menuItemPressed: {
    backgroundColor: T.primarySoft,
  },
  menuIconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: 8,
  },
  menuIcon: {
    fontSize: 16,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  menuHint: {
    fontSize: 10,
    color: T.muted,
  },
  menuChevron: {
    fontSize: 16,
    color: T.muted,
    fontWeight: '600',
  },
  menuBadge: {
    backgroundColor: T.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  logoutBtnPressed: {
    opacity: 0.7,
  },
  logoutIcon: {
    fontSize: 16,
    color: T.danger,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.danger,
  },
  version: {
    fontSize: 10,
    color: T.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    backgroundColor: T.card,
  },
  greeting: {
    fontSize: 11,
    fontWeight: '700',
    color: T.muted,
    letterSpacing: 0.5,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: T.text,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: T.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: T.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  hero: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: T.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBlobA: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBlobB: {
    position: 'absolute',
    right: 40,
    bottom: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  heroCtaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: T.primary,
    marginRight: 4,
  },
  heroCtaArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: T.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: T.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: T.primary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.7,
  },
});