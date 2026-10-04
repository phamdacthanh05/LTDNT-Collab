import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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
const TABLET_BREAKPOINT = 768;

/* ------------------------------------------------------------------ */
/*  Design tokens (đồng bộ GlobalStyles.COLORS - Ocean Blue)           */
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
/*  Screen                                                             */
/* ------------------------------------------------------------------ */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_W } = useWindowDimensions();

  const isMobile = SCREEN_W < TABLET_BREAKPOINT;
  const SIDEBAR_WIDTH = SCREEN_W < 400 ? 260 : 280;

  const { user, isLoading, logout } = useAuth();
  const { addItem, totalQuantity } = useCart();
  const isAdmin = user?.role === 'ADMIN';

  const [unreadChat, setUnreadChat] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  // ── Sidebar (drawer trên mobile) ──
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const slideAnim = useRef(new Animated.Value(isMobile ? 0 : 1)).current;

  // Tự reset khi đổi breakpoint (xoay máy, resize)
  useEffect(() => {
    const target = isMobile ? 0 : 1;
    setSidebarOpen(!isMobile);
    Animated.timing(slideAnim, {
      toValue: target,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isMobile, slideAnim]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

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
  ];

  const menuItems = isAdmin ? adminMenu : buyerMenu;
  const initials = (user.fullName || '?').trim().charAt(0).toUpperCase();

  const go = (item: MenuItem) => {
    if (isMobile) closeSidebar();
    // Đợi animation bắt đầu rồi mới điều hướng, cảm giác mượt hơn
    setTimeout(
      () => {
        if (item.params) {
          router.push({ pathname: item.path, params: item.params } as any);
        } else {
          router.push(item.path as any);
        }
      },
      isMobile ? 100 : 0
    );
  };

  /* ---------------- main ---------------- */
  return (
    <View style={styles.root}>
      {/* ============ Backdrop (chỉ mobile khi sidebar mở) ============ */}
      {isMobile && sidebarOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={closeSidebar}
          accessibilityLabel="Đóng menu"
        />
      )}

      {/* ================= SIDEBAR / DRAWER ================= */}
      <Animated.View
        style={[
          styles.sidebar,
          isMobile && styles.sidebarMobile,
          {
            width: SIDEBAR_WIDTH,
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 14,
          },
          isMobile && {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-SIDEBAR_WIDTH - 20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Brand row + nút đóng (mobile) */}
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Text style={{ fontSize: 16 }}>🛒</Text>
          </View>
          <Text style={styles.brandText} numberOfLines={1}>
            DIGITAL{'\n'}RESOURCES
          </Text>

          {isMobile && (
            <Pressable
              onPress={closeSidebar}
              style={styles.closeBtn}
              hitSlop={8}
              accessibilityLabel="Đóng menu"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.fullName}
            </Text>
            <View style={[styles.rolePill, isAdmin && styles.rolePillAdmin]}>
              <Text
                style={[styles.rolePillText, isAdmin && styles.rolePillTextAdmin]}
                numberOfLines={1}
              >
                {isAdmin ? 'Quản trị viên' : 'Khách hàng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet (buyer only) */}
        {!isAdmin && balance !== null && (
          <Pressable
            onPress={() => {
              if (isMobile) closeSidebar();
              setTimeout(() => router.push('/wallet' as any), isMobile ? 100 : 0);
            }}
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
              <View style={{ flex: 1, minWidth: 0 }}>
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
      </Animated.View>

      {/* ================= MAIN CONTENT ================= */}
      <SafeAreaView style={styles.main} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          {/* Hamburger (mobile) */}
          {isMobile && (
            <Pressable
              onPress={openSidebar}
              style={({ pressed }) => [styles.hamburgerBtn, pressed && styles.pressed]}
              accessibilityLabel="Mở menu"
              accessibilityRole="button"
            >
              <Text style={styles.hamburgerIcon}>☰</Text>
            </Pressable>
          )}

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.greeting} numberOfLines={1}>
              {isAdmin ? 'BẢNG ĐIỀU KHIỂN' : 'XIN CHÀO 👋'}
            </Text>
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
              onPress={() => {
                const target = isAdmin ? '/admin/products' : '/products';
                if (isMobile) closeSidebar();
                setTimeout(() => router.push(target as any), isMobile ? 100 : 0);
              }}
              style={({ pressed }) => [styles.heroCta, pressed && styles.heroCtaPressed]}
            >
              <Text style={styles.heroCtaText}>
                {isAdmin ? 'Quản lý sản phẩm' : 'Khám phá ngay'}
              </Text>
              <Text style={styles.heroCtaArrow}>→</Text>
            </Pressable>
          </View>

          {/* Featured products */}
          {!isAdmin && featuredProducts.length > 0 && (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
                <Pressable onPress={() => router.push('/products' as any)}>
                  <Text style={styles.sectionLink}>Xem tất cả</Text>
                </Pressable>
              </View>
              <Text style={styles.sectionSub}>Vài gợi ý từ kho tài nguyên số.</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredRow}
              >
                {featuredProducts.map((product) => (
                  <View key={product.id} style={styles.featuredCardWrap}>
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

          {/* Admin quick list */}
          {isAdmin && (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Tác vụ quản trị</Text>
              </View>
              <Text style={styles.sectionSub}>Chọn nhanh một khu vực cần xử lý.</Text>

              <View style={styles.adminList}>
                {adminMenu.map((item) => (
                  <Pressable
                    key={item.key}
                    onPress={() => go(item)}
                    style={({ pressed }) => [styles.adminRow, pressed && styles.menuItemPressed]}
                  >
                    <View style={styles.menuIconWrap}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuHint}>{item.hint}</Text>
                    </View>
                    <Text style={styles.menuChevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: T.bg,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.75 },

  // ========== Backdrop (mobile) ==========
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 15,
  },

  // ========== Sidebar ==========
  sidebar: {
    backgroundColor: T.sidebar,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: T.border,
    shadowColor: T.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 4, height: 0 },
    elevation: 4,
  },
  sidebarMobile: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 6, height: 0 },
    elevation: 16,
    borderRightWidth: 0,
  },

  // ========== Brand row ==========
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: T.text,
    letterSpacing: 1.4,
    lineHeight: 14,
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: T.muted,
    fontWeight: '800',
    marginTop: -2,
  },

  // ========== User card ==========
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  userName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -0.2,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: T.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 7,
    marginTop: 4,
  },
  rolePillAdmin: { backgroundColor: T.primarySoft },
  rolePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  rolePillTextAdmin: { color: T.primaryDark },

  // ========== Wallet card ==========
  walletCard: {
    backgroundColor: T.primarySoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  walletLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: T.primaryDark,
    opacity: 0.7,
  },
  walletValue: {
    fontSize: 17,
    fontWeight: '800',
    color: T.primaryDark,
    marginTop: 3,
    letterSpacing: -0.4,
  },

  // ========== Menu ==========
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: T.muted,
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 2,
  },
  menuItemPressed: { backgroundColor: T.bg },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 15 },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: T.text,
    letterSpacing: -0.1,
  },
  menuHint: { fontSize: 10.5, color: T.muted, marginTop: 1 },
  menuChevron: { fontSize: 18, color: '#C9CCDD', fontWeight: '700' },
  menuBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // ========== Logout ==========
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    marginTop: 8,
  },
  logoutBtnPressed: { opacity: 0.8 },
  logoutIcon: { fontSize: 13, color: T.danger, fontWeight: '800' },
  logoutText: { fontSize: 12.5, fontWeight: '800', color: T.danger },
  version: {
    textAlign: 'center',
    fontSize: 9.5,
    color: '#B9BDD0',
    marginTop: 8,
    letterSpacing: 0.3,
  },

  // ========== Main ==========
  main: { flex: 1, backgroundColor: T.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
    gap: 10,
  },
  greeting: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
    color: T.muted,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: T.text,
    marginTop: 2,
    letterSpacing: -0.3,
  },

  // ========== Hamburger (mobile) ==========
  hamburgerBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: T.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  hamburgerIcon: {
    fontSize: 20,
    color: T.text,
    fontWeight: '700',
    marginTop: -2,
  },

  // ========== Icon button (cart) ==========
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: T.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: T.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: T.bg,
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // ========== Hero ==========
  hero: {
    marginHorizontal: 18,
    borderRadius: 24,
    backgroundColor: T.primary,
    padding: 20,
    overflow: 'hidden',
    shadowColor: T.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  heroBlobA: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -60,
    right: -40,
  },
  heroBlobB: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(245,158,11,0.35)',
    bottom: -50,
    right: 30,
  },
  heroEyebrow: {
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.72)',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    letterSpacing: -0.4,
    lineHeight: 27,
  },
  heroText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 8,
    maxWidth: '95%',
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    marginTop: 16,
  },
  heroCtaPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  heroCtaText: { color: T.primaryDark, fontWeight: '800', fontSize: 13 },
  heroCtaArrow: { color: T.primaryDark, fontWeight: '800', fontSize: 15 },

  // ========== Sections ==========
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 26,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -0.3,
  },
  sectionLink: { fontSize: 12.5, fontWeight: '700', color: T.primary },
  sectionSub: {
    fontSize: 12,
    color: T.muted,
    paddingHorizontal: 18,
    marginTop: 4,
  },

  featuredRow: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 12,
  },
  featuredCardWrap: { width: 214 },

  // ========== Admin list ==========
  adminList: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 10,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
});