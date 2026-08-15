import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../context/AuthProvider';
import { isSecurityError } from '../utils/errorHandler';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, initializing } = useAuth();

  // Handle security errors by forcing logout
  const handleSecurityError = (error) => {
    if (isSecurityError(error)) {
      logout();
    }
  };

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [initializing, isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, the auth context will handle the redirect
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome to LMS Dashboard</h1>
          <p>This is a placeholder dashboard. The full dashboard will be implemented later.</p>
        </div>

        <div className="dashboard-user-info">
          <div className="user-card">
            <h2>User Information</h2>
            <div className="user-details">
              <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
              <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;