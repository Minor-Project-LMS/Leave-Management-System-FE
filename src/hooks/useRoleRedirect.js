import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isManagerRole, isHRRole, getHomePathForRole } from '../config/navConfig';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA).toLowerCase() === 'true';

const portalForRole = (role) => {
  if (isHRRole(role)) return 'hr';
  if (isManagerRole(role)) return 'manager';
  return 'employee';
};

// Safety net for the case where a user reloads or bookmarks the wrong
// portal's URL directly (e.g. an HR admin landing on /dashboard, or a
// manager landing on /hr/dashboard). Login.jsx already routes correctly on
// fresh login — this catches everything else.
export const useRoleRedirect = (expectedPortal) => {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // In mock mode there's no real role to check against — let whichever
    // dashboard route was visited directly render, for easy UI preview.
    if (USE_MOCK) return;
    if (initializing || !user) return;

    const actualPortal = portalForRole(user.role);
    if (actualPortal !== expectedPortal) {
      navigate(getHomePathForRole(user.role), { replace: true });
    }
  }, [user, initializing, expectedPortal, navigate]);
};
