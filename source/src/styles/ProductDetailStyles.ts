import { StyleSheet } from 'react-native';
import { COLORS } from './GlobalStyles';

/**
 * Style riêng cho màn hình Chi tiết sản phẩm (products/[id].tsx).
 * Màu sắc & token đều import từ GlobalStyles để đảm bảo đồng bộ.
 */
export const ProductDetailStyles = StyleSheet.create({
  // ========== Layout ==========
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  // ========== Top Bar ==========
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
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
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: -2,
  },

  // ========== Image ==========
  imageContainer: {
    marginHorizontal: 18,
    height: 280,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginBottom: 16,
  },
  productImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: { fontSize: 64 },

  // ========== Info Card ==========
  infoCard: {
    marginHorizontal: 18,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 12,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
  },
  stockIn: {
    backgroundColor: COLORS.successSoft,
    color: COLORS.success,
  },
  stockOut: {
    backgroundColor: COLORS.dangerSoft,
    color: COLORS.danger,
  },

  // ========== Quantity ==========
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },

  // ========== Description ==========
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
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // ========== Footer Buttons ==========
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  btnSolid: {
    flex: 1,
    height: 52,
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
  btnSolidDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnSolidText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: { opacity: 0.85 },
});