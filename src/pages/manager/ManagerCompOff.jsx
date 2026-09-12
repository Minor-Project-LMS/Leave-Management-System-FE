import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { 
  CoffeeIcon, 
  CalendarIcon, 
  ClockIcon, 
  DownloadIcon, 
  InfoIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  PlusIcon,
  XIcon
} from '../../components/icons/Icons';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MANAGER_PORTAL } from '../../config/navConfig';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { env } from '../../config/env';
import './ManagerCompOff.css';

const TABS = [
  { key: 'granted', label: 'Granted History' },
  { key: 'pending', label: 'Pending Requests' },
];

const COMP_OFF_RULES = [
  'Comp-Off credits are granted when employees work on weekends or public holidays.',
  'Minimum 8 hours at work is required to earn 1 day comp-off.',
  'Comp-Off must be availed within 6 months from the date of earning.',
  'You can grant comp-off to your team members based on their work records.',
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
  
  // Check if claimed/used
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

const USE_MOCK = env.useMockData;

const mockCompOffSummary = {
  totalGranted: 12.0,
  pendingRequests: 3,
  thisMonth: 2.0,
};

const mockCompOffRequests = [
  {
    id: 1,
    displayId: 'CO-2024-015',
    userId: 101,
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP0045',
    workedOn: '2024-05-18',
    reason: 'Worked on Weekend Project Release',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    expiryDate: '2024-11-18',
    grantedBy: 'Alex Johnson',
    status: 'APPROVED',
    createdAt: '2024-05-19T09:00:00Z',
    claimed: false,
  },
  {
    id: 2,
    displayId: 'CO-2024-014',
    userId: 102,
    employeeName: 'Rahul Verma',
    employeeCode: 'EMP0047',
    workedOn: '2024-05-11',
    reason: 'Critical Server Maintenance on Sunday',
    hoursWorked: 6.0,
    daysCredited: 0.75,
    expiryDate: '2024-11-11',
    grantedBy: 'Alex Johnson',
    status: 'APPROVED',
    createdAt: '2024-05-12T11:00:00Z',
    claimed: true,
  },
  {
    id: 3,
    displayId: 'CO-2024-013',
    userId: 103,
    employeeName: 'Sneha Patel',
    employeeCode: 'EMP0039',
    workedOn: '2024-05-04',
    reason: 'Holiday Weekend Support',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    expiryDate: '2024-11-04',
    grantedBy: 'Alex Johnson',
    status: 'PENDING',
    createdAt: '2024-05-05T08:30:00Z',
    claimed: false,
  },
  {
    id: 4,
    displayId: 'CO-2024-012',
    userId: 104,
    employeeName: 'Vikram Singh',
    employeeCode: 'EMP0031',
    workedOn: '2024-04-20',
    reason: 'Weekend Client Deployment',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    expiryDate: '2024-01-20', // Expired
    grantedBy: 'Alex Johnson',
    status: 'APPROVED',
    createdAt: '2024-04-21T09:15:00Z',
    claimed: false,
  },
];

const mockTeamMembers = [
  { id: 101, employeeCode: 'EMP0045', fullName: 'Priya Sharma', department: 'Product' },
  { id: 102, employeeCode: 'EMP0047', fullName: 'Rahul Verma', department: 'Engineering' },
  { id: 103, employeeCode: 'EMP0039', fullName: 'Sneha Patel', department: 'Design' },
  { id: 104, employeeCode: 'EMP0031', fullName: 'Vikram Singh', department: 'Product' },
  { id: 105, employeeCode: 'EMP0025', fullName: 'Anjali Mehta', department: 'QA' },
];

const ManagerCompOff = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('manager');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('granted');
  
  // Form state
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    workedOn: '',
    hoursWorked: '',
    daysCredited: '',
    expiryDate: '',
    reason: '',
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadCompOffData = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setSummary(mockCompOffSummary);
      setRequests(mockCompOffRequests);
      setTeamMembers(mockTeamMembers);
      setLoading(false);
      return;
    }

    try {
      // Load team members for the dropdown
      const membersRes = await apiService.getTeamMembers({ limit: 100 });
      setTeamMembers(membersRes?.data ?? membersRes ?? []);

      // Load comp-off requests
      const requestsRes = await apiService.getCompOffRequests({ page: 1, limit: 100 });
      setRequests(requestsRes?.data ?? requestsRes ?? []);

      // Calculate summary from requests
      const granted = requestsRes?.data?.filter(r => r.status === 'APPROVED')?.length || 0;
      const pending = requestsRes?.data?.filter(r => r.status === 'PENDING')?.length || 0;
      
      setSummary({
        totalGranted: granted,
        pendingRequests: pending,
        thisMonth: 0, // Would need date filtering
      });
    } catch (err) {
      console.error('Error loading comp-off data:', err);
      setError(err.message || 'Failed to load comp-off data. Showing sample data.');
      setSummary(mockCompOffSummary);
      setRequests(mockCompOffRequests);
      setTeamMembers(mockTeamMembers);
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
    if (!requests || requests.length === 0) {
      alert('No data available to export.');
      return;
    }

    let headers = [];
    let rows = [];

    if (activeTab === 'granted') {
      headers = ['Employee', 'Employee Code', 'Date Worked', 'Reason', 'Hours Worked', 'Comp-Off Earned (Days)', 'Expiry Date', 'Granted By', 'Status', 'Granted On'];
      rows = requests.filter(r => r.status === 'APPROVED').map(req => [
        `"${req.employeeName || 'N/A'}"`,
        `"${req.employeeCode || 'N/A'}"`,
        `"${formatDate(req.workedOn)}"`,
        `"${(req.reason || '').replace(/"/g, '""')}"`,
        req.hoursWorked,
        req.daysCredited,
        `"${formatDate(req.expiryDate)}"`,
        `"${req.grantedBy || user?.name || 'N/A'}"`,
        `"${req.status}"`,
        `"${formatDateTime(req.createdAt)}"`
      ]);
    } else if (activeTab === 'pending') {
      headers = ['Request ID', 'Employee', 'Employee Code', 'Date Worked', 'Reason', 'Hours Worked', 'Comp-Off Earned (Days)', 'Expiry Date', 'Requested On'];
      rows = requests.filter(r => r.status === 'PENDING').map(req => [
        `"${req.displayId || req.id}"`,
        `"${req.employeeName || 'N/A'}"`,
        `"${req.employeeCode || 'N/A'}"`,
        `"${formatDate(req.workedOn)}"`,
        `"${(req.reason || '').replace(/"/g, '""')}"`,
        req.hoursWorked,
        req.daysCredited,
        `"${formatDate(req.expiryDate)}"`,
        `"${formatDateTime(req.createdAt)}"`
      ]);
    } else {
      alert('No exportable data in this tab.');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manager_comp_off_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGrantFormOpen = () => {
    setShowGrantForm(true);
    setFormError('');
    setSuccessMessage('');
    setFormData({
      userId: '',
      workedOn: '',
      hoursWorked: '',
      daysCredited: '',
      expiryDate: '',
      reason: '',
    });
  };

  const handleGrantFormClose = () => {
    setShowGrantForm(false);
    setFormData({
      userId: '',
      workedOn: '',
      hoursWorked: '',
      daysCredited: '',
      expiryDate: '',
      reason: '',
    });
    setFormError('');
    setSuccessMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateGrantForm = () => {
    if (!formData.userId) {
      return 'Please select an employee.';
    }
    if (!formData.workedOn) {
      return 'Please select the date worked.';
    }
    if (!formData.hoursWorked || parseFloat(formData.hoursWorked) <= 0) {
      return 'Please enter valid hours worked.';
    }
    if (!formData.daysCredited || parseFloat(formData.daysCredited) <= 0) {
      return 'Please enter valid days to credit.';
    }
    if (!formData.expiryDate) {
      return 'Please select an expiry date.';
    }
    if (!formData.reason.trim()) {
      return 'Please provide a reason for granting comp-off.';
    }
    return '';
  };

  const handleGrantSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateGrantForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    if (USE_MOCK) {
      setTimeout(() => {
        setSubmitting(false);
        setSuccessMessage('Comp-Off granted successfully!');
        setTimeout(() => {
          handleGrantFormClose();
          loadCompOffData();
        }, 1500);
      }, 1000);
      return;
    }

    try {
      const payload = {
        userId: Number(formData.userId),
        workedOn: formData.workedOn,
        hoursWorked: parseFloat(formData.hoursWorked),
        daysCredited: parseFloat(formData.daysCredited),
        expiryDate: formData.expiryDate,
        reason: formData.reason.trim(),
      };

      await apiService.submitCompOffRequest(payload);
      
      setSuccessMessage('Comp-Off granted successfully!');
      setTimeout(() => {
        handleGrantFormClose();
        loadCompOffData();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to grant comp-off. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Comp-Off Management...</p>
      </div>
    );
  }

  const getFilteredRequests = () => {
    if (activeTab === 'granted') {
      return requests.filter(r => r.status === 'APPROVED');
    }
    return requests.filter(r => r.status === 'PENDING');
  };

  const getCompOffStatusForRequest = (request) => {
    return getCompOffStatus(request);
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardLayout
      title="Comp-Off Management"
      breadcrumbs={[{ label: 'Manager Dashboard', path: '/manager/dashboard' }, { label: 'Comp-Off Management' }]}
      portalLabel={MANAGER_PORTAL.portalLabel}
      navItems={MANAGER_PORTAL.navItems}
      searchPlaceholder={MANAGER_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}

      {/* Summary Cards */}
      <div className="comp-off-summary-row">
        <StatCard
          icon={CoffeeIcon}
          iconClass="icon-green"
          label="Total Comp-Off Granted"
          value={`${summary?.totalGranted ?? 0} Days`}
          sublabel="All Time"
        />
        <StatCard
          icon={ClockIcon}
          iconClass="icon-amber"
          label="Pending Requests"
          value={`${summary?.pendingRequests ?? 0}`}
          sublabel="Awaiting Action"
        />
        <StatCard
          icon={CalendarIcon}
          iconClass="icon-blue"
          label="This Month"
          value={`${summary?.thisMonth ?? 0} Days`}
          sublabel="Granted"
        />
      </div>

      {/* Information Banner */}
      <div className="comp-off-info-banner">
        <InfoIcon width={16} height={16} />
        <span>Grant comp-off credits to team members who worked on weekends or holidays.</span>
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
            <h3>{activeTab === 'granted' ? 'Comp-Off Granted History' : 'Pending Comp-Off Requests'}</h3>
            <div className="comp-off-action-buttons">
              <button className="btn-grant-comp-off" onClick={handleGrantFormOpen}>
                <PlusIcon width={16} height={16} />
                Grant Comp-Off
              </button>
              <button className="btn-export" onClick={handleExport}>
                <DownloadIcon width={16} height={16} />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="comp-off-table-wrapper">
            <table className="comp-off-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee Code</th>
                  <th>Date Worked</th>
                  <th>Reason</th>
                  <th>Hours Worked</th>
                  <th>Comp-Off Earned</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Granted On</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredRequests().length === 0 ? (
                  <tr>
                    <td colSpan="9" className="comp-off-empty">
                      No {activeTab === 'granted' ? 'granted comp-off' : 'pending requests'} found.
                    </td>
                  </tr>
                ) : (
                  getFilteredRequests().map((request) => (
                    <tr key={request.id} className="comp-off-row">
                      <td className="employee-name">
                        <div className="employee-info">
                          <div className="employee-avatar">{getInitials(request.employeeName)}</div>
                          <span>{request.employeeName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="employee-code">{request.employeeCode || 'N/A'}</td>
                      <td className="date-worked">{formatDate(request.workedOn)}</td>
                      <td className="reason">{request.reason}</td>
                      <td className="hours-worked">{request.hoursWorked} hrs</td>
                      <td className="comp-off-earned">{request.daysCredited} Day</td>
                      <td className="expiry-date">{formatDate(request.expiryDate)}</td>
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
                      <td className="granted-on">{formatDateTime(request.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {getFilteredRequests().length > 0 && (
              <div className="comp-off-pagination">
                <div className="pagination-info">
                  Showing 1 to {getFilteredRequests().length} of {getFilteredRequests().length} entries
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
        </div>
      </div>

      {/* Grant Comp-Off Modal */}
      {showGrantForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Grant Comp-Off</h3>
              <button className="modal-close" onClick={handleGrantFormClose}>
                <XIcon width={20} height={20} />
              </button>
            </div>
            
            <form onSubmit={handleGrantSubmit} className="grant-comp-off-form">
              {formError && (
                <div className="form-alert error">
                  {formError}
                </div>
              )}
              
              {successMessage && (
                <div className="form-alert success">
                  {successMessage}
                </div>
              )}

              <div className="form-field">
                <label>Employee *</label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName} ({member.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Date Worked *</label>
                <input
                  type="date"
                  name="workedOn"
                  value={formData.workedOn}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Hours Worked *</label>
                  <input
                    type="number"
                    name="hoursWorked"
                    value={formData.hoursWorked}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    required
                    placeholder="e.g., 8"
                  />
                </div>

                <div className="form-field">
                  <label>Days Credited *</label>
                  <input
                    type="number"
                    name="daysCredited"
                    value={formData.daysCredited}
                    onChange={handleInputChange}
                    step="0.25"
                    min="0"
                    required
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                  min={formData.workedOn || undefined}
                />
              </div>

              <div className="form-field">
                <label>Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  placeholder="Briefly describe why comp-off is being granted..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleGrantFormClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Granting...' : 'Grant Comp-Off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManagerCompOff;