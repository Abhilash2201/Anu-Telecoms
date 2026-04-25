import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/apiClient';

type UserRole = 'USER' | 'ADMIN' | 'VENDOR';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// localStorage keys — centralised so a typo in one place doesn't silently break auth
const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true until hydration completes so protected routes don't flash

  useEffect(() => {
    // Restore token and user from localStorage immediately so the UI doesn't
    // flicker to "logged out" on a hard refresh before the /auth/me call resolves
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser  = localStorage.getItem(USER_KEY);

    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved auth user:', error);
      }
    }

    // Re-validate the token against the server on every app load.
    // The cached user above is used for the first render; this call corrects it
    // if the token has been revoked or the user profile has changed.
    const hydrate = async () => {
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        setUser(response.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      } catch {
        // Token is expired or invalid — clear everything so the user is logged out cleanly
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate().catch(console.error);
  }, []);

  // Writes auth state to both React state and localStorage in one call
  const persistAuth = (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    persistAuth(response.data.token, response.data.user);
  };

  // Register then immediately log in so the user lands in an authenticated session
  // without needing a separate login step
  const register = async (name: string, email: string, password: string) => {
    await api.post('/auth/register', { name, email, password });
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // CartContext listens to isAuthenticated changes and clears the cart on logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token), // both must be present — token alone isn't enough
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
