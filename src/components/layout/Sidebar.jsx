import { Link, useLocation } from 'react-router-dom';
import { LogoutIcon } from '../icons/Icons';
import './Sidebar.css';

const Sidebar = ({
  portalLabel = 'EMPLOYEE PORTAL',
  navItems = [],
  badgeCounts = {},
  onLogout,
  isOpen = false,
  onClose,
}) => {
  const location = useLocation();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">LMS</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">LMS</span>
            <span className="sidebar-logo-subtitle">Leave Management System</span>
          </div>
        </div>

        {portalLabel && <div className="sidebar-portal-label">{portalLabel}</div>}

        <nav className="sidebar-nav">
          {navItems.map(({ label, path, icon: Icon, badgeKey, helpIcon: HelpIcon }) => {
            const isActive = location.pathname === path;
            const badge = badgeKey ? badgeCounts[badgeKey] || 0 : 0;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="sidebar-nav-icon" />
                <span>{label}</span>
                {badge > 0 ? (
                  <span className="sidebar-nav-badge">{badge}</span>
                ) : (
                  HelpIcon && <HelpIcon className="sidebar-help-icon" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-help">
            <p>Need Help? Contact HR Support</p>
            <button 
              className="sidebar-contact-btn"
              onClick={() => window.location.href = 'mailto:hr@company.com'}
            >
              Contact Us
            </button>
          </div>
          <button className="sidebar-logout" onClick={onLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
