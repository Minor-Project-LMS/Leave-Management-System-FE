import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import './PlaceholderPage.css';

const PlaceholderPage = ({ title, portal, icon: Icon }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      title={title}
      subtitle="This page is coming soon."
      portalLabel={portal.portalLabel}
      navItems={portal.navItems}
      searchPlaceholder={portal.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      <div className="placeholder-page">
        {Icon && (
          <div className="placeholder-icon">
            <Icon width={28} height={28} />
          </div>
        )}
        <h2>{title}</h2>
        <p>This section is under construction. Check back soon.</p>
      </div>
    </DashboardLayout>
  );
};

export default PlaceholderPage;
