import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  BellIcon, 
  FilterIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  AlertCircleIcon,
  InfoIcon,
  FileTextIcon,
  SettingsIcon,
  ChevronRightIcon,
  XIcon
} from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import './Notifications.css';

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Requests', value: 'requests' },
  { label: 'Approvals', value: 'approvals' },
  { label: 'System', value: 'system' },
];

const ITEMS_PER_PAGE = 8;

const formatNotificationTime = (dateStr) => {
  if (!dateStr) return { top: '', bottom: '' };
  const date = new Date(dateStr);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isToday) {
    return { top: timeStr, bottom: 'Today' };
  } else if (isYesterday) {
    return { top: 'Yesterday', bottom: timeStr };
  } else {
    const dateStrFormatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return { top: dateStrFormatted, bottom: timeStr };
  }
};

const getNotificationIcon = (category, title) => {
  const titleLower = title?.toLowerCase() || '';

  if (titleLower.includes('approved') || titleLower.includes('success')) {
    return { icon: CheckCircleIcon, color: '#16a34a', bgColor: '#dcfce7' };
  }
  if (titleLower.includes('pending') || titleLower.includes('waiting')) {
    return { icon: ClockIcon, color: '#d97706', bgColor: '#fef3c7' };
  }
  if (titleLower.includes('comp-off approved')) {
    return { icon: CalendarIcon, color: '#9333ea', bgColor: '#f3e8ff' };
  }
  if (titleLower.includes('holiday') || titleLower.includes('calendar')) {
    return { icon: CalendarIcon, color: '#2563eb', bgColor: '#e0f2fe' };
  }
  if (titleLower.includes('policy') || titleLower.includes('update')) {
    return { icon: BellIcon, color: '#d97706', bgColor: '#fef3c7' };
  }
  if (titleLower.includes('maintenance') || titleLower.includes('system')) {
    return { icon: AlertCircleIcon, color: '#9333ea', bgColor: '#f3e8ff' };
  }
  if (titleLower.includes('statement') || titleLower.includes('monthly')) {
    return { icon: FileTextIcon, color: '#2563eb', bgColor: '#e0f2fe' };
  }

  switch (category) {
    case 'REQUESTS':
      return { icon: FileTextIcon, color: '#2563eb', bgColor: '#e0f2fe' };
    case 'APPROVALS':
      return { icon: CheckCircleIcon, color: '#16a34a', bgColor: '#dcfce7' };
    case 'SYSTEM':
      return { icon: InfoIcon, color: '#9333ea', bgColor: '#f3e8ff' };
    default:
      return { icon: BellIcon, color: '#d97706', bgColor: '#fef3c7' };
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const [tabCounts, setTabCounts] = useState({
    all: 0,
    unread: 0,
    requests: 0,
    approvals: 0,
    system: 0,
  });

  const [preferences, setPreferences] = useState({
    leaveRequestUpdates: true,
    approvalNotifications: true,
    compOffUpdates: true,
    policyUpdates: true,
    systemNotifications: true,
    holidayReminders: true,
  });
  const [updatingPreferences, setUpdatingPreferences] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState({ from: '', to: '' });
  const [filterCategory, setFilterCategory] = useState('all');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.getNotifications({
        tab: activeTab,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      const items = response?.data ?? (Array.isArray(response) ? response : []);
      const count = response?.unreadCount ?? 0;
      const total = response?.totalCount ?? response?.total ?? items.length;

      setNotifications(items);
      setUnreadCount(count);
      setTotalNotifications(total);

      setTabCounts(prev => ({
        ...prev,
        [activeTab]: total,
        unread: count,
      }));
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Failed to load notifications.');
      setNotifications([]);
      setTotalNotifications(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  const loadPreferences = useCallback(async () => {
    try {
      const response = await apiService.getNotificationPreferences();
      if (response) {
        setPreferences(response);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    const fetchAllTabCounts = async () => {
      try {
        const counts = { ...tabCounts };
        for (const tab of TABS) {
          try {
            const res = await apiService.getNotifications({ tab: tab.value, page: 1, limit: 1 });
            if (res?.totalCount !== undefined) {
              counts[tab.value] = res.totalCount;
            } else if (res?.total !== undefined) {
              counts[tab.value] = res.total;
            }
          } catch (e) {
            console.warn(`Could not load tab count for ${tab.value}`);
          }
        }
        setTabCounts(counts);
      } catch (err) {
        console.error('Error loading tab counts:', err);
      }
    };
    fetchAllTabCounts();
  }, []);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setCurrentPage(1);
  };


  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    if (notification.relatedEntityType) {
      switch (notification.relatedEntityType) {
        case 'LEAVE_REQUEST':
          navigate('/my-requests');
          break;
        case 'COMP_OFF_REQUEST':
          navigate('/comp-off');
          break;
        case 'HOLIDAY':
          navigate('/holiday-calendar');
          break;
        default:
          break;
      }
    }
  };


  const handlePreferenceToggle = async (key) => {
    const previous = { ...preferences };
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    setUpdatingPreferences(true);

    try {
      const response = await apiService.updateNotificationPreferences(updated);
      if (response) {
        setPreferences(response);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setPreferences(previous);
    } finally {
      setUpdatingPreferences(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMarkAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    try {
      await apiService.markNotificationAsRead(notificationId);

      // Update active list state locally
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      // Re-sync unread & tab counts
      setUnreadCount(prev => Math.max(0, prev - 1));
      setTabCounts(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();

      // Mark all loaded items as read
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));

      // Reset counters
      setUnreadCount(0);
      setTabCounts(prev => ({
        ...prev,
        unread: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const totalPages = Math.ceil(totalNotifications / ITEMS_PER_PAGE) || 1;
  const showingFrom = totalNotifications > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, totalNotifications);

  if (loading && notifications.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Notifications"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications' }]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      badgeCounts={{ notifications: unreadCount }}
      user={user}
      notificationCount={unreadCount}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}

      <div className="notifications-container">
        <div className="notifications-main">
          <div className="notifications-header-bar">
            <div className="notifications-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  className={`notifications-tab ${activeTab === tab.value ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.value)}
                >
                  {tab.label}
                  <span className="tab-count">({tabCounts[tab.value] ?? 0})</span>
                </button>
              ))}
            </div>

            <div className="notifications-actions">
              <button className="btn-filter" onClick={() => setShowFilterModal(true)}>
                <FilterIcon width={16} height={16} />
                Filter
              </button>
              <button
                className="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some(n => !n.isRead) && unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <BellIcon width={48} height={48} />
                <p>No notifications found</p>
              </div>
            ) : (
              notifications.map(notification => {
                const { icon: Icon, color, bgColor } = getNotificationIcon(notification.category, notification.title);
                const { top, bottom } = formatNotificationTime(notification.createdAt);

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon" style={{ backgroundColor: bgColor, color }}>
                      <Icon width={22} height={22} />
                    </div>

                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-description">{notification.description}</p>
                    </div>

                    <div className="notification-right">
                      <div className="notification-time-block">
                        <span className="time-top">{top}</span>
                        <span className="time-bottom">{bottom}</span>
                      </div>
                      {!notification.isRead && <span className="notification-unread-dot" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalNotifications > 0 && (
            <div className="notifications-pagination">
              <div className="pagination-info">
                Showing {showingFrom} to {showingTo} of {totalNotifications} notifications
              </div>
              <div className="pagination-controls">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon width={16} height={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="notifications-sidebar">
          <div className="preferences-panel">
            <div className="preferences-header">
              <h3>Notification Preferences</h3>
              <SettingsIcon width={18} height={18} />
            </div>
            <p className="preferences-description">Choose what notifications you want to receive.</p>

            <div className="preferences-list">
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="preference-item">
                  <span className="preference-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <button
                    className={`preference-toggle ${value ? 'on' : 'off'}`}
                    onClick={() => handlePreferenceToggle(key)}
                    disabled={updatingPreferences}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>
              ))}
            </div>

            <button className="btn-manage-preferences">
              Manage Preferences <ChevronRightIcon width={14} height={14} />
            </button>
          </div>

          <div className="quick-actions-panel">
            <h3>Quick Actions</h3>
            <div className="quick-actions-list">
              <button className="quick-action-item" onClick={() => navigate('/apply-leave')}>
                <div className="quick-action-icon green">
                  <FileTextIcon width={18} height={18} />
                </div>
                <span>Apply Leave</span>
                <ChevronRightIcon width={16} height={16} />
              </button>

              <button className="quick-action-item" onClick={() => navigate('/my-requests')}>
                <div className="quick-action-icon blue">
                  <FileTextIcon width={18} height={18} />
                </div>
                <span>My Requests</span>
                <ChevronRightIcon width={16} height={16} />
              </button>

              <button className="quick-action-item" onClick={() => navigate('/leave-ledger')}>
                <div className="quick-action-icon yellow">
                  <FileTextIcon width={18} height={18} />
                </div>
                <span>Leave Ledger</span>
                <ChevronRightIcon width={16} height={16} />
              </button>

              <button className="quick-action-item" onClick={() => navigate('/holiday-calendar')}>
                <div className="quick-action-icon purple">
                  <CalendarIcon width={18} height={18} />
                </div>
                <span>Holiday Calendar</span>
                <ChevronRightIcon width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Filter Notifications</h3>
              <button className="modal-close" onClick={() => setShowFilterModal(false)}>
                <XIcon width={20} height={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="REQUESTS">Requests</option>
                  <option value="APPROVALS">Approvals</option>
                  <option value="SYSTEM">System</option>
                </select>
              </div>
              <div className="filter-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={filterDateRange.from}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={filterDateRange.to}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev, to: e.target.value }))}
                  min={filterDateRange.from || undefined}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowFilterModal(false)}>
                Reset
              </button>
              <button className="btn-primary" onClick={() => setShowFilterModal(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Notifications;