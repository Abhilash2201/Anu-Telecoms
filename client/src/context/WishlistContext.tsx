import React, { createContext, useContext, useState } from 'react';

interface WishlistProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountedPrice?: number;
  discount?: number;
  image: string | null;
  images?: string[];
  stock?: number;
  rating?: number;
  category?: string;
}

interface WishlistContextValue {
  items: WishlistProduct[];
  toggle: (product: WishlistProduct) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
}

const KEY = 'anu_wishlist';

function load(): WishlistProduct[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>(load);

  const toggle = (product: WishlistProduct) => {
    setItems(prev => {
      const next = prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const isWishlisted = (id: string) => items.some(p => p.id === id);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
