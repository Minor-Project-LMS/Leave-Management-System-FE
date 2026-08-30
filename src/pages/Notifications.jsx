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
  CheckIcon,
  BookIcon,
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
    return { icon: CheckCircleIcon, color: '#10b981', bgColor: '#e6f4ea' };
  }
  if (titleLower.includes('pending') || titleLower.includes('waiting')) {
    return { icon: ClockIcon, color: '#d97706', bgColor: '#fef3c7' };
  }
  if (titleLower.includes('comp-off approved')) {
    return { icon: CalendarIcon, color: '#8b5cf6', bgColor: '#f3e8ff' };
  }
  if (titleLower.includes('holiday') || titleLower.includes('calendar')) {
    return { icon: CalendarIcon, color: '#2563eb', bgColor: '#e0f2fe' };
  }
  if (titleLower.includes('policy') || titleLower.includes('update')) {
    return { icon: BellIcon, color: '#d97706', bgColor: '#fef3c7' };
  }
  if (titleLower.includes('maintenance') || titleLower.includes('error')) {
    return { icon: AlertCircleIcon, color: '#a855f7', bgColor: '#f3e8ff' };
  }
  if (titleLower.includes('statement') || titleLower.includes('document')) {
    return { icon: FileTextIcon, color: '#2563eb', bgColor: '#e0f2fe' };
  }
  
  switch (category) {
    case 'REQUESTS':
      return { icon: FileTextIcon, color: '#6366f1', bgColor: '#e0e7ff' };
    case 'APPROVALS':
      return { icon: CheckCircleIcon, color: '#10b981', bgColor: '#e6f4ea' };
    case 'SYSTEM':
      return { icon: InfoIcon, color: '#3b82f6', bgColor: '#e0f2fe' };
    default:
      return { icon: BellIcon, color: '#f59e0b', bgColor: '#fef3c7' };
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
  
  // Tab counts
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
  
  // Filter modal state
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
      const total = response?.total ?? items.length;

      setNotifications(items);
      setUnreadCount(count);
      setTotalNotifications(total);
      
      // Update current tab count
      setTabCounts(prev => ({
        ...prev,
        [activeTab]: total,
        unread: count, // Always update unread count
      }));
    } catch (err) {
      console.error('Error loading notifications:', err);
      const errorMessage = err.message || 'Failed to load notifications. Please try again later.';
      setError(errorMessage);
      setNotifications([]);
      setTotalNotifications(0);
      setUnreadCount(0);
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

  // Load initial tab counts
  useEffect(() => {
    const loadTabCounts = async () => {
      try {
        // Only load 'all' and 'unread' counts to avoid excessive API calls
        const tabsToLoad = ['all', 'unread'];
        const counts = { ...tabCounts };
        
        for (const tab of tabsToLoad) {
          try {
            const response = await apiService.getNotifications({ tab, page: 1, limit: 1 });
            if (response?.total !== undefined) {
              counts[tab] = response.total;
            }
          } catch (e) {
            console.warn(`Failed to load count for tab ${tab}`);
          }
        }
        
        setTabCounts(counts);
      } catch (err) {
        console.error('Error loading tab counts:', err);
      }
    };
    
    loadTabCounts();
  }, []); // Only run once on mount

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      setTabCounts(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read. Please try again.');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to related entity if available
    if (notification.relatedEntityType && notification.relatedEntityId) {
      switch (notification.relatedEntityType) {
        case 'LEAVE_REQUEST':
          // Navigate to My Requests page instead of specific request to avoid 404 errors
          // for deleted/expired requests. The user can see all their requests there.
          navigate('/my-requests');
          break;
        case 'COMP_OFF_REQUEST':
          navigate('/comp-off');
          break;
        case 'HOLIDAY':
          navigate('/holiday-calendar');
          break;
        default:
          // For other types, just mark as read
          break;
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      setTabCounts(prev => ({
        ...prev,
        unread: 0,
      }));
      
      // Show success message if response includes updated count
      if (response?.updated !== undefined) {
        console.log(`Marked ${response.updated} notifications as read`);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all notifications as read. Please try again.');
    }
  };

  const handleFilterApply = () => {
    // Apply filters and reload
    setCurrentPage(1);
    setShowFilterModal(false);
    // In a real implementation, you would pass filter parameters to the API
    loadNotifications();
  };

  const handleFilterReset = () => {
    setFilterDateRange({ from: '', to: '' });
    setFilterCategory('all');
    setShowFilterModal(false);
    setCurrentPage(1);
    loadNotifications();
  };

  const handlePreferenceToggle = async (key) => {
    const previous = { ...preferences };
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    setUpdatingPreferences(true);

    try {
      const response = await apiService.updateNotificationPreferences(updated);
      // Update with server response to ensure sync
      if (response) {
        setPreferences(response);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setPreferences(previous);
      setError('Failed to update notification preferences. Please try again.');
    } finally {
      setUpdatingPreferences(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
        {/* Main Section */}
        <div className="notifications-main">
          {/* Header Bar */}
          <div className="notifications-header-bar">
            <div className="notifications-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  className={`notifications-tab ${activeTab === tab.value ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.value)}
                >
                  {tab.label}
                  <span className="tab-count">({tabCounts[tab.value] || 0})</span>
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
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Notifications List */}
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

          {/* Pagination */}
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

        {/* Sidebar */}
        <div className="notifications-sidebar">
          {/* Notification Preferences */}
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

          {/* Quick Actions */}
          <div className="quick-actions-panel">
            <h3>Quick Actions</h3>
            <div className="quick-actions-list">
              <button 
                className="quick-action-item"
                onClick={() => navigate('/apply-leave')}
              >
                <div className="quick-action-icon green">
                  <FileTextIcon width={18} height={18} />
                </div>
                <span>Apply Leave</span>
                <ChevronRightIcon width={16} height={16} />
              </button>

              <button 
                className="quick-action-item"
                onClick={() => navigate('/my-requests')}
              >
                <div className="quick-action-icon blue">
                  <FileTextIcon width={18} height={18} />
                </div>
                <span>My Requests</span>
                <ChevronRightIcon width={16} height={16} />
              </button>

              <button 
                className="quick-action-item"
                onClick={() => navigate('/leave-ledger')}
              >
                <div className="quick-action-icon yellow">
                  <BookIcon width={18} height={18} />
                </div>
                <span>Leave Ledger</span>
                <ChevronRightIcon width={16} height={16} />
              </button>

              <button 
                className="quick-action-item"
                onClick={() => navigate('/holiday-calendar')}
              >
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

      {/* Filter Modal */}
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
              <button className="btn-secondary" onClick={handleFilterReset}>
                Reset
              </button>
              <button className="btn-primary" onClick={handleFilterApply}>
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