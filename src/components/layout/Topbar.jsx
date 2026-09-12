import { Link } from 'react-router-dom';
import { SearchIcon, BellIcon, ListIcon, ChevronRightSmallIcon, CalendarIcon } from '../icons/Icons';
import { getAvatarColor } from '../../utils/avatarColor';
import './Topbar.css';

const Topbar = ({
  title,
  subtitle,
  breadcrumbs,
  dateLabel,
  user,
  notificationCount = 0,
  onMenuClick,
}) => {
  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const color = getAvatarColor(user?.name || 'User');

  const handleAvatarError = (e) => {
    // If avatar URL fails to load (expired), show initials as fallback
    console.warn('Avatar URL failed to load, showing initials as fallback');
    e.target.style.display = 'none';
    e.target.parentElement.style.background = color.bg;
    e.target.parentElement.style.color = color.fg;
    e.target.parentElement.textContent = initials;
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <ListIcon />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          {breadcrumbs?.length > 0 ? (
            <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="topbar-breadcrumb-item">
                  {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                  {i < breadcrumbs.length - 1 && <ChevronRightSmallIcon width={12} height={12} />}
                </span>
              ))}
            </nav>
          ) : (
            subtitle && <p className="topbar-subtitle">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {dateLabel && (
          <div className="topbar-date-pill">
            <CalendarIcon width={14} height={14} />
            <span>{dateLabel}</span>
          </div>
        )}



        <button className="topbar-bell" aria-label="Notifications">
          <BellIcon />
          {notificationCount > 0 && <span className="topbar-bell-badge">{notificationCount}</span>}
        </button>

        <div className="topbar-user">
          <div 
            className="topbar-avatar"
            style={{ 
              background: user?.avatarUrl ? 'transparent' : color.bg,
              color: user?.avatarUrl ? 'transparent' : color.fg
            }}
          >
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user?.name || 'User'} 
                className="topbar-avatar-image"
                onError={handleAvatarError}
              />
            ) : (
              initials
            )}
          </div>
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
