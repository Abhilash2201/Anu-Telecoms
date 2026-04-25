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
  id: string;       // server CartItem.id (or "guest-<productId>" for unauthenticated users)
  productId: string;
  product: Product;
  quantity: number;
  lineTotal?: number;
}

interface CartState {
  items: CartItem[];
}

// Kept intentionally minimal — all mutations go through the server (or localStorage for guests),
// then the full cart is re-fetched so the UI always reflects the true server state
type CartAction =
  | { type: 'SET_ITEMS'; items: CartItem[] }
  | { type: 'CLEAR' };

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
    case 'SET_ITEMS': return { items: action.items };
    case 'CLEAR':     return { items: [] };
    default:          return state;
  }
}

// Normalises a raw server cart item into the flat shape the frontend uses.
// The server returns nested Product and unitPrice separately from the CartItem row.
function mapServerItem(item: any): CartItem {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    product: {
      id:       item.product?.id    ?? item.productId,
      name:     item.product?.name  ?? 'Product',
      brand:    item.product?.brand ?? '',
      category: item.product?.category ?? '',
      price:    item.unitPrice ?? item.product?.price ?? 0,
      image:    item.product?.image  ?? null,
      images:   item.product?.images ?? [],
      stock:    item.product?.stock  ?? 0,
      discount: item.product?.discount ?? 0
    }
  };
}

// localStorage key for the guest cart.
// On login, these items are merged into the server cart and this key is removed.
const GUEST_CART_KEY = 'cart_guest';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]     = useReducer(cartReducer, { items: [] });
  const { isAuthenticated }   = useAuth();
  const [toast, setToast]     = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);

  // Reads the guest cart from localStorage into the reducer.
  // Always dispatches CLEAR when nothing is found so a previous (logged-in) cart
  // doesn't linger in state after logout.
  const loadGuestCart = () => {
    const savedCart = localStorage.getItem(GUEST_CART_KEY);
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
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  };

  // Re-fetches the server cart and updates state. Called after every mutation
  // to keep the UI in sync with the true server state.
  const refreshCart = async () => {
    if (!isAuthenticated) {
      loadGuestCart();
      return;
    }
    const response = await api.get('/cart');
    const items = (response.data?.cart?.items || []).map(mapServerItem);
    dispatch({ type: 'SET_ITEMS', items });
  };

  // Runs whenever authentication state changes (login / logout).
  // On login: merges the guest cart into the server cart, then loads the server cart.
  // On logout: loads the (now empty) guest cart, which dispatches CLEAR.
  useEffect(() => {
    const mergeAndRefresh = async () => {
      if (!isAuthenticated) {
        loadGuestCart();
        return;
      }

      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        try {
          const guestItems: CartItem[] = JSON.parse(saved);
          // allSettled so a single out-of-stock item doesn't block the rest from merging
          await Promise.allSettled(
            guestItems.map(item =>
              api.post('/cart/items', { productId: item.productId, quantity: item.quantity })
            )
          );
          localStorage.removeItem(GUEST_CART_KEY);
        } catch {
          // Merge failure is non-fatal — the server cart still loads below
        }
      }

      await refreshCart();
    };

    mergeAndRefresh().catch(console.error);
  }, [isAuthenticated]);

  const addToCart = async (product: Product) => {
    if (!isAuthenticated) {
      // Guest path: mutate localStorage directly
      const existing  = state.items.find(item => item.product.id === product.id);
      const nextItems = existing
        ? state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state.items, { id: `guest-${product.id}`, productId: product.id, quantity: 1, product }];

      dispatch({ type: 'SET_ITEMS', items: nextItems });
      saveGuestCart(nextItems);
    } else {
      // Authenticated path: write to server, then re-fetch for consistency
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      await refreshCart();
    }

    setToast(`"${product.name}" added to cart`);
    setToastOpen(true);
  };

  const removeFromCart = async (id: string) => {
    if (!isAuthenticated) {
      const nextItems = state.items.filter(item => item.product.id !== id);
      dispatch({ type: 'SET_ITEMS', items: nextItems });
      saveGuestCart(nextItems);
      return;
    }

    // Accept either productId or cartItem.id so callers don't need to know which they have
    const cartItem = state.items.find(item => item.product.id === id || item.id === id);
    if (!cartItem) return;
    await api.delete(`/cart/items/${cartItem.id}`);
    await refreshCart();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated) {
      // quantity <= 0 means remove the item entirely
      const nextItems = quantity <= 0
        ? state.items.filter(item => item.product.id !== id)
        : state.items.map(item => item.product.id === id ? { ...item, quantity } : item);
      dispatch({ type: 'SET_ITEMS', items: nextItems });
      saveGuestCart(nextItems);
      return;
    }

    const cartItem = state.items.find(item => item.product.id === id || item.id === id);
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
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }
    // No bulk-delete endpoint — delete each item individually
    await Promise.all(state.items.map(item => api.delete(`/cart/items/${item.id}`)));
    await refreshCart();
  };

  // Calculates the total using discountedPrice when available, otherwise derives
  // it from price + discount % — matching the server-side price logic
  const getTotal = () =>
    state.items.reduce((total, item) => {
      const unitPrice =
        typeof item.product.discountedPrice === 'number'
          ? item.product.discountedPrice
          : item.product.price - (item.product.price * (item.product.discount || 0)) / 100;
      return total + unitPrice * item.quantity;
    }, 0);

  const getItemCount = () => state.items.reduce((count, item) => count + item.quantity, 0);

  // Memoised so consumers only re-render when cart state or auth status actually changes
  const value = useMemo(
    () => ({ state, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount, refreshCart }),
    [state, isAuthenticated]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Toast notification shown after every addToCart action */}
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
