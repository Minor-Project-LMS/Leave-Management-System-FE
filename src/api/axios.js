import axios from 'axios';
import { isSecurityError } from '../utils/errorHandler';
import { broadcastAuthEvent } from '../utils/authChannel';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Safe sessionStorage access (for environments where it might not be available)
const safeSessionStorage = {
  setItem: (key, value) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
      }
    } catch (e) {
      // SessionStorage not available
    }
  },
  getItem: (key) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem(key);
      }
    } catch (e) {
      return null;
    }
  },
  removeItem: (key) => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      // SessionStorage not available
    }
  }
};

// Common axios configuration
const axiosConfig = {
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
};

// Primary axios instance used across the app (has interceptors)
export const api = axios.create(axiosConfig);

// Raw axios instance without interceptors for refresh and auth endpoints
export const rawApi = axios.create(axiosConfig);

// In-memory token store
let _accessToken = null;
export const getAccessToken = () => _accessToken;
export const setAccessToken = (token) => { _accessToken = token; };

// Logout handler (to be registered by AuthProvider)
let logoutHandler = () => {
  try { window.location.href = '/login'; } catch (e) { /* noop */ }
};
export const setLogoutHandler = (fn) => { logoutHandler = fn; };

// Refresh queue
let isRefreshing = false;
let subscribers = [];
const subscribe = (cb) => { subscribers.push(cb); };
const onRefreshed = (token) => { 
  subscribers.forEach(cb => cb(token)); 
  subscribers = []; // Clear subscribers after notifying
};

// Clear subscribers on refresh failure to prevent memory leaks
const clearSubscribers = () => {
  subscribers.forEach(cb => cb(null));
  subscribers = [];
};

// Request interceptor - attach in-memory token
api.interceptors.request.use((config) => {
  if (_accessToken && config && config.headers) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// Helper that attempts refresh at likely endpoints, returns raw response or throws
export async function refreshTokenRequest() {
  // Try preferred endpoint first
  const endpoints = ['/auth/refresh', '/refresh'];
  let lastError = null;
  for (const ep of endpoints) {
    try {
      // If an access token exists in memory, include it in the Authorization header.
      // This matches a backend that optionally validates the incoming access token
      // alongside the HttpOnly refresh cookie. We NEVER read/write refresh cookies from JS.
      const token = getAccessToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

      // rawApi.post(url, data, config) — send empty body (backend expects POST)
      const resp = await rawApi.post(ep, {}, config);
      return resp;
    } catch (e) {
      lastError = e;
      // If 404 or network, try next; for 401 we'll surface after trying both
      if (e?.response?.status && e.response.status !== 404) {
        // keep trying other endpoints — maybe path mismatch; continue
      }
    }
  }
  throw lastError;
}

// Token validation helper
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  // Basic JWT structure validation (header.payload.signature)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Response interceptor - handle 401, 403 and refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response ? err.response.status : null;

    if (!originalRequest || originalRequest._retry) return Promise.reject(err);

    // Handle both 401 (Unauthorized) and 403 (Forbidden)
    if (status !== 401 && status !== 403) return Promise.reject(err);

    // For 403 Forbidden, always logout (permission denied)
    if (status === 403) {
      setAccessToken(null);
      clearSubscribers();
      // Set logout flag to prevent silent refresh
      safeSessionStorage.setItem('hasLoggedOut', 'true');
      // Broadcast logout to other tabs
      broadcastAuthEvent('LOGOUT');
      logoutHandler();
      // Redirect to login after logout
      setTimeout(() => {
        try { window.location.replace('/login'); } catch (e) {
          try { window.location.href = '/login'; } catch (err) { /* noop */ }
        }
      }, 100);
      return Promise.reject(err);
    }

    // For 401, only attempt refresh if it's a security error (token issue)
    // Credential errors (wrong password) should not trigger refresh
    if (status === 401 && !isSecurityError(err)) {
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((token) => {
          if (!token) return reject(err);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // Call refresh endpoint using helper that tries known paths
      const refreshResp = await refreshTokenRequest();
      const newToken = refreshResp?.data?.accessToken || refreshResp?.data?.token || null;

      // Validate token structure
      if (!newToken || !isValidToken(newToken)) {
        setAccessToken(null);
        clearSubscribers();
        // Set logout flag to prevent silent refresh
        safeSessionStorage.setItem('hasLoggedOut', 'true');
        // Broadcast logout to other tabs
        broadcastAuthEvent('LOGOUT');
        logoutHandler();
        // Redirect to login after token refresh failure
        setTimeout(() => {
          try { window.location.replace('/login'); } catch (e) {
            try { window.location.href = '/login'; } catch (err) { /* noop */ }
          }
        }, 100);
        return Promise.reject(err);
      }

      setAccessToken(newToken);
      onRefreshed(newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      clearSubscribers();
      // Set logout flag to prevent silent refresh
      safeSessionStorage.setItem('hasLoggedOut', 'true');
      // Broadcast logout to other tabs
      broadcastAuthEvent('LOGOUT');
      logoutHandler();
      // Redirect to login after token refresh failure
      setTimeout(() => {
        try { window.location.replace('/login'); } catch (e) {
          try { window.location.href = '/login'; } catch (err) { /* noop */ }
        }
      }, 100);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
