import { Stack } from 'expo-router';
import { MessageBoxProvider } from '../components/MessageBox';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

export default function RootLayout() {
  return (
    <MessageBoxProvider>
      <AuthProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </CartProvider>
      </AuthProvider>
    </MessageBoxProvider>
  );
}