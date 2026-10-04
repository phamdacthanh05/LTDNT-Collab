import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../services/api';

// Một dòng trong giỏ hàng: 1 sản phẩm + số lượng đang chọn
export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number; // tổng số lượng, hiện ở badge giỏ hàng
  totalPrice: number; // tổng tiền, hiện ở cart & checkout
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Số lượng trong giỏ không bao giờ vượt quá số tài khoản còn trong kho (product.stock)
  function capByStock(product: Product, quantity: number) {
    const stock = Number(product.stock);
    return Number.isFinite(stock) ? Math.min(quantity, stock) : quantity;
  }

  function addItem(product: Product, quantity = 1) {
    if (Number(product.stock) <= 0) return; // hết hàng thì không thêm
    setItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        // Đã có trong giỏ -> chỉ tăng số lượng
        return prev.map((it) =>
          it.product.id === product.id
            ? { ...it, quantity: capByStock(it.product, it.quantity + quantity) }
            : it
        );
      }
      return [...prev, { product, quantity: capByStock(product, quantity) }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((it) =>
        it.product.id === productId ? { ...it, quantity: capByStock(it.product, quantity) } : it
      )
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((it) => it.product.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  // Tự tính lại tổng số lượng & tổng tiền mỗi khi items thay đổi
  const totalQuantity = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.product.price) * it.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, totalQuantity, totalPrice, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được dùng bên trong <CartProvider>');
  return ctx;
}
