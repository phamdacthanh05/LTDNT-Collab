import { StyleSheet } from 'react-native';
import { COLORS } from './GlobalStyles';

/**
 * Style riêng cho màn hình Thanh toán (checkout.tsx).
 * Đồng bộ tone XANH NƯỚC BIỂN với Dashboard / Cart / Products.
 */
export const CheckoutStyles = StyleSheet.create({
  // ========== Layout ==========
  screen: { flex: 1, backgroundColor: COLORS.background },
  main: { flex: 1, backgroundColor: COLORS.background },

  // ========== Top Bar (đồng bộ Dashboard / Products / Cart) ==========
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
    gap: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  backButtonText: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: -3,
  },
  heading: { flex: 1 },
  greeting: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
    letterSpacing: -0.3,
  },

  // ========== Scroll Content ==========
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ========== Section Title ==========
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 10,
    marginLeft: 4,
  },

  // ========== Card (dùng chung cho summary, wallet, notice) ==========
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  // ========== Order Item Row ==========
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // ========== Divider + Total ==========
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 10,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.4,
  },

  // ========== Wallet Info ==========
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  walletLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  walletValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  walletValueHighlight: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  walletValueEmpty: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.danger,
  },

  // ========== Wallet Icon + Balance Highlight ==========
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  walletIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIcon: { fontSize: 20 },
  walletHeaderText: { flex: 1 },
  walletHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: COLORS.primaryDark,
  },
  walletHeaderSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ========== Danger Banner (số dư không đủ) ==========
  dangerBanner: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14,
  },
  dangerTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: COLORS.danger,
  },
  dangerText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#991B1B',
    marginTop: 6,
  },
  dangerButton: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dangerButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // ========== Notice Banner ==========
  noticeBanner: {
    backgroundColor: COLORS.warningSoft,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.warning,
  },
  noticeText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#92400E',
    marginTop: 6,
  },

  // ========== Footer ==========
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  confirmButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  pressed: { opacity: 0.85 },
});