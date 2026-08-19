import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiService, getAccessToken, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

// Same flag Dashboard.jsx uses to render sample data without a backend.
// In mock mode, auth is short-circuited too, so the dashboard stays previewable.
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA).toLowerCase() === 'true';
const MOCK_USER = { name: 'John Doe', role: 'Software Engineer' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // "initializing" covers the brief window on every fresh page load where we
  // don't yet know if the httpOnly refresh cookie can silently restore a
  // session — avoids flashing the login page before that check resolves.
  const [initializing, setInitializing] = useState(true);

  // Called once on mount: the access token lives only in memory, so a full
  // page reload always clears it. This asks the backend to mint a new one
  // from the httpOnly refresh-token cookie, which the browser still has.
  useEffect(() => {
    if (USE_MOCK) {
      setUser(MOCK_USER);
      setIsAuthenticated(true);
      setInitializing(false);
      return;
    }

    const restoreSession = async () => {
      try {
        await apiService.refreshToken();
        const profile = await apiService.getCurrentUser();
        setUser(profile?.data ?? profile ?? null);
        setIsAuthenticated(true);
      } catch {
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiService.login(email, password); // sets access token in memory
    const profileFromLogin = data?.user || data?.data?.user || data?.profile || data?.data?.profile;
    let profile = profileFromLogin;
    if (!profile) {
      const res = await apiService.getCurrentUser();
      profile = res?.data ?? res ?? null;
    }
    setUser(profile);
    setIsAuthenticated(true);
    return { ...data, profile };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout(); // clears the httpOnly cookie server-side
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    initializing,
    login,
    logout,
    accessToken: getAccessToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
