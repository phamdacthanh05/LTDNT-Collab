// Ví tiền của khách (BUYER): xem số dư, nạp tiền qua MoMo, lịch sử giao dịch.
// Admin không có ví — các API này trả 403 cho Admin.
import { api } from './api';

export type WalletInfo = {
  balance: string; // Prisma Decimal -> string
  minTopup: number;
  maxTopup: number;
  devPayment: boolean; // backend bật ALLOW_DEV_PAYMENT -> hiện nút "nạp thử"
};

export type WalletTransaction = {
  id: string;
  type: 'TOPUP' | 'PURCHASE' | 'REFUND';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amount: string;
  balanceAfter: string | null;
  orderId: string | null;
  description: string | null;
  createdAt: string;
};

export type TopupResult = { transactionId: string; payUrl: string | null; dev?: boolean };
export type TopupSyncResult = { status: 'PENDING' | 'SUCCESS' | 'FAILED'; credited: boolean; message?: string };

export async function fetchWallet() {
  const { data } = await api.get<WalletInfo>('/wallet');
  return data;
}

export async function fetchWalletTransactions() {
  const { data } = await api.get<{ transactions: WalletTransaction[] }>('/wallet/transactions');
  return data.transactions;
}

// dev=true: bỏ qua MoMo (chỉ chạy khi backend bật ALLOW_DEV_PAYMENT)
export async function createTopup(amount: number, dev = false) {
  const { data } = await api.post<TopupResult>('/wallet/topup', { amount, dev });
  return data;
}

// Hỏi backend xem MoMo đã nhận tiền chưa -> nếu rồi thì cộng vào ví
export async function syncTopup(transactionId: string) {
  const { data } = await api.post<TopupSyncResult>('/wallet/topup/sync', { transactionId });
  return data;
}

export async function confirmDevTopup(transactionId: string) {
  const { data } = await api.post<TopupSyncResult>('/wallet/topup/dev-confirm', { transactionId });
  return data;
}
