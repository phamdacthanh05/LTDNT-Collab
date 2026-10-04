// Chặn truy cập màn hình sai vai trò: khách (BUYER) không vào được màn Admin và ngược lại.
// (Backend vẫn kiểm tra role ở mọi API — đây chỉ là lớp bảo vệ giao diện.)
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useRoleGuard(required: 'ADMIN' | 'BUYER') {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const role = user?.role ?? 'BUYER';

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/auth/login');
    } else if (role !== required) {
      router.replace('/');
    }
  }, [isLoading, user, role, required, router]);

  return { user, isLoading, allowed: !isLoading && !!user && role === required };
}
