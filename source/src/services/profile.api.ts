// src/services/profile.api.ts
// File MỚI HOÀN TOÀN — chỉ import `api` (axios instance có sẵn) từ api.ts, không sửa file đó.
import { api } from './api';

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  address?: string | null; // MỚI: địa chỉ giao hàng
  role?: 'ADMIN' | 'BUYER'; // MỚI: phân quyền
  walletBalance?: string; // Prisma Decimal -> string. CHỈ có với BUYER; Admin không có số dư nên backend không trả field này
  createdAt?: string;
};

export async function fetchProfile() {
  const { data } = await api.get<{ user: Profile }>('/profile/me');
  return data.user;
}

export async function updateProfile(payload: { fullName?: string; address?: string }) {
  const { data } = await api.put<{ user: Profile }>('/profile/me', payload);
  return data.user;
}

export async function changeMyPassword(oldPassword: string, newPassword: string) {
  const { data } = await api.put<{ message: string }>('/profile/change-password', {
    oldPassword,
    newPassword,
  });
  return data.message;
}

export type ProfileOrder = {
  id: string;
  totalAmount: string;
  status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    product: { id: string; name: string };
  }[];
  payment?: { method: string; status: string } | null;
};

export async function fetchMyOrderHistory() {
  const { data } = await api.get<{ orders: ProfileOrder[] }>('/profile/orders');
  return data.orders;
}
