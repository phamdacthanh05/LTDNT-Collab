import { StyleSheet } from 'react-native';
import { COLORS } from './GlobalStyles';

/**
 * Style riêng cho màn hình Ví của tôi (wallet/index.tsx).
 * Đồng bộ tone XANH NƯỚC BIỂN với Dashboard / Cart / Checkout.
 */
export const WalletStyles = StyleSheet.create({
  // ========== Layout ==========
  screen: { flex: 1, backgroundColor: COLORS.background },
  main: { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: { paddingBottom: 40 },

  // ========== Top Bar (đồng bộ Dashboard / Cart / Checkout) ==========
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

  // ========== Wallet Hero Card (số dư) ==========
  walletHero: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 22,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  walletHeroBlobA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -50,
    right: -40,
  },
  walletHeroBlobB: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245,158,11,0.30)',
    bottom: -40,
    right: 40,
  },
  walletHeroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.75)',
  },
  walletHeroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 8,
    letterSpacing: -0.8,
  },
  walletHeroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    lineHeight: 18,
  },
  walletHeroChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  walletHeroChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // ========== Section Title ==========
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginTop: 22,
    marginBottom: 10,
    marginHorizontal: 20,
  },

  // ========== Card ==========
  card: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  // ========== Amount Chips ==========
  amountChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  amountChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
  },
  amountChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  amountChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  amountChipTextActive: { color: COLORS.primaryDark },

  // ========== Input ==========
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginLeft: 3,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBg,
    fontWeight: '700',
  },
  inputNote: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 16,
  },

  // ========== Buttons ==========
  primaryBtn: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  outlineBtn: {
    minHeight: 52,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  outlineBtnText: {
    color: COLORS.primary,
    fontSize: 13.5,
    fontWeight: '800',
  },
  pressed: { opacity: 0.85 },

  // ========== Transaction Row ==========
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIconWrapPlus: { backgroundColor: COLORS.successSoft },
  txIconWrapMinus: { backgroundColor: COLORS.dangerSoft },
  txIconWrapMuted: { backgroundColor: COLORS.background },
  txIcon: { fontSize: 18 },

  txBody: { flex: 1, minWidth: 0 },
  txTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  txMeta: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  txStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  txStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  txStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  txAmountPlus: { color: COLORS.success },
  txAmountMinus: { color: COLORS.danger },
  txAmountMuted: { color: COLORS.textSecondary },
  txBalanceAfter: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  // ========== Check Button (trong tx row) ==========
  checkBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  checkBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  // ========== Empty Transactions ==========
  emptyTx: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyTxIcon: { fontSize: 44, marginBottom: 10 },
  emptyTxTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyTxText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});