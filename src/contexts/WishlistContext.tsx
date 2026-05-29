import { createContext, useContext, useState, ReactNode } from 'react';

type WishlistContextType = {
  wishlistIds: Set<string>;
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  function toggle(productId: string) {
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  function isWishlisted(productId: string) {
    return wishlistIds.has(productId);
  }

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
