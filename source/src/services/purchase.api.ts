// Lịch sử mua hàng: tài khoản/mật khẩu khách đã mua (tự xoá sau 7 ngày).
import { api } from './api';

export type PurchaseItem = {
  id: string;
  orderId: string | null;
  productId: string;
  productName: string;
  accountUsername: string;
  accountPassword: string;
  accountNote?: string | null;
  unitPrice: string;
  purchasedAt: string;
  expiresAt: string;
  hoursLeft: number;
  daysLeft: number;
};

export async function fetchPurchaseHistory() {
  const { data } = await api.get<{ retentionDays: number; notice: string; items: PurchaseItem[] }>(
    '/purchases'
  );
  return data;
}
