// Admin: quản lý sản phẩm (thêm / sửa / xoá) và kho tài khoản của từng sản phẩm.
import { api } from './api';

export type AdminStockProduct = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  price: string;
  isActive: boolean;
  available: number; // số tài khoản còn trong kho (= số lượng đang bán)
};

export type ProductPayload = {
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  isActive?: boolean;
};

export async function fetchStockProducts() {
  const { data } = await api.get<{ products: AdminStockProduct[] }>('/admin/products');
  return data.products;
}

export async function createProduct(payload: ProductPayload) {
  const { data } = await api.post<{ message: string; product: AdminStockProduct }>('/admin/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>) {
  const { data } = await api.put<{ message: string; product: AdminStockProduct }>(`/admin/products/${id}`, payload);
  return data;
}

// deleted=true: đã xoá hẳn. hidden=true: sản phẩm đã có đơn hàng nên chỉ bị ẨN (giữ lịch sử đơn của khách)
export async function deleteProduct(id: string) {
  const { data } = await api.delete<{ deleted: boolean; hidden: boolean; message: string }>(`/admin/products/${id}`);
  return data;
}

// text: mỗi dòng 1 tài khoản, dạng "email|matkhau" (có thể thêm "|ghi chú")
export async function importAccounts(productId: string, text: string) {
  const { data } = await api.post<{ message: string; inserted: number; invalid: number; available: number }>(
    `/admin/products/${productId}/accounts`,
    { text },
    { timeout: 120000 } // nhập hàng chục nghìn dòng có thể mất vài chục giây
  );
  return data;
}
