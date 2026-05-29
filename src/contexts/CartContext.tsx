import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '../lib/supabase';

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product, quantity?: number, customization?: Record<string, string>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addItem(product: Product, quantity = 1, customization: Record<string, string> = {}) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, customization }];
    });
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
  }

  function clearCart() {
    setItems([]);
  }

  function isInCart(productId: string) {
    return items.some(i => i.product.id === productId);
  }

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
