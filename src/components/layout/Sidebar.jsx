import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GridIcon,
  PlusCircleIcon,
  FileTextIcon,
  BookIcon,
  CoffeeIcon,
  CalendarIcon,
  BellIcon,
  UserIcon,
  LogoutIcon,
} from '../icons/Icons';
import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: GridIcon },
  { label: 'Apply Leave', path: '/apply-leave', icon: PlusCircleIcon },
  { label: 'My Requests', path: '/my-requests', icon: FileTextIcon },
  { label: 'Leave Ledger', path: '/leave-ledger', icon: BookIcon },
  { label: 'Comp-Off', path: '/comp-off', icon: CoffeeIcon },
  { label: 'Holiday Calendar', path: '/holiday-calendar', icon: CalendarIcon },
  { label: 'Notifications', path: '/notifications', icon: BellIcon, badgeKey: 'notifications' },
  { label: 'Profile', path: '/profile', icon: UserIcon },
];

const Sidebar = ({ notificationCount = 0, onLogout, isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    // Routes that don't exist yet stay on Dashboard for now; real pages will replace this.
    if (path !== '/dashboard') return;
    navigate(path);
    if (onClose) onClose();
  };

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

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, path, icon: Icon, badgeKey }) => {
            const isActive = location.pathname === path;
            const badge = badgeKey === 'notifications' ? notificationCount : 0;
            return (
              <Link
                key={path}
                to={isActive ? location.pathname : '#'}
                onClick={(e) => {
                  if (path !== '/dashboard') e.preventDefault();
                  handleNavClick(path);
                }}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="sidebar-nav-icon" />
                <span>{label}</span>
                {badge > 0 && <span className="sidebar-nav-badge">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
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
