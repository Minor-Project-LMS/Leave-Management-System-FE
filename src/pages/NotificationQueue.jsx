import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import Pagination from '../components/common/Pagination';
import { BellIcon, RefreshIcon, DownloadIcon, FilterIcon, CheckCircleIcon, XCircleIcon, ClockIcon, AlertCircleIcon, SettingsIcon, MoreVerticalIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { 
  mockNotificationQueue, 
  mockNotificationSummary, 
  mockDeliveryOverview, 
  mockNotificationTypes 
} from '../utils/mockData';
import './NotificationQueue.css';

const USE_MOCK = env.useMockData;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const NotificationQueue = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Data
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [deliveryOverview, setDeliveryOverview] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Actions menu
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'QUEUED', label: 'Queued' },
    { value: 'SENT', label: 'Sent' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const CHANNEL_OPTIONS = [
    { value: '', label: 'All Channels' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'IN_APP', label: 'In-App' },
  ];

  const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'LEAVE_APPLICATION_SUBMITTED', label: 'Leave Application' },
    { value: 'LEAVE_APPROVED', label: 'Leave Approval' },
    { value: 'LEAVE_REJECTED', label: 'Leave Rejection' },
    { value: 'LEAVE_BALANCE_ALERT', label: 'Leave Balance Alert' },
    { value: 'POLICY_UPDATED', label: 'Policy Updated' },
    { value: 'UPCOMING_HOLIDAY_REMINDER', label: 'Holiday Reminder' },
    { value: 'LEAVE_APPLICATION_NEEDS_ATTENTION', label: 'Needs Attention' },
    { value: 'HOLIDAY_ADDED', label: 'Holiday Added' },
  ];

  // const loadNotificationQueue = useCallback(async () => {
  //   setLoading(true);
  //   setError('');
  //
  //   if (USE_MOCK) {
  //     setNotifications(mockNotificationQueue);
  //     setSummary(mockNotificationSummary);
  //     setDeliveryOverview(mockDeliveryOverview);
  //     setNotificationTypes(mockNotificationTypes);
  //     setTotalCount(mockNotificationQueue.length);
  //     setTotalPages(Math.ceil(mockNotificationQueue.length / pageSize));
  //     setLoading(false);
  //     return;
  //   }
  //
  //   try {
  //     const params = {
  //       page,
  //       limit: pageSize,
  //     };
  //
  //     if (statusFilter) params.status = statusFilter;
  //     if (channelFilter) params.channel = channelFilter;
  //     if (typeFilter) params.templateCode = typeFilter;
  //     if (dateFrom) params.dateFrom = dateFrom;
  //     if (dateTo) params.dateTo = dateTo;
  //
  //     const response = await apiService.getNotificationQueue(params);
  //     const data = response?.data || response?.items || response || [];
  //
  //     setNotifications(data);
  //     setTotalCount(response?.totalCount || response?.totalElements || data.length || 0);
  //     setTotalPages(response?.totalPages || Math.ceil((response?.totalCount || data.length) / pageSize));
  //
  //     // Calculate summary from data
  //     const totalQueued = data.length;
  //     const sentSuccessfully = data.filter(n => n.status === 'SENT').length;
  //     const inProgress = data.filter(n => n.status === 'IN_PROGRESS').length;
  //     const failed = data.filter(n => n.status === 'FAILED').length;
  //     const scheduled = data.filter(n => n.status === 'QUEUED').length;
  //
  //     setSummary({
  //       totalQueued,
  //       sentSuccessfully,
  //       inProgress,
  //       failed,
  //       scheduled,
  //     });
  //
  //     setDeliveryOverview([
  //       { label: 'Sent', value: sentSuccessfully, color: '#10B981' },
  //       { label: 'In Progress', value: inProgress, color: '#F59E0B' },
  //       { label: 'Failed', value: failed, color: '#EF4444' },
  //     ]);
  //
  //     // Calculate notification types breakdown
  //     const typeCounts = {};
  //     data.forEach(n => {
  //       const type = n.templateCode || 'OTHER';
  //       typeCounts[type] = (typeCounts[type] || 0) + 1;
  //     });
  //
  //     const typesBreakdown = Object.entries(typeCounts).map(([type, count]) => ({
  //       type: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
  //       count,
  //       percentage: ((count / totalQueued) * 100).toFixed(1),
  //     }));
  //
  //     setNotificationTypes(typesBreakdown);
  //   } catch (err) {
  //     console.error('API Error:', err);
  //     setError(getErrorMessage(err, 'Failed to load notification queue data.'));
  //     // Fallback to mock data on error
  //     setNotifications(mockNotificationQueue);
  //     setSummary(mockNotificationSummary);
  //     setDeliveryOverview(mockDeliveryOverview);
  //     setNotificationTypes(mockNotificationTypes);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [page, pageSize, statusFilter, channelFilter, typeFilter, dateFrom, dateTo]);

  const loadNotificationQueue = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setNotifications(mockNotificationQueue);
      setSummary(mockNotificationSummary);
      setDeliveryOverview(mockDeliveryOverview);
      setNotificationTypes(mockNotificationTypes);
      setTotalCount(mockNotificationQueue.length);
      setTotalPages(Math.ceil(mockNotificationQueue.length / pageSize));
      setLoading(false);
      return;
    }

    try {
      const params = {
        page,
        limit: pageSize,
      };

      if (statusFilter) params.status = statusFilter;
      if (channelFilter) params.channel = channelFilter;
      if (typeFilter) params.templateCode = typeFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiService.getNotificationQueue(params);

      // Read directly from response.data and response.page keys returned by backend
      const data = response?.data || [];
      const pageInfo = response?.page || {};

      setNotifications(data);
      setTotalCount(pageInfo.totalCount ?? data.length);
      setTotalPages(pageInfo.totalPages ?? Math.ceil(data.length / pageSize));

      // Calculate dynamic metrics from loaded filtered items
      const totalQueued = pageInfo.totalCount ?? data.length;
      const sentSuccessfully = data.filter(n => n.status === 'SENT').length;
      const inProgress = data.filter(n => n.status === 'IN_PROGRESS').length;
      const failed = data.filter(n => n.status === 'FAILED').length;
      const scheduled = data.filter(n => n.status === 'QUEUED').length;

      setSummary({
        totalQueued,
        sentSuccessfully,
        inProgress,
        failed,
        scheduled,
      });

      setDeliveryOverview([
        { label: 'Sent', value: sentSuccessfully, color: '#10B981' },
        { label: 'In Progress', value: inProgress, color: '#F59E0B' },
        { label: 'Failed', value: failed, color: '#EF4444' },
      ]);

      // Calculate notification types breakdown
      const typeCounts = {};
      data.forEach(n => {
        const type = n.templateCode || 'OTHER';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const typesBreakdown = Object.entries(typeCounts).map(([type, count]) => ({
        type: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        count,
        percentage: data.length ? ((count / data.length) * 100).toFixed(1) : 0,
      }));

      setNotificationTypes(typesBreakdown);
    } catch (err) {
      console.error('API Error:', err);
      setError(getErrorMessage(err, 'Failed to load notification queue data.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, channelFilter, typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadNotificationQueue();
  }, [loadNotificationQueue]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotificationQueue();
    setRefreshing(false);
  };

  const handleRetryFailed = async () => {
    if (retrying) return;
    setRetrying(true);

    if (USE_MOCK) {
      setTimeout(() => {
        setRetrying(false);
        setError('Retry completed successfully.');
        setTimeout(() => setError(''), 3000);
      }, 1500);
      return;
    }

    try {
      const response = await apiService.retryFailedNotifications();
      const requeued = response?.requeued || response?.data?.requeued || 0;
      setError(`Successfully requeued ${requeued} failed notifications.`);
      setTimeout(() => setError(''), 3000);
      await loadNotificationQueue();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to retry failed notifications.'));
    } finally {
      setRetrying(false);
    }
  };

  const handleRetrySingle = async (notificationId) => {
    if (USE_MOCK) {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, status: 'QUEUED', retryCount: 0 } : n
      ));
      setActionMenuOpen(null);
      return;
    }

    try {
      await apiService.retryNotification(notificationId);
      setError('Notification requeued successfully.');
      setTimeout(() => setError(''), 3000);
      await loadNotificationQueue();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to retry notification.'));
    } finally {
      setActionMenuOpen(null);
    }
  };

  const handleCancelNotification = async (notificationId) => {
    if (USE_MOCK) {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, status: 'CANCELLED' } : n
      ));
      setActionMenuOpen(null);
      return;
    }

    try {
      await apiService.cancelNotification(notificationId);
      setError('Notification cancelled successfully.');
      setTimeout(() => setError(''), 3000);
      await loadNotificationQueue();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to cancel notification.'));
    } finally {
      setActionMenuOpen(null);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    if (USE_MOCK) {
      setTimeout(() => setExporting(false), 1500);
      return;
    }

    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiService.exportNotificationQueue(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notification-queue-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to export notification queue logs.'));
    } finally {
      setExporting(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    loadNotificationQueue();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setChannelFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleActionMenuToggle = (notificationId) => {
    setActionMenuOpen(actionMenuOpen === notificationId ? null : notificationId);
    setSelectedNotification(notifications.find(n => n.id === notificationId));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SENT: { color: '#10B981', icon: CheckCircleIcon, label: 'Sent' },
      FAILED: { color: '#EF4444', icon: XCircleIcon, label: 'Failed' },
      IN_PROGRESS: { color: '#F59E0B', icon: ClockIcon, label: 'In Progress' },
      QUEUED: { color: '#6B7280', icon: ClockIcon, label: 'Queued' },
      CANCELLED: { color: '#9CA3AF', icon: XCircleIcon, label: 'Cancelled' },
    };
    const config = statusConfig[status] || { color: '#6B7280', icon: ClockIcon, label: status };
    const Icon = config.icon;
    return (
      <span className="notification-status-badge" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
        <Icon width={12} height={12} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !notifications.length) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Notification Queue...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Notification Queue"
      subtitle="Monitor and manage outbound notifications"
      breadcrumbs={[
        { label: 'HR Dashboard', path: '/hr/dashboard' },
        { label: 'Notification Queue' }
      ]}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {USE_MOCK && (
        <div className="dashboard-info-banner">
          <strong>Development Mode:</strong> Using mock data. Set VITE_USE_MOCK_DATA=false to connect to real backend.
        </div>
      )}
      
      {error && <div className="dashboard-error-banner">{error}</div>}

      {/* Summary Cards */}
      <div className="notification-summary-cards">
        <StatCard variant="detailed" icon={BellIcon} label="Total Queued" value={summary?.totalQueued ?? 0} sublabel="All notifications" />
        <StatCard variant="detailed" icon={CheckCircleIcon} iconClass="icon-green" label="Sent Successfully" value={summary?.sentSuccessfully ?? 0} sublabel={`${summary?.totalQueued ? ((summary.sentSuccessfully / summary.totalQueued) * 100).toFixed(1) : 0}%`} />
        <StatCard variant="detailed" icon={ClockIcon} iconClass="icon-amber" label="In Progress" value={summary?.inProgress ?? 0} sublabel={`${summary?.totalQueued ? ((summary.inProgress / summary.totalQueued) * 100).toFixed(1) : 0}%`} />
        <StatCard variant="detailed" icon={XCircleIcon} iconClass="icon-red" label="Failed" value={summary?.failed ?? 0} sublabel={`${summary?.totalQueued ? ((summary.failed / summary.totalQueued) * 100).toFixed(1) : 0}%`} />
        <StatCard variant="detailed" icon={AlertCircleIcon} iconClass="icon-purple" label="Scheduled" value={summary?.scheduled ?? 0} sublabel="Pending delivery" />
      </div>

      {/* Filter Bar */}
      <div className="notification-filter-bar">
        <div className="notification-filter-group">
          <label>Status</label>
          <select
            className="notification-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="notification-filter-group">
          <label>Type</label>
          <select
            className="notification-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="notification-filter-group">
          <label>Channel</label>
          <select
            className="notification-select"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            {CHANNEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="notification-filter-group">
          <label>Date Range</label>
          <div className="notification-date-inputs">
            <input
              type="date"
              className="notification-date-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="notification-date-separator">to</span>
            <input
              type="date"
              className="notification-date-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="notification-filter-actions">
          <button 
            className="notification-filter-btn notification-apply-btn"
            onClick={handleApplyFilters}
          >
            <FilterIcon width={16} height={16} />
            Filter
          </button>
          <button 
            className="notification-filter-btn notification-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshIcon width={16} height={16} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            className="notification-filter-btn notification-retry-btn"
            onClick={handleRetryFailed}
            disabled={retrying}
          >
            <RefreshIcon width={16} height={16} />
            {retrying ? 'Retrying...' : 'Retry Failed'}
          </button>
        </div>
      </div>

      {/* Notification Table */}
      <div className="notification-table-section">
        <div className="notification-table-container">
          <table className="notification-table">
            <thead>
              <tr>
                <th>Notification ID</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Recipient</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Scheduled Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notification => (
                <tr key={notification.id}>
                  <td className="notification-id">#{notification.id}</td>
                  <td className="notification-type">{notification.templateCode?.replace(/_/g, ' ')}</td>
                  <td className="notification-subject">{notification.subject}</td>
                  <td className="notification-recipient">{notification.recipientName}</td>
                  <td className="notification-channel">
                    <span className={`channel-badge ${notification.channel?.toLowerCase()}`}>
                      {notification.channel}
                    </span>
                  </td>
                  <td className="notification-status">{getStatusBadge(notification.status)}</td>
                  <td className="notification-scheduled">{formatDate(notification.scheduledAt)}</td>
                  <td className="notification-actions">
                    <div className="notification-action-cell">
                      <button
                        className="notification-action-btn"
                        onClick={() => handleActionMenuToggle(notification.id)}
                      >
                        <MoreVerticalIcon width={16} height={16} />
                      </button>
                      {actionMenuOpen === notification.id && (
                        <div className="notification-action-menu">
                          {notification.status === 'FAILED' && notification.retryCount < 3 && (
                            <button
                              className="notification-action-menu-item"
                              onClick={() => handleRetrySingle(notification.id)}
                            >
                              <RefreshIcon width={14} height={14} />
                              Retry
                            </button>
                          )}
                          {(notification.status === 'QUEUED' || notification.status === 'IN_PROGRESS') && (
                            <button
                              className="notification-action-menu-item"
                              onClick={() => handleCancelNotification(notification.id)}
                            >
                              <XCircleIcon width={14} height={14} />
                              Cancel
                            </button>
                          )}
                          {notification.retryCount >= 3 && notification.status === 'FAILED' && (
                            <button
                              className="notification-action-menu-item notification-action-menu-item-disabled"
                              disabled
                            >
                              <AlertCircleIcon width={14} height={14} />
                              Max retries reached
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="notification-pagination">
          <span className="pagination-info">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} notifications
          </span>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Charts and Quick Actions */}
      <div className="notification-layout">
        <div className="notification-main">
          {/* Delivery Overview Chart */}
          <div className="dashboard-panel">
            <div className="widget-header">
              <h3>Delivery Overview</h3>
            </div>
            <div className="delivery-overview-chart">
              <div className="donut-chart">
                <svg viewBox="0 0 100 100" className="donut-chart-svg">
                  {deliveryOverview.map((segment, index) => {
                    const percentage = (segment.value / deliveryOverview.reduce((sum, s) => sum + s.value, 0)) * 100;
                    const offset = index === 0 ? 0 : deliveryOverview.slice(0, index).reduce((sum, s) => sum + (s.value / deliveryOverview.reduce((sum, s) => sum + s.value, 0)) * 100, 0) * 3.6;
                    return (
                      <circle
                        key={segment.label}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth="12"
                        strokeDasharray={`${percentage * 3.6} 360`}
                        strokeDashoffset={`-${offset}`}
                        transform="rotate(-90 50 50)"
                      />
                    );
                  })}
                </svg>
                <div className="donut-chart-center">
                  <span className="donut-chart-value">{summary?.totalQueued ?? 0}</span>
                  <span className="donut-chart-label">Total</span>
                </div>
              </div>
              <div className="donut-chart-legend">
                {deliveryOverview.map(segment => (
                  <div key={segment.label} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: segment.color }} />
                    <span className="legend-label">{segment.label}</span>
                    <span className="legend-value">{segment.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Types Breakdown */}
          <div className="dashboard-panel">
            <div className="widget-header">
              <h3>Notification Types Breakdown</h3>
            </div>
            <div className="notification-types-breakdown">
              {notificationTypes.map(type => (
                <div key={type.type} className="notification-type-item">
                  <div className="notification-type-info">
                    <span className="notification-type-name">{type.type}</span>
                    <span className="notification-type-count">{type.count} ({type.percentage}%)</span>
                  </div>
                  <div className="notification-type-bar">
                    <div 
                      className="notification-type-bar-fill" 
                      style={{ width: `${type.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="notification-sidebar">
          {/* Quick Actions */}
          <div className="dashboard-panel">
            <div className="widget-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-list">
              <button
                className="quick-action-btn"
                onClick={handleRetryFailed}
                disabled={retrying}
              >
                <RefreshIcon width={18} height={18} />
                <span>Retry Failed Notifications</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate('/hr/audit-trail')}
              >
                <CheckCircleIcon width={18} height={18} />
                <span>Record Selected</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => {/* Cancel scheduled logic */}}
              >
                <XCircleIcon width={18} height={18} />
                <span>Cancel Scheduled</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={handleExport}
                disabled={exporting}
              >
                <DownloadIcon width={18} height={18} />
                <span>{exporting ? 'Exporting...' : 'Export Queue Logs'}</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate('/hr/settings')}
              >
                <SettingsIcon width={18} height={18} />
                <span>Notification Settings</span>
              </button>
            </div>
          </div>

          {/* Note Section */}
          <div className="dashboard-panel notification-notes-card">
            <div className="widget-header">
              <h3>Note</h3>
            </div>
            <div className="notification-notes-content">
              <p>
                <strong>Automatic Retries:</strong> Failed notifications are automatically retried up to 3 times before requiring manual intervention. 
                Notifications that have reached the retry limit will display a "Max retries reached" indicator and need to be handled manually.
              </p>
              <p>
                <strong>Delivery Channels:</strong> Notifications can be sent via Email or In-App. Ensure your email server configuration is correct in Settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationQueue;
