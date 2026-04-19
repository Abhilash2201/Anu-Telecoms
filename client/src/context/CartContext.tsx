import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import api from '../api/apiClient';
import { useAuth } from './AuthContext';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount?: number;
  discountedPrice?: number;
  image: string | null;
  images?: string[];
  description?: string;
  stock?: number;
}

interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  lineTotal?: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction = { type: 'SET_ITEMS'; items: CartItem[] } | { type: 'CLEAR' };

const CartContext = createContext<{
  state: CartState;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  refreshCart: () => Promise<void>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { items: action.items };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

function mapServerItem(item: any): CartItem {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    product: {
      id: item.product?.id ?? item.productId,
      name: item.product?.name ?? 'Product',
      brand: item.product?.brand ?? '',
      category: item.product?.category ?? '',
      price: item.unitPrice ?? item.product?.price ?? 0,
      image: item.product?.image ?? null,
      images: item.product?.images ?? [],
      stock: item.product?.stock ?? 0,
      discount: item.product?.discount ?? 0
    }
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { isAuthenticated } = useAuth();
  const storageKey = 'cart_guest';
  const [toast, setToast] = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);

  const loadGuestCart = () => {
    const savedCart = localStorage.getItem(storageKey);
    if (!savedCart) {
      dispatch({ type: 'CLEAR' });
      return;
    }
    try {
      const items: CartItem[] = JSON.parse(savedCart);
      dispatch({ type: 'SET_ITEMS', items });
    } catch {
      dispatch({ type: 'CLEAR' });
    }
  };

  const saveGuestCart = (items: CartItem[]) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const refreshCart = async () => {
    if (!isAuthenticated) {
      loadGuestCart();
      return;
    }
    const response = await api.get('/cart');
    const items = (response.data?.cart?.items || []).map(mapServerItem);
    dispatch({ type: 'SET_ITEMS', items });
  };

  useEffect(() => {
    const mergeAndRefresh = async () => {
      if (!isAuthenticated) {
        loadGuestCart();
        return;
      }
      // Merge any guest cart items into the server cart before loading
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const guestItems: CartItem[] = JSON.parse(saved);
          await Promise.allSettled(
            guestItems.map(item =>
              api.post('/cart/items', { productId: item.productId, quantity: item.quantity })
            )
          );
          localStorage.removeItem(storageKey);
        } catch {
          // ignore merge errors — server cart still loads
        }
      }
      await refreshCart();
    };
    mergeAndRefresh().catch(console.error);
  }, [isAuthenticated]);

  const addToCart = async (product: Product) => {
    if (!isAuthenticated) {
      const existing = state.items.find((item) => item.product.id === product.id);
      const nextItems = existing
        ? state.items.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [
            ...state.items,
            {
              id: `guest-${product.id}`,
              productId: product.id,
              quantity: 1,
              product
            }
          ];

      dispatch({ type: 'SET_ITEMS', items: nextItems });
      saveGuestCart(nextItems);
    } else {
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      await refreshCart();
    }

    setToast(`"${product.name}" added to cart`);
    setToastOpen(true);
  };

  const removeFromCart = async (id: string) => {
    if (!isAuthenticated) {
      const nextItems = state.items.filter((item) => item.product.id !== id);
      dispatch({ type: 'SET_ITEMS', items: nextItems });
      saveGuestCart(nextItems);
      return;
    }

    const cartItem = state.items.find((item) => item.product.id === id || item.id === id);
    if (!cartItem) return;
    await api.delete(`/cart/items/${cartItem.id}`);
    await refreshCart();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated) {
      const nextItems =
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== id)
          : state.items.map((item) => (item.product.id === id ? { ...item, quantity } : item));
      dispatch({ type: 'SET_ITEMS', items: nextItems });
      saveGuestCart(nextItems);
      return;
    }

    const cartItem = state.items.find((item) => item.product.id === id || item.id === id);
    if (!cartItem) return;

    if (quantity <= 0) {
      await api.delete(`/cart/items/${cartItem.id}`);
    } else {
      await api.patch(`/cart/items/${cartItem.id}`, { quantity });
    }
    await refreshCart();
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR' });
      localStorage.removeItem(storageKey);
      return;
    }

    await Promise.all(state.items.map((item) => api.delete(`/cart/items/${item.id}`)));
    await refreshCart();
  };

  const getTotal = () =>
    state.items.reduce((total, item) => {
      const unitPrice =
        typeof item.product.discountedPrice === 'number'
          ? item.product.discountedPrice
          : item.product.price - (item.product.price * (item.product.discount || 0)) / 100;
      return total + unitPrice * item.quantity;
    }, 0);

  const getItemCount = () => state.items.reduce((count, item) => count + item.quantity, 0);

  const value = useMemo(
    () => ({ state, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount, refreshCart }),
    [state, isAuthenticated]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
