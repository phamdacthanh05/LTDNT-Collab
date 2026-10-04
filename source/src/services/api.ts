import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';

const TOKEN_KEY = 'auth_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Helper xử lý lưu trữ token cross-platform (Web + Mobile)
export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// Tự động gắn token vào mọi request (nếu có)
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trả lỗi dạng message dễ hiểu để hiển thị lên UI
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError<{ message?: string; code?: string; [k: string]: any }>) => {
    const message =
      error?.response?.data?.message ||
      (error.response
        ? `Máy chủ trả về lỗi (${error.response.status}), vui lòng thử lại`
        : 'Không thể kết nối máy chủ, vui lòng kiểm tra mạng và thử lại');
    // Giữ lại status + data để nơi gọi nhận biết lỗi nghiệp vụ (vd: code = INSUFFICIENT_BALANCE)
    const wrapped = new Error(message) as Error & { status?: number; data?: any };
    wrapped.status = error.response?.status;
    wrapped.data = error.response?.data;
    return Promise.reject(wrapped);
  }
);

// ---------- Auth ----------
export type User = {
  id: string;
  fullName: string;
  email: string;
  role?: 'ADMIN' | 'BUYER'; // MỚI: phân quyền — mặc định BUYER nếu không có
};

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function registerRequest(fullName: string, email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/auth/register', {
    fullName,
    email,
    password,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

// ---------- Sản phẩm ----------
export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  category?: string | null;
  imageUrl?: string | null;
  stock: number;
};

export async function fetchProducts(category?: string) {
  const { data } = await api.get<{ products: Product[] }>('/products', {
    params: category ? { category } : undefined,
  });
  return data.products;
}

export async function fetchProductDetail(id: string) {
  const { data } = await api.get<{ product: Product }>(`/products/${id}`);
  return data.product;
}

// ---------- Đơn hàng ----------
// Mua hàng = THANH TOÁN BẰNG SỐ DƯ VÍ. Backend trừ ví, tạo đơn và giao tài khoản trong 1 transaction.
// Thiếu tiền -> lỗi 402 với code INSUFFICIENT_BALANCE (xem InsufficientBalanceError bên dưới).
export type CheckoutResult = {
  order: any;
  balance: string; // số dư ví sau khi mua
  delivered: number; // số tài khoản đã giao
};

export class InsufficientBalanceError extends Error {
  required: number;
  balance: number;
  missing: number;
  constructor(message: string, required: number, balance: number, missing: number) {
    super(message);
    this.name = 'InsufficientBalanceError';
    this.required = required;
    this.balance = balance;
    this.missing = missing;
  }
}

export async function createOrder(items: { productId: string; quantity: number }[]) {
  try {
    const { data } = await api.post<CheckoutResult>('/orders', { items });
    return data;
  } catch (err: any) {
    if (err?.data?.code === 'INSUFFICIENT_BALANCE') {
      throw new InsufficientBalanceError(err.message, err.data.required, err.data.balance, err.data.missing);
    }
    throw err;
  }
}

export async function fetchMyOrders() {
  const { data } = await api.get<{ orders: any[] }>('/orders');
  return data.orders;
}
