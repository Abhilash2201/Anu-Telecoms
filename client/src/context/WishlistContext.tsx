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

// Wishlist is client-side only — no server endpoint.
// Persisted in localStorage so it survives page refreshes and doesn't require login.
const KEY = 'anu_wishlist';

// Initialiser function — runs once at mount to hydrate from localStorage.
// Passed directly to useState so it only executes on the first render.
function load(): WishlistProduct[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>(load);

  // Single function handles both add and remove — toggles based on current state.
  // localStorage is updated inside setItems callback to guarantee it reflects the
  // latest state even if multiple toggles fire quickly.
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
