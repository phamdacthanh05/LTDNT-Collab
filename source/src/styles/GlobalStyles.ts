import { StyleSheet } from 'react-native';

/**
 * Design System chung cho toàn bộ ứng dụng.
 * ĐỒNG BỘ với Dashboard (app/index.tsx) - tone XANH NƯỚC BIỂN (OCEAN BLUE).
 *
 * ĐÂY LÀ NGUỒN CHÂN LÝ DUY NHẤT cho màu sắc và kích thước.
 * Mọi màn hình & file style khác PHẢI import COLORS/SIZES từ đây.
 */
export const COLORS = {
  // ---- Brand (XANH NƯỚC BIỂN) ----
  primary: '#0284C7',
  primaryDark: '#0369A1',
  primarySoft: '#E0F2FE',
  primaryLight: '#BAE6FD',

  // ---- Accent (điểm nhấn - Amber) ----
  accent: '#F59E0B',
  accentSoft: '#FEF3C7',

  // ---- Background & Surface ----
  background: '#F4F5FA',
  surface: '#FFFFFF',
  white: '#FFFFFF',

  // ---- Text ----
  textPrimary: '#14152B',
  textSecondary: '#8B90A8',
  textMuted: '#B9BDD0',

  // ---- Border & Input ----
  border: '#ECEDF5',
  inputBg: '#F7F9FC',

  // ---- Semantic ----
  link: '#0284C7',
  danger: '#FF5B6E',
  dangerSoft: '#FFF1F2',
  success: '#16A34A',
  successSoft: '#F0FDF4',
  warning: '#D97706',
  warningSoft: '#FFFBEB',

  // ---- Shadow ----
  shadow: '#1A1B2E',
} as const;

export const SIZES = {
  padding: 20,
  radius: 18,
  radiusSmall: 14,
  radiusRound: 999,
  fontXs: 12,
  fontSmall: 14,
  fontMedium: 15,
  fontLarge: 20,
  fontTitle: 28,
} as const;

export const GlobalStyles = StyleSheet.create({
  // ========== App shell ==========
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },

  // ========== Auth / welcome ==========
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
    backgroundColor: COLORS.background,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  cartCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cartIcon: {
    fontSize: 31,
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  logoSubText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  box: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    lineHeight: 32,
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontWeight: '800',
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  inputLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 3,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: SIZES.fontMedium,
    marginBottom: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBg,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  button: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.84,
  },
  buttonOutline: {
    minHeight: 52,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  buttonOutlinePressed: {
    backgroundColor: COLORS.primarySoft,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  buttonOutlineText: {
    color: COLORS.primary,
    fontSize: SIZES.fontMedium,
    fontWeight: '800',
  },
  forgot: {
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 18,
    fontSize: SIZES.fontSmall,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  normalText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSmall,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: SIZES.fontSmall,
  },

  // ========== Products ==========
  productHeader: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  logoutButton: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonPressed: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.055,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imagePlaceholder: {
    height: 140,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholderIcon: {
    fontSize: 42,
  },
  cardName: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minHeight: 42,
    paddingHorizontal: 3,
  },
  cardCategory: {
    alignSelf: 'flex-start',
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusRound,
    marginTop: 8,
    overflow: 'hidden',
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 10,
    paddingHorizontal: 3,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    padding: 13,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  emptyTitle: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },

  // ========== Product detail ==========
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBack: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
  },
  topBackPressed: {
    opacity: 0.65,
  },
  topBackText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  detailImage: {
    height: 250,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 22,
    marginTop: 16,
    overflow: 'hidden',
  },
  detailImageIcon: {
    fontSize: 72,
  },
  detailProductImage: {
    width: '100%',
    height: '100%',
  },
  detailCard: {
    margin: 16,
    marginTop: 14,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  category: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  name: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  price: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 12,
  },
  stock: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusRound,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.success,
    backgroundColor: COLORS.successSoft,
    overflow: 'hidden',
  },
  stockOut: {
    color: COLORS.danger,
    backgroundColor: COLORS.dangerSoft,
  },
  descBox: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
    backgroundColor: COLORS.background,
  },
  buyButton: {
    minHeight: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  buyButtonPressed: {
    opacity: 0.86,
  },
  buyButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buyButtonText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: '800',
  },
});