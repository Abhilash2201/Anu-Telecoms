import axios from 'axios';

// In production VITE_API_URL points to the Render backend (e.g. https://anu-telecom.onrender.com).
// In local dev it falls back to '/api' which is proxied to localhost:4000 by vite.config.ts.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach the JWT on every request automatically.
// Token is read from localStorage each time (not captured at instance creation)
// so a login that happens after app boot is immediately reflected.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
