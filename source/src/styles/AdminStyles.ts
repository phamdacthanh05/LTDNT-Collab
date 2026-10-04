import { StyleSheet } from 'react-native';
import { COLORS } from './GlobalStyles';

/**
 * Style riêng cho các màn hình Admin:
 *   - admin/accounts.tsx       (Kho tài khoản)
 *   - admin/products.tsx       (Quản lý sản phẩm)
 *   - admin/product-form.tsx   (Thêm/Sửa sản phẩm)
 *
 * Lưu ý: 2 màn admin/support-list.tsx và admin/chat/[id].tsx
 * dùng chung ChatStyles.ts để tránh trùng lặp với chat buyer.
 *
 * Đồng bộ tone XANH NƯỚC BIỂN với Dashboard.
 */
export const AdminStyles = StyleSheet.create({
  // ========== Layout ==========
  screen: { flex: 1, backgroundColor: COLORS.background },
  main: { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },

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
  heading: { flex: 1, minWidth: 0 },
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
  iconButton: {
    width: 42,
    height: 42,
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
  iconButtonText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '800',
    marginTop: -2,
  },
  pressed: { opacity: 0.85 },

  // ========== Section ==========
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionTitleFirst: { marginTop: 4 },
  sectionHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    marginBottom: 12,
    lineHeight: 18,
  },

  // ========== Card ==========
  card: {
    marginBottom: 14,
    padding: 16,
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

  // ========== Stock Row (accounts.tsx) ==========
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stockRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  stockBody: { flex: 1, minWidth: 0 },
  stockName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  stockMeta: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  stockCountWrap: { alignItems: 'flex-end' },
  stockCount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.4,
  },
  stockCountEmpty: { color: COLORS.danger },
  stockCountLabel: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },

  // ========== Import (accounts.tsx) ==========
  importInput: {
    minHeight: 160,
    textAlignVertical: 'top',
    padding: 14,
    borderRadius: 14,
    fontSize: 13,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  importHint: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  importHintStrong: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },

  // ========== Form (product-form.tsx) ==========
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginLeft: 3,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBg,
    marginBottom: 14,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputNote: {
    fontSize: 11.5,
    lineHeight: 17,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  switchLabelWrap: { flex: 1, paddingRight: 12 },
  switchLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  switchHint: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  readonlyNote: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    fontStyle: 'italic',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },

  // ========== Primary Button ==========
  primaryBtn: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 4,
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
  primaryBtnFull: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryBtnFullText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ========== Product Card (products.tsx) ==========
  productCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productThumbIcon: { fontSize: 24 },
  productBody: { flex: 1, minWidth: 0 },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  productMeta: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  hiddenBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.warningSoft,
  },
  hiddenBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.warning,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  smallButtonDanger: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: '#FECACA',
  },
  smallButtonDangerText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.danger,
  },

  // ========== Empty State ==========
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyTitle: {
    fontSize: 17,
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
});