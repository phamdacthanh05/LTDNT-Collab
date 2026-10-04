import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from './GlobalStyles';

export const ExtraStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  screenHeader: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenHeaderTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  tabButtonActive: { backgroundColor: COLORS.primary },
  tabButtonText: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
  tabButtonTextActive: { color: COLORS.white },

  walletCard: {
    margin: 16,
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  walletLabel: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '700' },
  walletAmount: { color: COLORS.white, fontSize: 30, fontWeight: '900', marginTop: 7 },

  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSmall },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSmall,
    fontWeight: '800',
    maxWidth: '65%',
    textAlign: 'right',
  },

  orderItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 17,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700' },
  orderStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: SIZES.radiusRound },
  orderStatusText: { fontSize: 11, fontWeight: '900' },
  orderProductLine: { fontSize: SIZES.fontSmall, color: COLORS.textPrimary, marginTop: 9, lineHeight: 20 },
  orderTotal: { fontSize: 16, fontWeight: '900', color: COLORS.primaryDark, marginTop: 11 },

  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 15,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  conversationAvatar: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  conversationAvatarText: { fontSize: 20 },
  conversationBody: { flex: 1 },
  conversationSubject: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  conversationLastMessage: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  unreadBadge: {
    minWidth: 21, height: 21, borderRadius: 11, backgroundColor: COLORS.danger,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: 8,
  },
  unreadBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '900' },

  chatContainer: { flex: 1, backgroundColor: COLORS.background },
  messageList: { padding: 16, paddingBottom: 10 },
  bubbleRow: { marginBottom: 10, flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 15, paddingVertical: 11, borderRadius: 18 },
  bubbleMine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 5 },
  bubbleTheirs: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 5 },
  bubbleTextMine: { color: COLORS.white, fontSize: SIZES.fontSmall, lineHeight: 20 },
  bubbleTextTheirs: { color: COLORS.textPrimary, fontSize: SIZES.fontSmall, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeMine: { color: COLORS.primaryLight, textAlign: 'right' },
  bubbleTimeTheirs: { color: COLORS.textMuted },
  composerRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  composerInput: {
    flex: 1, minHeight: 46, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radiusRound, paddingHorizontal: 17, paddingVertical: 10,
    fontSize: SIZES.fontSmall, backgroundColor: COLORS.inputBg, color: COLORS.textPrimary,
  },
  sendButton: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  sendButtonDisabled: { backgroundColor: COLORS.border },
  sendButtonText: { color: COLORS.white, fontSize: 18 },

  homeHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  homeGreeting: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  homeUserName: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, marginTop: 3 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 18, gap: 12 },
  menuItem: {
    width: '47.5%', backgroundColor: COLORS.surface, borderRadius: 20, paddingVertical: 20,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    shadowColor: COLORS.shadow, shadowOpacity: 0.045, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  menuItemPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  menuIconCircle: {
    width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  menuIcon: { fontSize: 24 },
  menuLabel: { fontSize: SIZES.fontSmall, fontWeight: '800', color: COLORS.textPrimary },
  menuBadge: {
    position: 'absolute', top: 9, right: 9, minWidth: 21, height: 21, borderRadius: 11,
    backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  menuBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '900' },

  homeHero: {
    marginHorizontal: 16, marginTop: 16, padding: 22, borderRadius: 24,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 }, elevation: 5,
  },
  homeHeroEyebrow: { color: COLORS.primaryLight, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  homeHeroTitle: { color: COLORS.white, fontSize: 25, lineHeight: 32, fontWeight: '900', marginTop: 6 },
  homeHeroText: { color: '#DCE9FF', fontSize: 13, lineHeight: 20, marginTop: 7, maxWidth: '90%' },
  homeSectionTitle: { marginHorizontal: 16, marginTop: 22, fontSize: 17, fontWeight: '900', color: COLORS.textPrimary },
  homeSectionText: { marginHorizontal: 16, marginTop: 4, fontSize: 13, color: COLORS.textSecondary },

  // ---- Giỏ hàng (cart icon + badge, dùng chung ở Header các màn hình) ----
  cartButton: {
    width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  cartButtonIcon: { fontSize: 18 },
  cartButtonBadge: {
    position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  cartButtonBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '900' },

  // ---- Thanh tìm kiếm + chip danh mục (Product listing / marketplace style) ----
  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14,
    backgroundColor: COLORS.inputBg, borderRadius: SIZES.radiusRound, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: 16, height: 46,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: SIZES.fontSmall, color: COLORS.textPrimary },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  categoryChip: {
    paddingHorizontal: 16, height: 36, borderRadius: SIZES.radiusRound, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  categoryChipTextActive: { color: COLORS.white },

  // ---- ProductCard: nút "Thêm vào giỏ" nhỏ trên card ----
  cardAddButton: {
    marginTop: 10, height: 36, borderRadius: 12, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  cardAddButtonText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },

  // ---- Featured products: hàng ngang trên Home ----
  featuredRow: { paddingHorizontal: 16, gap: 12 },
  featuredCardWrap: { width: 148 },

  // ---- Cart & Checkout ----
  cartLine: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12,
    padding: 12, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  cartLineImage: { width: 64, height: 64, borderRadius: 14, backgroundColor: COLORS.primarySoft, marginRight: 12 },
  cartLineBody: { flex: 1 },
  cartLineName: { fontSize: SIZES.fontSmall, fontWeight: '800', color: COLORS.textPrimary },
  cartLinePrice: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyButton: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  qtyButtonText: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary },
  qtyValue: { minWidth: 28, textAlign: 'center', fontSize: SIZES.fontSmall, fontWeight: '800', color: COLORS.textPrimary },
  cartLineRemove: { paddingHorizontal: 6, paddingVertical: 4, marginLeft: 8 },
  cartLineRemoveText: { fontSize: 12, color: COLORS.danger, fontWeight: '700' },

  summaryBox: {
    marginHorizontal: 16, marginTop: 4, padding: 18, borderRadius: 18,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSmall },
  summaryValue: { color: COLORS.textPrimary, fontSize: SIZES.fontSmall, fontWeight: '700' },
  summaryTotalLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900' },
  summaryTotalValue: { color: COLORS.primaryDark, fontSize: 18, fontWeight: '900' },

  paymentOption: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10,
    padding: 15, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
  },
  paymentOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  paymentOptionIcon: { fontSize: 20, marginRight: 12 },
  paymentOptionLabel: { fontSize: SIZES.fontSmall, fontWeight: '800', color: COLORS.textPrimary },
  paymentOptionHint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // ---- MessageBox (hộp thông báo dùng chung) ----
  msgOverlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  msgCard: {
    width: '100%', maxWidth: 380, backgroundColor: COLORS.surface, borderRadius: 24,
    paddingHorizontal: 22, paddingTop: 26, paddingBottom: 20, alignItems: 'center',
    shadowColor: COLORS.shadow, shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12,
  },
  msgIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  msgIcon: { fontSize: 26 },
  msgTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center' },
  msgText: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  msgButtonRow: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  msgButton: { flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  msgButtonText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  msgButtonGhost: {
    flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  msgButtonGhostText: { color: COLORS.textSecondary, fontWeight: '800', fontSize: 15 },

  // ---- Lịch sử mua hàng ----
  noticeBanner: {
    marginHorizontal: 16, marginTop: 14, padding: 14, borderRadius: 16,
    backgroundColor: COLORS.warningSoft, borderWidth: 1, borderColor: '#FDE68A',
  },
  noticeBannerTitle: { fontSize: 13, fontWeight: '900', color: COLORS.warning },
  noticeBannerText: { fontSize: 13, lineHeight: 19, color: '#92400E', marginTop: 4 },
  purchaseGroup: {
    marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: 18,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  purchaseGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  purchaseGroupTitle: { fontSize: 13, fontWeight: '900', color: COLORS.textPrimary },
  purchaseGroupDate: { fontSize: 12, color: COLORS.textMuted },
  purchaseAccount: {
    marginTop: 10, padding: 12, borderRadius: 14, backgroundColor: COLORS.inputBg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  purchaseProduct: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  purchaseFieldRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  purchaseFieldLabel: { width: 78, fontSize: 12, color: COLORS.textSecondary, fontWeight: '700' },
  purchaseFieldValue: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  purchaseToggle: { paddingHorizontal: 8, paddingVertical: 4 },
  purchaseToggleText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  purchaseNote: { marginTop: 8, fontSize: 12, color: COLORS.textSecondary },
  expireBadge: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  expireBadgeText: { fontSize: 11, fontWeight: '800' },

  // ---- Admin: kho tài khoản ----
  stockRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
  },
  stockRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  stockName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  stockMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  stockCount: { fontSize: 18, fontWeight: '900', color: COLORS.primaryDark },
  stockCountEmpty: { color: COLORS.danger },
  importInput: {
    minHeight: 160, textAlignVertical: 'top', padding: 12, borderRadius: 14, fontSize: 13,
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary,
  },
  importHint: { fontSize: 12, lineHeight: 18, color: COLORS.textSecondary, marginTop: 8 },

  // ---- Ví tiền (nạp tiền / lịch sử giao dịch) ----
  walletTopupButton: {
    alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 999, backgroundColor: COLORS.white,
  },
  walletTopupButtonText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '900' },
  amountChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  amountChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.inputBg,
  },
  amountChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  amountChipText: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary },
  amountChipTextActive: { color: COLORS.primaryDark },
  txRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  txTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  txMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  txAmountPlus: { fontSize: 15, fontWeight: '900', color: COLORS.success },
  txAmountMinus: { fontSize: 15, fontWeight: '900', color: COLORS.danger },
  txAmountMuted: { fontSize: 15, fontWeight: '900', color: COLORS.textMuted },
  dangerBanner: {
    marginHorizontal: 16, marginTop: 14, padding: 14, borderRadius: 14,
    backgroundColor: COLORS.dangerSoft, borderWidth: 1, borderColor: '#FECACA',
  },
  dangerBannerTitle: { fontSize: 13, fontWeight: '900', color: COLORS.danger },
  dangerBannerText: { fontSize: 13, lineHeight: 19, color: '#991B1B', marginTop: 4 },
  walletMiniChip: {
    marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primaryLight,
  },
  walletMiniChipText: { fontSize: 12, fontWeight: '900', color: COLORS.primaryDark },

  // ---- Admin: quản lý sản phẩm ----
  adminProductCard: {
    marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  adminProductTop: { flexDirection: 'row', alignItems: 'center' },
  adminProductThumb: {
    width: 54, height: 54, borderRadius: 12, marginRight: 12, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  adminProductName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  adminProductMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  adminProductPrice: { fontSize: 14, fontWeight: '900', color: COLORS.primaryDark, marginTop: 3 },
  adminProductActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  smallButton: {
    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primaryLight,
  },
  smallButtonText: { fontSize: 12, fontWeight: '800', color: COLORS.primaryDark },
  smallButtonDanger: { backgroundColor: COLORS.dangerSoft, borderColor: '#FECACA' },
  smallButtonDangerText: { fontSize: 12, fontWeight: '800', color: COLORS.danger },
  hiddenBadge: {
    alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, backgroundColor: COLORS.warningSoft,
  },
  hiddenBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.warning },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, marginBottom: 6,
  },
  readonlyNote: { fontSize: 12, lineHeight: 18, color: COLORS.textSecondary, marginBottom: 12 },
});
