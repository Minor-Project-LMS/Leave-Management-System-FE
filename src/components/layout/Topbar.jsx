import { SearchIcon, BellIcon, ListIcon } from '../icons/Icons';
import './Topbar.css';

const Topbar = ({ title, subtitle, user, notificationCount = 0, onMenuClick }) => {
  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <ListIcon />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <SearchIcon className="topbar-search-icon" />
          <input type="text" placeholder="Search anything..." />
          <kbd>Ctrl+K</kbd>
        </div>

        <button className="topbar-bell" aria-label="Notifications">
          <BellIcon />
          {notificationCount > 0 && <span className="topbar-bell-badge">{notificationCount}</span>}
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">{initials}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name || 'User'}</span>
            <span className="topbar-user-role">{user?.role || 'Employee'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
