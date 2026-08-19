import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isManagerRole } from '../config/navConfig';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA).toLowerCase() === 'true';

// Safety net for the case where a user reloads or bookmarks the wrong
// portal's URL directly (e.g. a manager landing on /dashboard). Login.jsx
// already routes correctly on fresh login — this catches everything else.
export const useRoleRedirect = (expectedPortal) => {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // In mock mode there's no real role to check against — let whichever
    // dashboard route was visited directly render, for easy UI preview.
    if (USE_MOCK) return;
    if (initializing || !user) return;

    const userIsManager = isManagerRole(user.role);
    const onManagerPortal = expectedPortal === 'manager';

    if (userIsManager && !onManagerPortal) {
      navigate('/manager/dashboard', { replace: true });
    } else if (!userIsManager && onManagerPortal) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, initializing, expectedPortal, navigate]);
};
