import { StyleSheet } from 'react-native';
import { COLORS } from './GlobalStyles';

/**
 * Style riêng cho màn hình Lịch sử mua hàng (purchases/index.tsx).
 * Đồng bộ tone XANH NƯỚC BIỂN với Dashboard / Cart / Checkout / Wallet.
 */
export const PurchaseStyles = StyleSheet.create({
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

  // ========== Top Bar (đồng bộ Dashboard) ==========
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
  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  countBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },

  // ========== Notice Banner (cảnh báo xoá sau 7 ngày) ==========
  noticeBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.warningSoft,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    gap: 10,
  },
  noticeIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  noticeBody: { flex: 1 },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.warning,
  },
  noticeText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#92400E',
    marginTop: 4,
  },

  // ========== Purchase Group (theo đơn hàng) ==========
  group: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  groupIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIcon: { fontSize: 16 },
  groupBody: { flex: 1, minWidth: 0 },
  groupTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  groupDate: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  groupCount: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  // ========== Account Card ==========
  accountCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountCardFirst: { marginTop: 0 },
  accountProduct: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  // ========== Field Row (label + value) ==========
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  fieldLabel: {
    width: 84,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  fieldValue: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  fieldValueMono: {
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    marginLeft: 6,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  // ========== Note ==========
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  noteIcon: { fontSize: 12, marginTop: 1 },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  // ========== Expire Badge ==========
  expireBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expireBadgeUrgent: { backgroundColor: COLORS.dangerSoft },
  expireBadgeNormal: { backgroundColor: COLORS.warningSoft },
  expireBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  expireBadgeTextUrgent: { color: COLORS.danger },
  expireBadgeTextNormal: { color: COLORS.warning },

  // ========== Empty State ==========
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  emptyButtonText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },

  pressed: { opacity: 0.85 },
});