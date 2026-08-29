import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import { CalendarIcon, ClockIcon, HourglassIcon, CoffeeIcon, DownloadIcon, PlusIcon, InfoIcon, CheckCircleIcon, AlertCircleIcon, XIcon } from '../components/icons/Icons';
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
  'Comp-Off can be earned by working on weekends or public holidays.',
  'Minimum 8 hours at work is required to earn 1 day comp-off.',
  'Comp-Off must be availed within 6 months from the date of earning.',
  'Comp-Off is subject to manager and HR approval.',
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
  pendingApproval: 0.0,
  asOnDate: '24 May 2024',
};

const mockCompOffRequests = [
  {
    id: 1,
    displayId: 'CO-2024-014',
    workedOn: '2024-05-18',
    reason: 'Worked on Weekend Project Release',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    status: 'APPROVED',
    approverName: 'Sarah Williams',
    approverRole: 'HR Manager',
    approvedOn: '2024-05-20T10:30:00Z',
    createdAt: '2024-05-19T09:00:00Z',
  },
  {
    id: 2,
    displayId: 'CO-2024-013',
    workedOn: '2024-05-11',
    reason: 'Critical Server Maintenance on Sunday',
    hoursWorked: 6.0,
    daysCredited: 0.75,
    status: 'APPROVED',
    approverName: 'John Smith',
    approverRole: 'Team Lead',
    approvedOn: '2024-05-13T14:15:00Z',
    createdAt: '2024-05-12T11:00:00Z',
  },
  {
    id: 3,
    displayId: 'CO-2024-012',
    workedOn: '2024-05-04',
    reason: 'Holiday Weekend Support',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    status: 'APPROVED',
    approverName: 'Sarah Williams',
    approverRole: 'HR Manager',
    approvedOn: '2024-05-06T09:45:00Z',
    createdAt: '2024-05-05T08:30:00Z',
  },
  {
    id: 4,
    displayId: 'CO-2024-011',
    workedOn: '2024-04-27',
    reason: 'Emergency Production Fix',
    hoursWorked: 4.0,
    daysCredited: 0.5,
    status: 'APPROVED',
    approverName: 'John Smith',
    approverRole: 'Team Lead',
    approvedOn: '2024-04-29T16:20:00Z',
    createdAt: '2024-04-28T12:00:00Z',
  },
  {
    id: 5,
    displayId: 'CO-2024-010',
    workedOn: '2024-04-20',
    reason: 'Weekend Client Deployment',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    status: 'APPROVED',
    approverName: 'Sarah Williams',
    approverRole: 'HR Manager',
    approvedOn: '2024-04-22T11:00:00Z',
    createdAt: '2024-04-21T09:15:00Z',
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
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [formData, setFormData] = useState({
    workedOn: '',
    reason: '',
    hoursWorked: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      // In a real implementation, we'd call a dedicated comp-off summary endpoint
      // For now, we'll use the dashboard summary which includes compOffBalance
      const summaryRes = await apiService.getCompOffSummary();
      const requestsRes = await apiService.getCompOffRequests({ page: 1, limit: 100 });

      // Transform the summary data
      const compOffSummary = {
        earned: summaryRes?.compOffBalance ? summaryRes.compOffBalance + 4.0 : 5.0, // Mock calculation
        availableBalance: summaryRes?.compOffBalance || 1.0,
        used: 4.0, // This would come from the API
        pendingApproval: 0.0, // This would come from the API
        asOnDate: formatDate(new Date()),
      };

      setSummary(compOffSummary);
      setRequests(requestsRes?.data ?? requestsRes ?? []);
    } catch (err) {
      console.error('Error loading comp-off data:', err);
      setError(err.message || 'Failed to load comp-off data. Using sample data for demonstration.');
      // Fallback to mock data
      setSummary(mockCompOffSummary);
      setRequests(mockCompOffRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompOffData();
  }, [loadCompOffData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting comp-off data...');
  };

  const handleRequestModalOpen = () => {
    setShowRequestModal(true);
    setFormData({ workedOn: '', reason: '', hoursWorked: '' });
    setFormError('');
  };

  const handleRequestModalClose = () => {
    setShowRequestModal(false);
    setFormData({ workedOn: '', reason: '', hoursWorked: '' });
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.workedOn) {
      setFormError('Please select the date you worked.');
      return;
    }
    if (!formData.reason.trim()) {
      setFormError('Please provide a reason for the comp-off request.');
      return;
    }
    if (!formData.hoursWorked || parseFloat(formData.hoursWorked) <= 0) {
      setFormError('Please enter valid hours worked.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        workedOn: formData.workedOn,
        reason: formData.reason.trim(),
        hoursWorked: parseFloat(formData.hoursWorked),
      };

      if (USE_MOCK) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Mock comp-off request submitted:', payload);
      } else {
        await apiService.submitCompOffRequest(payload);
      }

      handleRequestModalClose();
      loadCompOffData(); // Reload data to show the new request
    } catch (err) {
      console.error('Error submitting comp-off request:', err);
      setFormError(err.message || 'Failed to submit comp-off request. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
      {error && <div className="dashboard-error-banner">{error} - Showing sample data for demonstration.</div>}

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
        <StatCard
          icon={HourglassIcon}
          iconClass="icon-purple"
          label="Comp-Off Pending Approval"
          value={`${summary?.pendingApproval ?? 0} Days`}
          sublabel="Awaiting Approval"
        />
      </div>

      {/* Information Banner */}
      <div className="comp-off-info-banner">
        <InfoIcon width={16} height={16} />
        <span>Comp-Off earned will be available after approval and as per company policy.</span>
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
            <button className="btn-export" onClick={handleExport}>
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
                    <th>Approved On</th>
                    <th>Approved By</th>
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
                        <td className="approved-on">{formatDateTime(request.approvedOn)}</td>
                        <td className="approved-by">
                          <div className="approver-info">
                            <div className="approver-avatar">{getApproverInitials(request.approverName)}</div>
                            <div className="approver-details">
                              <span className="approver-name">{request.approverName}</span>
                              <span className="approver-role">{request.approverRole}</span>
                            </div>
                          </div>
                        </td>
                        <td className="status">
                          <StatusBadge status={request.status === 'APPROVED' ? 'Approved' : request.status === 'PENDING' ? 'Pending' : request.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {requests.length > 0 && (
                <div className="comp-off-pagination">
                  <div className="pagination-info">
                    Showing 1 to {requests.length} of {requests.length} entries
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" disabled>
                      &laquo;
                    </button>
                    <button className="pagination-btn" disabled>
                      &lsaquo;
                    </button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn" disabled>
                      &rsaquo;
                    </button>
                    <button className="pagination-btn" disabled>
                      &raquo;
                    </button>
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
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="comp-off-empty">
                        No comp-off requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="comp-off-row">
                        <td className="request-id">{request.displayId}</td>
                        <td className="date-worked">{formatDate(request.workedOn)}</td>
                        <td className="reason">{request.reason}</td>
                        <td className="hours-worked">{request.hoursWorked} hrs</td>
                        <td className="comp-off-earned">{request.daysCredited} Day</td>
                        <td className="status">
                          <StatusBadge status={request.status === 'APPROVED' ? 'Approved' : request.status === 'PENDING' ? 'Pending' : request.status} />
                        </td>
                        <td className="applied-on">{formatDateTime(request.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {requests.length > 0 && (
                <div className="comp-off-pagination">
                  <div className="pagination-info">
                    Showing 1 to {requests.length} of {requests.length} entries
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-btn" disabled>
                      &laquo;
                    </button>
                    <button className="pagination-btn" disabled>
                      &lsaquo;
                    </button>
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn" disabled>
                      &rsaquo;
                    </button>
                    <button className="pagination-btn" disabled>
                      &raquo;
                    </button>
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
          {/* Request Comp-Off Widget */}
          <div className="comp-off-request-widget">
            <h3>Request Comp-Off</h3>
            <p>You can request to avail your earned comp-off.</p>
            <button className="btn-request-comp-off" onClick={handleRequestModalOpen}>
              <PlusIcon width={16} height={16} />
              Request Comp-Off
            </button>
          </div>

          {/* Comp-Off Rules Widget */}
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

          {/* Important Notes Widget */}
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

      {/* Request Comp-Off Modal */}
      {showRequestModal && (
        <div className="comp-off-modal-backdrop" onClick={handleRequestModalClose}>
          <div className="comp-off-modal" onClick={(e) => e.stopPropagation()}>
            <div className="comp-off-modal-header">
              <h3>Request Comp-Off</h3>
              <button onClick={handleRequestModalClose} aria-label="Close">
                <XIcon width={18} height={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="comp-off-modal-body">
                <div className="form-group">
                  <label htmlFor="workedOn">Date Worked *</label>
                  <input
                    type="date"
                    id="workedOn"
                    name="workedOn"
                    value={formData.workedOn}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hoursWorked">Hours Worked *</label>
                  <input
                    type="number"
                    id="hoursWorked"
                    name="hoursWorked"
                    value={formData.hoursWorked}
                    onChange={handleFormChange}
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="e.g., 8"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason / Description *</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    rows={4}
                    maxLength={2000}
                    placeholder="Please describe why you worked on this date..."
                    required
                  />
                </div>

                {formError && <div className="comp-off-modal-error">{formError}</div>}
              </div>

              <div className="comp-off-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleRequestModalClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompOff;