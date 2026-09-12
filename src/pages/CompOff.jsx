import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import { 
  CalendarIcon, 
  ClockIcon, 
  CoffeeIcon, 
  DownloadIcon, 
  InfoIcon, 
  CheckCircleIcon, 
  AlertCircleIcon
} from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import './CompOff.css';

const TABS = [
  { key: 'earned', label: 'Earned History' },
  { key: 'requests', label: 'My Requests' },
  { key: 'usage', label: 'Usage History' },
];

const COMP_OFF_RULES = [
  'Comp-Off credits are granted by your manager when you work on weekends or public holidays.',
  'Minimum 8 hours at work is required to earn 1 day comp-off.',
  'Comp-Off must be availed within 6 months from the date of earning.',
  'Contact your manager for any questions about comp-off eligibility or requests.',
];

const IMPORTANT_NOTES = [
  'You cannot apply for leave on a comp-off date.',
  'Comp-Off cannot be encashed.',
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getCompOffStatus = (request) => {
  const today = new Date();
  const expiryDate = request.expiryDate ? new Date(request.expiryDate) : null;
  
  // Check if expired
  if (expiryDate && expiryDate < today) {
    return {
      status: 'EXPIRED',
      label: 'Expired',
      color: '#dc2626', // Red
      bgColor: '#fef2f2',
      borderColor: '#fecaca'
    };
  }
  
  // Check if claimed/used (you might need to add a 'claimed' field to your data model)
  if (request.claimed || request.status === 'CLAIMED' || request.status === 'USED') {
    return {
      status: 'CLAIMED',
      label: 'Claimed',
      color: '#2563eb', // Blue
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe'
    };
  }
  
  // Default to active/available
  return {
    status: 'ACTIVE',
    label: 'Active',
    color: '#16a34a', // Green
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  };
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const USE_MOCK = env.useMockData;

const mockCompOffSummary = {
  earned: 5.0,
  availableBalance: 1.0,
  used: 4.0,
  asOnDate: formatDate(new Date()),
};

const mockCompOffRequests = [
  {
    id: 1,
    displayId: 'CO-2024-014',
    workedOn: '2024-05-18',
    reason: 'Worked on Weekend Project Release',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    expiryDate: '2024-11-18',
    issuedBy: 'Sarah Williams',
    approverRole: 'HR Manager',
    approvedOn: '2024-05-20T10:30:00Z',
    createdAt: '2024-05-19T09:00:00Z',
    status: 'APPROVED',
    claimed: false,
  },
  {
    id: 2,
    displayId: 'CO-2024-013',
    workedOn: '2024-05-11',
    reason: 'Critical Server Maintenance on Sunday',
    hoursWorked: 6.0,
    daysCredited: 0.75,
    expiryDate: '2024-11-11',
    issuedBy: 'John Smith',
    approverRole: 'Team Lead',
    approvedOn: '2024-05-13T14:15:00Z',
    createdAt: '2024-05-12T11:00:00Z',
    status: 'APPROVED',
    claimed: true,
  },
  {
    id: 3,
    displayId: 'CO-2024-012',
    workedOn: '2024-05-04',
    reason: 'Holiday Weekend Support',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    expiryDate: '2024-11-04',
    issuedBy: 'Sarah Williams',
    approverRole: 'HR Manager',
    approvedOn: '2024-05-06T09:45:00Z',
    createdAt: '2024-05-05T08:30:00Z',
    status: 'APPROVED',
    claimed: false,
  },
  {
    id: 4,
    displayId: 'CO-2024-011',
    workedOn: '2024-04-27',
    reason: 'Emergency Production Fix',
    hoursWorked: 4.0,
    daysCredited: 0.5,
    expiryDate: '2024-10-27',
    issuedBy: 'John Smith',
    approverRole: 'Team Lead',
    approvedOn: '2024-04-29T16:20:00Z',
    createdAt: '2024-04-28T12:00:00Z',
    status: 'APPROVED',
    claimed: false,
  },
  {
    id: 5,
    displayId: 'CO-2024-010',
    workedOn: '2024-04-20',
    reason: 'Weekend Client Deployment',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    expiryDate: '2024-01-20', // Expired
    issuedBy: 'Sarah Williams',
    approverRole: 'HR Manager',
    approvedOn: '2024-04-22T11:00:00Z',
    createdAt: '2024-04-21T09:15:00Z',
    status: 'APPROVED',
    claimed: false,
  },
];

const CompOff = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('earned');

  const loadCompOffData = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setSummary(mockCompOffSummary);
      setRequests(mockCompOffRequests);
      setLoading(false);
      return;
    }

    try {
      const summaryRes = await apiService.getCompOffSummary();
      const requestsRes = await apiService.getCompOffRequests({ page: 1, limit: 100 });

      const compOffSummary = {
        earned: summaryRes?.compOffBalance ? summaryRes.compOffBalance + 4.0 : 5.0,
        availableBalance: summaryRes?.compOffBalance || 1.0,
        used: summaryRes?.used || 4.0,
        asOnDate: formatDate(new Date()),
      };

      setSummary(compOffSummary);
      setRequests(requestsRes?.data ?? requestsRes ?? []);
    } catch (err) {
      console.error('Error loading comp-off data:', err);
      setError(err.message || 'Failed to load comp-off data. Showing sample data.');
      setSummary(mockCompOffSummary);
      setRequests(mockCompOffRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadCompOffData();
    }
    return () => {
      isMounted = false;
    };
  }, [loadCompOffData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleExport = () => {
    if (!requests || requests.length === 0) {
      alert('No data available to export.');
      return;
    }

    let headers = [];
    let rows = [];

    if (activeTab === 'earned') {
      headers = ['Date Earned', 'Reason', 'Hours Worked', 'Comp-Off Earned (Days)', 'Expiry Date', 'Issued By', 'Status'];
      rows = requests.map(req => [
        `"${formatDate(req.workedOn)}"`,
        `"${(req.reason || '').replace(/"/g, '""')}"`,
        req.hoursWorked,
        req.daysCredited,
        `"${formatDate(req.expiryDate)}"`,
        `"${req.issuedBy || req.approverName || 'N/A'}"`,
        `"${req.status}"`
      ]);
    } else if (activeTab === 'requests') {
      headers = ['Request ID', 'Date Worked', 'Reason', 'Hours Worked', 'Comp-Off Earned (Days)', 'Expiry Date', 'Issued By', 'Status', 'Applied On'];
      rows = requests.map(req => [
        `"${req.displayId || req.id}"`,
        `"${formatDate(req.workedOn)}"`,
        `"${(req.reason || '').replace(/"/g, '""')}"`,
        req.hoursWorked,
        req.daysCredited,
        `"${formatDate(req.expiryDate)}"`,
        `"${req.issuedBy || req.approverName || 'N/A'}"`,
        `"${req.status}"`,
        `"${formatDateTime(req.createdAt)}"`
      ]);
    } else {
      alert('No exportable data in Usage History.');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comp_off_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Comp-Off Dashboard...</p>
      </div>
    );
  }

  const getApproverInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardLayout
      title="Comp-Off"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Comp-Off' }]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}

      {/* Summary Cards */}
      <div className="comp-off-summary-row">
        <StatCard
          icon={CoffeeIcon}
          iconClass="icon-green"
          label="Comp-Off Earned"
          value={`${summary?.earned ?? 0} Days`}
          sublabel="This Year"
        />
        <StatCard
          icon={CalendarIcon}
          iconClass="icon-blue"
          label="Comp-Off Avail Balance"
          value={`${summary?.availableBalance ?? 0} Days`}
          sublabel={`As on ${summary?.asOnDate || formatDate(new Date())}`}
        />
        <StatCard
          icon={ClockIcon}
          iconClass="icon-amber"
          label="Comp-Off Used"
          value={`${summary?.used ?? 0} Days`}
          sublabel="This Year"
        />
      </div>

      {/* Information Banner */}
      <div className="comp-off-info-banner">
        <InfoIcon width={16} height={16} />
        <span>Comp-Off credits are granted and managed by your manager based on your work on weekends or holidays.</span>
      </div>

      {/* Main Content Area */}
      <div className="comp-off-main-content">
        {/* Left Side - Table and Tabs */}
        <div className="comp-off-table-section">
          {/* Tab Navigation */}
          <div className="comp-off-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`comp-off-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="comp-off-action-bar">
            <h3>{activeTab === 'earned' ? 'Comp-Off Earned History' : activeTab === 'requests' ? 'My Comp-Off Requests' : 'Comp-Off Usage History'}</h3>
            <button className="btn-export" onClick={handleExport} disabled={activeTab === 'usage'}>
              <DownloadIcon width={16} height={16} />
              Export
            </button>
          </div>

          {/* Table */}
          {activeTab === 'earned' && (
            <div className="comp-off-table-wrapper">
              <table className="comp-off-table">
                <thead>
                  <tr>
                    <th>Date Earned</th>
                    <th>Reason / Description</th>
                    <th>Hours Worked</th>
                    <th>Comp-Off Earned</th>
                    <th>Expiry Date</th>
                    <th>Issued By</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="comp-off-empty">
                        No comp-off earned history found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="comp-off-row">
                        <td className="date-earned">{formatDate(request.workedOn)}</td>
                        <td className="reason">{request.reason}</td>
                        <td className="hours-worked">{request.hoursWorked} hrs</td>
                        <td className="comp-off-earned">{request.daysCredited} Day</td>
                        <td className="expiry-date">{formatDate(request.expiryDate)}</td>
                        <td className="issued-by">
                          <div className="approver-info">
                            <div className="approver-avatar">{getApproverInitials(request.issuedBy || request.approverName)}</div>
                            <div className="approver-details">
                              <span className="approver-name">{request.issuedBy || request.approverName || 'N/A'}</span>
                              <span className="approver-role">{request.approverRole || ''}</span>
                            </div>
                          </div>
                        </td>
                        <td className="status">
                          {(() => {
                            const statusInfo = getCompOffStatus(request);
                            return (
                              <span 
                                className="comp-off-status-badge"
                                style={{
                                  backgroundColor: statusInfo.bgColor,
                                  color: statusInfo.color,
                                  border: `1px solid ${statusInfo.borderColor}`
                                }}
                              >
                                {statusInfo.label}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {requests.length > 0 && (
                <div className="comp-off-pagination">
                  <div className="pagination-info">
                    Showing 1 to {requests.length} of {requests.length} entries
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" disabled>&laquo;</button>
                    <button className="pagination-btn" disabled>&lsaquo;</button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn" disabled>&rsaquo;</button>
                    <button className="pagination-btn" disabled>&raquo;</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="comp-off-table-wrapper">
              <table className="comp-off-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Date Worked</th>
                    <th>Reason</th>
                    <th>Hours Worked</th>
                    <th>Comp-Off Earned</th>
                    <th>Expiry Date</th>
                    <th>Issued By</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="comp-off-empty">
                        No comp-off requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="comp-off-row">
                        <td className="request-id">{request.displayId || request.id}</td>
                        <td className="date-worked">{formatDate(request.workedOn)}</td>
                        <td className="reason">{request.reason}</td>
                        <td className="hours-worked">{request.hoursWorked} hrs</td>
                        <td className="comp-off-earned">{request.daysCredited} Day</td>
                        <td className="expiry-date">{formatDate(request.expiryDate)}</td>
                        <td className="issued-by">
                          <div className="approver-info">
                            <div className="approver-avatar">{getApproverInitials(request.issuedBy || request.approverName)}</div>
                            <div className="approver-details">
                              <span className="approver-name">{request.issuedBy || request.approverName || 'N/A'}</span>
                              <span className="approver-role">{request.approverRole || ''}</span>
                            </div>
                          </div>
                        </td>
                        <td className="status">
                          {(() => {
                            const statusInfo = getCompOffStatus(request);
                            return (
                              <span 
                                className="comp-off-status-badge"
                                style={{
                                  backgroundColor: statusInfo.bgColor,
                                  color: statusInfo.color,
                                  border: `1px solid ${statusInfo.borderColor}`
                                }}
                              >
                                {statusInfo.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="applied-on">{formatDateTime(request.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {requests.length > 0 && (
                <div className="comp-off-pagination">
                  <div className="pagination-info">
                    Showing 1 to {requests.length} of {requests.length} entries
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" disabled>&laquo;</button>
                    <button className="pagination-btn" disabled>&lsaquo;</button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn" disabled>&rsaquo;</button>
                    <button className="pagination-btn" disabled>&raquo;</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="comp-off-table-wrapper">
              <div className="comp-off-empty">
                <AlertCircleIcon width={48} height={48} />
                <p>Comp-Off usage history will be available once you start availing your earned comp-off.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Widgets */}
        <div className="comp-off-widgets-section">
          <div className="comp-off-rules-widget">
            <h3>Comp-Off Rules</h3>
            <ul>
              {COMP_OFF_RULES.map((rule, index) => (
                <li key={index}>
                  <CheckCircleIcon width={15} height={15} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="comp-off-notes-widget">
            <h3>Important Notes</h3>
            <ul>
              {IMPORTANT_NOTES.map((note, index) => (
                <li key={index}>
                  <AlertCircleIcon width={15} height={15} />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompOff;