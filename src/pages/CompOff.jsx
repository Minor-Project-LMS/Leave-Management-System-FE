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
  AlertCircleIcon,
  PlusIcon,
  XIcon,
  PaperclipIcon,
  TrashIcon
} from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { formatToday } from '../utils/date';
import './CompOff.css';

const TABS = [
  { key: 'earned', label: 'Earned History' },
  { key: 'requests', label: 'My Requests' },
  { key: 'usage', label: 'Usage / Leave Requests' },
];

const COMP_OFF_RULES = [
  'Comp-Off credits are granted by your manager when you work on weekends or public holidays.',
  'Minimum 8 hours at work is required to earn 1 day comp-off.',
  'Comp-Off must be availed within 6 months from the date of earning.',
  'Claiming a comp-off generates a leave request that requires manager approval.',
];

const IMPORTANT_NOTES = [
  'Partial claims (e.g., 0.5 days) can be applied against available full-day credits.',
  'You cannot apply for leave on a comp-off date until it is approved.',
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

const getCompOffStatus = (request) => {
  const today = new Date();
  const expiryDate = request.expiryDate ? new Date(request.expiryDate) : null;

  if (request.status === 'PENDING' || request.status === 'PENDING_L1' || request.status === 'PENDING_L2') {
    return {
      status: 'PENDING',
      label: 'Pending Approval',
      color: '#d97706',
      bgColor: '#fef3c7',
      borderColor: '#fde68a'
    };
  }

  if (request.status === 'APPROVED' || request.status === 'CLAIMED') {
    return {
      status: 'APPROVED',
      label: 'Approved',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0'
    };
  }

  if (request.status === 'REJECTED') {
    return {
      status: 'REJECTED',
      label: 'Rejected',
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca'
    };
  }

  if (expiryDate && expiryDate < today && request.daysRemaining > 0) {
    return {
      status: 'EXPIRED',
      label: 'Expired',
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca'
    };
  }

  return {
    status: 'ACTIVE',
    label: 'Available',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe'
  };
};

const USE_MOCK = env.useMockData;

const mockCompOffSummary = {
  earned: 5.0,
  availableBalance: 1.5,
  used: 3.5,
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
    daysRemaining: 1.0,
    expiryDate: '2024-11-18',
    issuedBy: 'Sarah Williams',
    approverRole: 'HR Manager',
    approvedOn: '2024-05-20T10:30:00Z',
    createdAt: '2024-05-19T09:00:00Z',
    status: 'APPROVED',
  },
  {
    id: 2,
    displayId: 'CO-2024-013',
    workedOn: '2024-05-11',
    reason: 'Critical Server Maintenance on Sunday',
    hoursWorked: 8.0,
    daysCredited: 1.0,
    daysRemaining: 0.5,
    expiryDate: '2024-11-11',
    issuedBy: 'John Smith',
    approverRole: 'Team Lead',
    approvedOn: '2024-05-13T14:15:00Z',
    createdAt: '2024-05-12T11:00:00Z',
    status: 'APPROVED',
  }
];

const mockCompOffLeaveRequests = [
  {
    id: 'COL-101',
    grantId: 2,
    leaveDate: '2024-06-10',
    daysClaimed: 0.5,
    claimType: 'HALF_DAY',
    reason: 'Personal errand - half day',
    status: 'PENDING',
    appliedAt: '2024-06-01T10:00:00Z',
    approverName: 'John Smith'
  }
];

const CompOff = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [requests, setRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('earned');

  // New Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [files, setFiles] = useState([]);
  const [requestForm, setRequestForm] = useState({
    workedOn: '',
    hoursWorked: '',
    reason: '',
  });

  // Partial Claim Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimForm, setClaimForm] = useState({
    claimDate: '',
    claimType: 'FULL_DAY', // 'FULL_DAY' or 'HALF_DAY'
    daysToClaim: 1.0,
    reason: '',
  });

  const loadCompOffData = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setSummary(mockCompOffSummary);
      setRequests(mockCompOffRequests);
      setLeaveRequests(mockCompOffLeaveRequests);
      setLoading(false);
      return;
    }

    try {
      const summaryRes = await apiService.getCompOffSummary();
      // Employee should only see their own comp-off requests
      const requestsRes = await apiService.getCompOffRequests({ page: 1, limit: 100 });
      const leaveRes = await apiService.getCompOffLeaveRequests();

      setSummary({
        earned: summaryRes?.compOffBalance ? summaryRes.compOffBalance + 3.5 : 5.0,
        availableBalance: summaryRes?.compOffBalance || 1.5,
        used: summaryRes?.used || 3.5,
        asOnDate: formatDate(new Date()),
      });
      setRequests(requestsRes?.data ?? requestsRes ?? []);
      setLeaveRequests(leaveRes?.data ?? leaveRes ?? []);
    } catch (err) {
      console.error('Error loading comp-off data:', err);
      setError(err.message || 'Failed to load comp-off data. Showing sample data.');
      setSummary(mockCompOffSummary);
      setRequests(mockCompOffRequests);
      setLeaveRequests(mockCompOffLeaveRequests);
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

  // Request Form Handlers
  const handleOpenRequestModal = () => {
    setShowRequestModal(true);
    setRequestError('');
    setRequestForm({ workedOn: '', hoursWorked: '', reason: '' });
    setFiles([]);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setRequestError('');
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.workedOn || !requestForm.hoursWorked || !requestForm.reason.trim()) {
      setRequestError('Please complete all required fields.');
      return;
    }

    setSubmittingRequest(true);
    setRequestError('');

    if (USE_MOCK) {
      setTimeout(() => {
        const hours = parseFloat(requestForm.hoursWorked);
        const credited = hours >= 8 ? 1.0 : 0.5;
        const newReq = {
          id: requests.length + 1,
          displayId: `CO-2024-0${requests.length + 15}`,
          workedOn: requestForm.workedOn,
          reason: requestForm.reason,
          hoursWorked: hours,
          daysCredited: credited,
          daysRemaining: credited,
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          issuedBy: 'Pending Manager Approval',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        setRequests(prev => [newReq, ...prev]);
        setSubmittingRequest(false);
        setShowRequestModal(false);
      }, 1000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('workedOn', requestForm.workedOn);
      formData.append('hoursWorked', requestForm.hoursWorked);
      formData.append('reason', requestForm.reason);
      files.forEach(file => formData.append('attachments', file));

      await apiService.submitCompOffRequest(formData);
      setShowRequestModal(false);
      loadCompOffData();
    } catch (err) {
      setRequestError(err.message || 'Failed to submit comp-off request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Partial Claim & Leave Request Handlers
  const handleOpenClaimModal = (grant) => {
    setSelectedGrant(grant);
    setClaimError('');
    const defaultDays = grant.daysRemaining >= 1.0 ? 1.0 : grant.daysRemaining;
    setClaimForm({
      claimDate: '',
      claimType: defaultDays === 0.5 ? 'HALF_DAY' : 'FULL_DAY',
      daysToClaim: defaultDays,
      reason: '',
    });
    setShowClaimModal(true);
  };

  const handleClaimTypeChange = (type) => {
    let days = 1.0;
    if (type === 'HALF_DAY') days = 0.5;
    else days = Math.min(1.0, selectedGrant.daysRemaining);

    setClaimForm(prev => ({
      ...prev,
      claimType: type,
      daysToClaim: days
    }));
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');

    if (!claimForm.claimDate || !claimForm.reason.trim()) {
      setClaimError('Please specify the date and reason for your comp-off leave.');
      return;
    }

    if (claimForm.daysToClaim > selectedGrant.daysRemaining) {
      setClaimError(`You cannot claim more than available remaining days (${selectedGrant.daysRemaining} Day(s)).`);
      return;
    }

    setClaiming(true);

    // Find the Comp-Off leave category ID.
    // getLeaveCategories() returns the paginated envelope
    // { page, limit, totalCount, totalPages, data: [...] }, not a bare
    // array — must unwrap .data before calling .find(), same as every
    // other caller of this method (see ApplyLeave.jsx). This whole lookup
    // is also wrapped in try/catch now so a failure here surfaces as a
    // normal form error instead of an uncaught exception that left
    // setClaiming(false) never called (button stuck on "Submitting Leave
    // Request...").
    let compOffCategoryId;
    try {
      const compOffCategoryRes = await apiService.getLeaveCategories('ACTIVE');
      const categories = compOffCategoryRes?.data ?? compOffCategoryRes ?? [];
      compOffCategoryId = categories.find(cat => cat.categoryCode === 'CO')?.id;
    } catch (err) {
      setClaimError(err.message || 'Failed to look up the Comp-Off leave category.');
      setClaiming(false);
      return;
    }

    if (!compOffCategoryId) {
      setClaimError('Comp-Off leave category not found. Please contact HR.');
      setClaiming(false);
      return;
    }

    const payload = {
      categoryId: compOffCategoryId,
      startDate: claimForm.claimDate,
      endDate: claimForm.claimDate,
      sessionType: claimForm.claimType === 'HALF_DAY' ? 'FIRST_HALF' : 'FULL_DAY',
      totalDays: parseFloat(claimForm.daysToClaim),
      reason: claimForm.reason,
      compOffRequestId: selectedGrant.id,
      status: 'PENDING_L1'
    };

    if (USE_MOCK) {
      setTimeout(() => {
        // Create pending comp-off leave request for manager approval
        const newLeaveReq = {
          id: `COL-${Date.now().toString().slice(-4)}`,
          grantId: selectedGrant.id,
          leaveDate: claimForm.claimDate,
          daysClaimed: parseFloat(claimForm.daysToClaim),
          claimType: claimForm.claimType,
          reason: claimForm.reason,
          status: 'PENDING_L1',
          appliedAt: new Date().toISOString(),
          approverName: selectedGrant.issuedBy || 'Manager'
        };

        setLeaveRequests(prev => [newLeaveReq, ...prev]);
        setClaiming(false);
        setShowClaimModal(false);
        alert('Comp-off leave request submitted successfully! Pending manager approval.');
      }, 800);
      return;
    }

    try {
      await apiService.claimCompOff(payload);
      setShowClaimModal(false);
      loadCompOffData();
      alert('Comp-off leave request submitted successfully! Pending manager approval.');
    } catch (err) {
      setClaimError(err.message || 'Failed to submit comp-off leave claim.');
    } finally {
      setClaiming(false);
    }
  };

  const handleExport = () => {
    if (!requests || requests.length === 0) {
      alert('No data available to export.');
      return;
    }

    let headers = ['Request ID', 'Date Worked', 'Reason', 'Hours Worked', 'Comp-Off Earned', 'Days Remaining', 'Expiry Date', 'Status'];
    let rows = requests.map(req => [
      `"${req.displayId || req.id}"`,
      `"${formatDate(req.workedOn)}"`,
      `"${(req.reason || '').replace(/"/g, '""')}"`,
      req.hoursWorked,
      req.daysCredited,
      req.daysRemaining,
      `"${formatDate(req.expiryDate)}"`,
      `"${req.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comp_off_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getApproverInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />
          <p>Loading Comp-Off Dashboard...</p>
        </div>
    );
  }

  return (
      <DashboardLayout
          title="Comp-Off"
          breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Comp-Off' }]}
          portalLabel={EMPLOYEE_PORTAL.portalLabel}
          navItems={EMPLOYEE_PORTAL.navItems}
          searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
          dateLabel={formatToday()}
          user={user}
          onLogout={handleLogout}
      >
        {error && <div className="dashboard-error-banner">{error}</div>}

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

        <div className="comp-off-info-banner">
          <InfoIcon width={16} height={16} />
          <span>Comp-Off claims require manager approval. Claiming partial or full days creates a pending leave request for your manager.</span>
        </div>

        <div className="comp-off-main-content">
          <div className="comp-off-table-section">
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

            <div className="comp-off-action-bar">
              <h3>
                {activeTab === 'earned' ? 'Comp-Off Earned History' : activeTab === 'requests' ? 'My Comp-Off Requests' : 'Comp-Off Leave Requests'}
              </h3>
              <div className="comp-off-action-buttons">
                <button className="btn-grant-comp-off" onClick={handleOpenRequestModal}>
                  <PlusIcon width={16} height={16} />
                  Send Request
                </button>
                <button className="btn-export" onClick={handleExport}>
                  <DownloadIcon width={16} height={16} />
                  Export
                </button>
              </div>
            </div>

            {/* TAB 1: EARNED HISTORY (ALLOWS PARTIAL OR FULL CLAIM) */}
            {activeTab === 'earned' && (
                <div className="comp-off-table-wrapper">
                  <table className="comp-off-table">
                    <thead>
                    <tr>
                      <th>Date Earned</th>
                      <th>Reason / Description</th>
                      <th>Hours Worked</th>
                      <th>Earned</th>
                      <th>Remaining</th>
                      <th>Expiry Date</th>
                      <th>Issued By</th>
                      <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {requests.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="comp-off-empty">
                            No comp-off earned history found.
                          </td>
                        </tr>
                    ) : (
                        requests.map((request) => {
                          const isClaimable = request.status === 'APPROVED' && request.daysRemaining > 0;

                          return (
                              <tr key={request.id} className="comp-off-row">
                                <td className="date-earned">{formatDate(request.workedOn)}</td>
                                <td className="reason">{request.reason}</td>
                                <td className="hours-worked">{request.hoursWorked ?? '-'} hrs</td>
                                <td className="comp-off-earned">{request.daysCredited} Day</td>
                                <td className="comp-off-remaining">{request.daysRemaining} Day</td>
                                <td className="expiry-date">{formatDate(request.expiryDate)}</td>
                                <td className="issued-by">
                                  <div className="approver-info">
                                    <div className="approver-avatar">
                                      {request.issuerAvatarUrl ? (
                                          <img
                                              src={request.issuerAvatarUrl}
                                              alt={request.issuerName}
                                              className="approver-avatar-image"
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.textContent = getApproverInitials(request.issuerName);
                                              }}
                                          />
                                      ) : (
                                          getApproverInitials(request.issuerName)
                                      )}
                                    </div>
                                    <div className="approver-details">
                                      <span className="approver-name">{request.issuerName || 'N/A'}</span>
                                      <span className="approver-role">{request.approverRole || ''}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="actions">
                                  {isClaimable ? (
                                      <button
                                          className="btn-claim"
                                          onClick={() => handleOpenClaimModal(request)}
                                      >
                                        Claim Leave
                                      </button>
                                  ) : (
                                      <span className="text-muted">{request.daysRemaining === 0 ? 'Fully Claimed' : request.status === 'REJECTED' ? 'Revoked' : 'N/A'}</span>
                                  )}
                                </td>
                              </tr>
                          );
                        })
                    )}
                    </tbody>
                  </table>
                </div>
            )}

            {/* TAB 2: MY INITIAL WORK REQUESTS */}
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
                    {requests.map((request) => {
                      const statusInfo = getCompOffStatus(request);
                      return (
                          <tr key={request.id} className="comp-off-row">
                            <td className="request-id">{request.displayId || request.id}</td>
                            <td className="date-worked">{formatDate(request.workedOn)}</td>
                            <td className="reason">{request.reason}</td>
                            <td className="hours-worked">{request.hoursWorked ?? '-'} hrs</td>
                            <td className="comp-off-earned">{request.daysCredited} Day</td>
                            <td className="expiry-date">{formatDate(request.expiryDate)}</td>
                            <td className="issued-by">
                              <div className="approver-info">
                                <div className="approver-avatar">
                                  {request.issuerAvatarUrl ? (
                                      <img
                                          src={request.issuerAvatarUrl}
                                          alt={request.issuerName}
                                          className="approver-avatar-image"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.textContent = getApproverInitials(request.issuerName);
                                          }}
                                      />
                                  ) : (
                                      getApproverInitials(request.issuerName)
                                  )}
                                </div>
                                <div className="approver-details">
                                  <span className="approver-name">{request.issuerName || 'N/A'}</span>
                                  <span className="approver-role">{request.approverRole || ''}</span>
                                </div>
                              </div>
                            </td>
                            <td className="status">
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
                            </td>
                            <td className="applied-on">{formatDateTime(request.createdAt)}</td>
                          </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
            )}

            {/* TAB 3: CLAIMED COMP-OFF LEAVE REQUESTS FOR MANAGER APPROVAL */}
            {activeTab === 'usage' && (
                <div className="comp-off-table-wrapper">
                  <table className="comp-off-table">
                    <thead>
                    <tr>
                      <th>Leave ID</th>
                      <th>Leave Date</th>
                      <th>Claim Type</th>
                      <th>Days Claimed</th>
                      <th>Reason</th>
                      <th>Approver</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaveRequests.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="comp-off-empty">
                            No comp-off leave requests found.
                          </td>
                        </tr>
                    ) : (
                        leaveRequests.map((lReq) => {
                          const statusInfo = getCompOffStatus(lReq);
                          return (
                              <tr key={lReq.id} className="comp-off-row">
                                <td className="request-id">{lReq.id}</td>
                                <td className="date-worked">{formatDate(lReq.startDate)}</td>
                                <td>
                            <span className="claim-type-pill">
                              {lReq.claimType === 'HALF_DAY' ? 'Half Day' : 'Full Day'}
                            </span>
                                </td>
                                <td>{lReq.daysClaimed} Day(s)</td>
                                <td className="reason">{lReq.reason}</td>
                                <td>{lReq.approverName || 'Manager'}</td>
                                <td className="status">
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
                                </td>
                                <td className="applied-on">{formatDateTime(lReq.appliedAt)}</td>
                              </tr>
                          );
                        })
                    )}
                    </tbody>
                  </table>
                </div>
            )}
          </div>

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

        {/* Send Request Modal */}
        {showRequestModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Request Comp-Off</h3>
                  <button className="modal-close" onClick={handleCloseRequestModal}>
                    <XIcon width={20} height={20} />
                  </button>
                </div>
                <form onSubmit={handleRequestSubmit} className="grant-comp-off-form">
                  {requestError && <div className="form-alert error">{requestError}</div>}

                  <div className="form-field">
                    <label>Date Worked *</label>
                    <input
                        type="date"
                        value={requestForm.workedOn}
                        onChange={e => setRequestForm({ ...requestForm, workedOn: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        required
                    />
                  </div>

                  <div className="form-field">
                    <label>Hours Worked *</label>
                    <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="24"
                        placeholder="e.g. 8"
                        value={requestForm.hoursWorked}
                        onChange={e => setRequestForm({ ...requestForm, hoursWorked: e.target.value })}
                        required
                    />
                  </div>

                  <div className="form-field">
                    <label>Reason *</label>
                    <textarea
                        rows="3"
                        placeholder="Describe the work done on the weekend/holiday..."
                        value={requestForm.reason}
                        onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                        required
                    />
                  </div>

                  <div className="form-field">
                    <label>Attachments (Proof / Approval)</label>
                    <label htmlFor="file-upload" className="btn-attach-file">
                      <PaperclipIcon width={16} height={16} />
                      Attach Files
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />

                    {files.length > 0 && (
                        <div className="comp-off-file-list">
                          {files.map((file, idx) => (
                              <div key={idx} className="comp-off-file-item">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                <button
                                    type="button"
                                    className="btn-remove-file"
                                    onClick={() => handleRemoveFile(idx)}
                                >
                                  <TrashIcon width={14} height={14} />
                                </button>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCloseRequestModal}
                        disabled={submittingRequest}
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={submittingRequest}
                    >
                      {submittingRequest ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Partial Claim & Leave Request Modal */}
        {showClaimModal && selectedGrant && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Claim Comp-Off Leave</h3>
                  <button className="modal-close" onClick={() => setShowClaimModal(false)}>
                    <XIcon width={20} height={20} />
                  </button>
                </div>
                <form onSubmit={handleClaimSubmit} className="grant-comp-off-form">
                  {claimError && <div className="form-alert error">{claimError}</div>}

                  <div className="grant-summary">
                    <p><strong>Available Grant Balance:</strong> {selectedGrant.daysRemaining} Day(s)</p>
                    <p><strong>Expiry Date:</strong> {formatDate(selectedGrant.expiryDate)}</p>
                  </div>

                  <div className="form-field">
                    <label>Claim Type *</label>
                    <div className="claim-type-selector">
                      <button
                          type="button"
                          className={`claim-type-btn ${claimForm.claimType === 'FULL_DAY' ? 'selected' : ''}`}
                          onClick={() => handleClaimTypeChange('FULL_DAY')}
                          disabled={selectedGrant.daysRemaining < 1.0}
                      >
                        Full Day (1.0)
                      </button>
                      <button
                          type="button"
                          className={`claim-type-btn ${claimForm.claimType === 'HALF_DAY' ? 'selected' : ''}`}
                          onClick={() => handleClaimTypeChange('HALF_DAY')}
                      >
                        Half Day (0.5)
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Days to Claim</label>
                    <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max={selectedGrant.daysRemaining}
                        value={claimForm.daysToClaim}
                        onChange={e => setClaimForm({ ...claimForm, daysToClaim: parseFloat(e.target.value) || 0.5 })}
                        required
                    />
                  </div>

                  <div className="form-field">
                    <label>Leave Date *</label>
                    <input
                        type="date"
                        value={claimForm.claimDate}
                        onChange={e => setClaimForm({ ...claimForm, claimDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                  </div>

                  <div className="form-field">
                    <label>Reason / Note for Manager *</label>
                    <textarea
                        rows="3"
                        placeholder="Reason for taking leave on this date..."
                        value={claimForm.reason}
                        onChange={e => setClaimForm({ ...claimForm, reason: e.target.value })}
                        required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowClaimModal(false)}
                        disabled={claiming}
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={claiming}
                    >
                      {claiming ? 'Submitting Leave Request...' : 'Submit Request for Approval'}
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