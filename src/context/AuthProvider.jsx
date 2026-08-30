import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { rawApi, refreshTokenRequest, setAccessToken, setLogoutHandler } from '../api/axios';
import { getAuthChannel, closeAuthChannel, broadcastAuthEvent } from '../utils/authChannel';

// Safe sessionStorage access
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

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

let bootRefreshPromise = null;

export const AuthProvider = ({ children }) => {
  const [accessTokenState, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Small toast helper for user-visible logout feedback
  const showToast = (message, variant = 'info') => {
    try {
      const id = `toast-${Date.now()}`;
      const el = document.createElement('div');
      el.id = id;
      el.textContent = message;
      el.style.position = 'fixed';
      el.style.right = '20px';
      el.style.top = '20px';
      el.style.padding = '12px 16px';
      el.style.background = variant === 'error' ? '#fee2e2' : (variant === 'success' ? '#d1fae5' : '#ecfccb');
      el.style.color = '#111827';
      el.style.border = '1px solid rgba(0,0,0,0.06)';
      el.style.borderRadius = '8px';
      el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
      el.style.zIndex = 9999;
      el.style.fontWeight = '500';
      el.style.fontSize = '14px';
      document.body.appendChild(el);
      setTimeout(() => { try { el.remove(); } catch (e) {} }, 3000);
    } catch (e) {
      // fallback - silently ignore
    }
  };

  // Register logout handler for axios module
  useEffect(() => {
    const handler = () => {
      setAccessTokenState(null);
      setUser(null);
      setAccessToken(null); // sync module token
      // Don't redirect here - let the calling code handle redirect
      // This handler is called by axios interceptors for security errors
    };
    setLogoutHandler(handler);
    
    return () => {
      // Cleanup on unmount
      setLogoutHandler(() => {
        setAccessTokenState(null);
        setUser(null);
        setAccessToken(null);
      });
    };
  }, []);

  // Setup BroadcastChannel for cross-tab communication
  useEffect(() => {
    const channel = getAuthChannel();
    
    if (channel) {
      // Listen for logout events from other tabs
      channel.onmessage = (event) => {
        if (event.data.type === 'LOGOUT') {
          // Clear state when logout is received from another tab
          setAccessTokenState(null);
          setUser(null);
          setAccessToken(null);
          safeSessionStorage.setItem('hasLoggedOut', 'true');
          
          // Redirect to login page
          try { window.location.replace('/login'); } catch (e) {
            try { window.location.href = '/login'; } catch (err) { /* noop */ }
          }
        } else if (event.data.type === 'LOGIN') {
          // Clear logout flag when another tab logs in
          safeSessionStorage.removeItem('hasLoggedOut');
        }
      };
    }
    
    return () => {
      // Cleanup broadcast channel on unmount
      closeAuthChannel();
    };
  }, []);

  // Sync module token with React state
  useEffect(() => {
    setAccessToken(accessTokenState);
  }, [accessTokenState]);

  // Silent refresh on mount - use rawApi to avoid interceptor recursion
  const silentRefresh = useCallback(async () => {
    // Don't attempt silent refresh if user has explicitly logged out
    const hasLoggedOut = safeSessionStorage.getItem('hasLoggedOut') === 'true';
    if (hasLoggedOut) {
      setAccessTokenState(null);
      setUser(null);
      return false;
    }

    if (bootRefreshPromise) {
      return bootRefreshPromise;
    }

    bootRefreshPromise = (async () => {
      try {
        const refreshPromise = refreshTokenRequest();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Refresh timeout')), 3500);
        });

        const resp = await Promise.race([refreshPromise, timeoutPromise]);
        const newToken = resp?.data?.accessToken || resp?.data?.token || null;
        const profile = resp?.data?.user || resp?.data?.profile || null;

        if (newToken) {
          setAccessTokenState(newToken);
          setUser(profile);
          return true;
        }

        setAccessTokenState(null);
        setUser(null);
        return false;
      } catch (err) {
        setAccessTokenState(null);
        setUser(null);
        return false;
      } finally {
        bootRefreshPromise = null;
      }
    })();

    return bootRefreshPromise;
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await silentRefresh(); // already internally capped at 3500ms via Promise.race
      } catch (e) {
        // ignore; app should still load for login flows
      } finally {
        if (mounted) setInitializing(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [silentRefresh]);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [silentRefresh]);

  const login = useCallback(async (email, password) => {
    try {
      const resp = await rawApi.post('/auth/login', { email, password });
      const token = resp?.data?.accessToken || resp?.data?.token || null;
      const profile = resp?.data?.user || resp?.data?.profile || null;
      if (!token) throw new Error('Login did not return access token');
      
      // Clear logout flag on successful login
      safeSessionStorage.removeItem('hasLoggedOut');
      
      setAccessTokenState(token);
      setUser(profile);
      
      // Broadcast login event to other tabs
      broadcastAuthEvent('LOGIN');
      
      return { token, profile };
    } catch (error) {
      // Don't handle security errors during login - let the login form handle credential errors
      // Security errors during login are usually credential errors (wrong password)
      throw error;
    }
  }, []);

  // Expose a method to refresh access token on demand
  const refreshAccessToken = useCallback(async () => {
    try {
      const resp = await refreshTokenRequest();
      const token = resp?.data?.accessToken || resp?.data?.token || null;
      const profile = resp?.data?.user || resp?.data?.profile || null;
      if (token) {
        setAccessTokenState(token);
        setUser(profile);
        return token;
      }
      setAccessTokenState(null);
      setUser(null);
      return null;
    } catch (error) {
      // Security errors during refresh are handled by axios interceptor
      throw error;
    }
  }, []);

  const apiCall = useCallback(async (config) => {
    // config: { url, method, params, data }
    const resp = await api.request(config);
    return resp.data;
  }, []);

  const logout = useCallback(async () => {
    // Set logout flag in sessionStorage to prevent silent refresh from restoring session
    safeSessionStorage.setItem('hasLoggedOut', 'true');
    
    // Broadcast logout event to other tabs
    broadcastAuthEvent('LOGOUT');
    
    // Clear in-memory state first to avoid race with any UI rendering
    setAccessTokenState(null);
    setUser(null);
    setAccessToken(null); // sync module token

    // Keep remembered email if user chose rememberMe; do not persist access tokens in storage

    try {
      const resp = await rawApi.post('/auth/logout');

      // Show a friendly message to the user
      if (resp && (resp.status === 200 || resp.status === 204)) {
        showToast('Logged out successfully');
      } else {
        showToast('Logged out (server response)', 'info');
      }
    } catch (e) {
      // Show error but proceed with logout
      showToast('Logging out...', 'info');
      // proceed to clear client state regardless
    } finally {
      // Small delay to allow toast to be shown before redirect
      setTimeout(() => {
        // Force replace to login and reload to ensure app state is clean
        try { 
          window.location.replace('/login'); 
        } catch (e) { 
          // Fallback to href if replace fails
          try { window.location.href = '/login'; } catch (err) { /* noop */ }
        }
      }, 500);
    }
  }, []);

  const value = {
    accessToken: accessTokenState,
    user,
    login,
    logout,
    refreshAccessToken,
    apiCall,
    isAuthenticated: !!accessTokenState,
    initializing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
