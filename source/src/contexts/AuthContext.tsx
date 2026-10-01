import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  clearToken,
  fetchMe,
  getToken,
  loginRequest,
  registerRequest,
  saveToken,
  type User,
} from '../services/api';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean; // đang kiểm tra token lúc mở app
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi mở app: nếu đã có token lưu sẵn thì tự đăng nhập lại (khỏi bắt nhập lại mỗi lần)
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const me = await fetchMe();
          setUser(me);
        }
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const { token, user: loggedInUser } = await loginRequest(email, password);
    await saveToken(token);
    setUser(loggedInUser);
  }

  async function register(fullName: string, email: string, password: string) {
    const { token, user: newUser } = await registerRequest(fullName, email, password);
    await saveToken(token);
    setUser(newUser);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
