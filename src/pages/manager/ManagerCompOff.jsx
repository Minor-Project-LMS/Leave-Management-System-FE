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
import { formatToday } from '../../utils/date';
import './ManagerCompOff.css';

const TABS = [
  { key: 'team', label: 'Team Grants' },
  { key: 'history', label: 'Grant History' },
];

const COMP_OFF_RULES = [
  'Comp-Off credits are granted when employees work on weekends or public holidays.',
  'Grants are immediately active - no approval workflow needed.',
  'Set explicit expiry dates for each grant - unclaimed days are forfeited on expiry.',
  'You can revoke remaining unclaimed balance, but already-claimed days remain valid.',
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

const getGrantStatusInfo = (grant) => {
  const today = new Date();
  const expiryDate = grant.expiryDate ? new Date(grant.expiryDate) : null;

  // Check if expired
  if (expiryDate && expiryDate < today) {
    return {
      status: 'EXPIRED',
      label: 'Expired',
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca'
    };
  }

  // Check if rejected
  if (grant.status === 'REJECTED') {
    return {
      status: 'REJECTED',
      label: 'Rejected',
      color: '#991b1b',
      bgColor: '#fef2f2',
      borderColor: '#fecaca'
    };
  }

  // Check if withdrawn
  if (grant.status === 'WITHDRAWN') {
    return {
      status: 'WITHDRAWN',
      label: 'Withdrawn',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db'
    };
  }

  // Check if pending
  if (grant.status === 'PENDING') {
    return {
      status: 'PENDING',
      label: 'Pending',
      color: '#d97706',
      bgColor: '#fef3c7',
      borderColor: '#fde68a'
    };
  }

  // Default to approved/active
  return {
    status: 'APPROVED',
    label: 'Approved',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  };
};

const USE_MOCK = env.useMockData;

const mockTeamSummary = {
  totalGrants: 12,
  activeBalance: 8.5,
  thisMonth: 2.0,
};

const mockCompOffGrants = [
  {
    requestId: 1,
    displayId: 'CO-2024-015',
    userId: 101,
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP0045',
    workedOn: '2024-05-18',
    reason: 'Worked on Weekend Project Release',
    hoursWorked: 8.0,
    grantedDays: 2.0,
    claimedDays: 0.0,
    remainingDays: 2.0,
    expiryDate: '2024-11-18',
    status: 'APPROVED',
    createdAt: '2024-05-19T09:00:00Z',
  },
  {
    requestId: 2,
    displayId: 'CO-2024-014',
    userId: 102,
    employeeName: 'Rahul Verma',
    employeeCode: 'EMP0047',
    workedOn: '2024-05-11',
    reason: 'Critical Server Maintenance on Sunday',
    hoursWorked: 6.0,
    grantedDays: 1.5,
    claimedDays: 1.0,
    remainingDays: 0.5,
    expiryDate: '2024-11-11',
    status: 'APPROVED',
    createdAt: '2024-05-12T11:00:00Z',
  },
  {
    requestId: 3,
    displayId: 'CO-2024-013',
    userId: 103,
    employeeName: 'Sneha Patel',
    employeeCode: 'EMP0039',
    workedOn: '2024-05-04',
    reason: 'Holiday Weekend Support',
    hoursWorked: 8.0,
    grantedDays: 1.0,
    claimedDays: 1.0,
    remainingDays: 0.0,
    expiryDate: '2024-11-04',
    status: 'APPROVED',
    createdAt: '2024-05-05T08:30:00Z',
  },
  {
    requestId: 4,
    displayId: 'CO-2024-012',
    userId: 104,
    employeeName: 'Vikram Singh',
    employeeCode: 'EMP0031',
    workedOn: '2024-04-20',
    reason: 'Weekend Client Deployment',
    hoursWorked: 8.0,
    grantedDays: 1.0,
    claimedDays: 0.0,
    remainingDays: 1.0,
    expiryDate: '2024-01-20', // Expired
    status: 'APPROVED',
    createdAt: '2024-04-21T09:15:00Z',
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
  const [grants, setGrants] = useState([]);
  const [activeTab, setActiveTab] = useState('team');

  // Form state
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [showConfirmGrant, setShowConfirmGrant] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    workedOn: '',
    hoursWorked: '',
    daysGranted: '',
    expiryDate: '',
    reason: '',
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Revoke state
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [grantToRevoke, setGrantToRevoke] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState('');

  // Grant detail view
  const [showGrantDetail, setShowGrantDetail] = useState(false);
  const [grantDetail, setGrantDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadCompOffData = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setSummary(mockTeamSummary);
      setGrants(mockCompOffGrants);
      setTeamMembers(mockTeamMembers);
      setLoading(false);
      return;
    }

    try {
      // Load team members for the dropdown
      const membersRes = await apiService.getTeamMembers({ limit: 100 });
      setTeamMembers(membersRes?.data ?? membersRes ?? []);

      // Load comp-off requests explicitly per team member via the
      // documented `userId` filter, then merge.
      //
      // The spec says an *unfiltered* GET /comp-off-requests should
      // already auto-scope to "manager's direct reports" for a Manager
      // caller — but in practice that's been observed to come back empty
      // even when grants exist for a report (confirmed: the same grant IS
      // visible when the employee queries their own comp-off requests, so
      // the data exists — it's the manager-side default scoping that
      // isn't applying). Rather than depend on that, we use the filter
      // the spec unambiguously documents (`userId`, "Manager/HR only") for
      // each team member and merge the results. This should be revisited
      // once the backend's default scoping for this endpoint is fixed —
      // at that point the per-member loop can be dropped in favor of a
      // single unfiltered call.
      const members = membersRes?.data ?? membersRes ?? [];
      const grantResults = await Promise.all(
          members.map(member =>
              apiService
                  .getCompOffRequests({ userId: member.id, limit: 100 })
                  .catch(() => null)
          )
      );
      const teamGrants = grantResults
          .filter(Boolean)
          .flatMap(res => res?.data ?? res ?? []);

      setGrants(teamGrants);

      // Calculate summary from team grants
      const totalGrants = teamGrants.length;
      const activeBalance = teamGrants
          .filter(g => g.status === 'APPROVED')
          .reduce((sum, g) => sum + ((g.daysRemaining || g.remainingDays || 0)), 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthGrants = teamGrants
          .filter(g => {
            const grantDate = new Date(g.createdAt);
            return grantDate.getMonth() === currentMonth && grantDate.getFullYear() === currentYear;
          })
          .reduce((sum, g) => sum + ((g.daysCredited ?? g.daysGranted ?? g.grantedDays ?? 0)), 0);

      setSummary({
        totalGrants,
        activeBalance,
        thisMonth: thisMonthGrants,
      });
    } catch (err) {
      console.error('Error loading comp-off data:', err);
      setError(err.message || 'Failed to load comp-off data. Showing sample data.');
      setSummary(mockTeamSummary);
      setGrants(mockCompOffGrants);
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
    if (!grants || grants.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Request ID', 'Employee', 'Date Worked', 'Reason', 'Hours Worked', 'Days Granted', 'Days Claimed', 'Days Remaining', 'Expiry Date', 'Status', 'Created At'];
    const rows = grants.map(grant => [
      `"${grant.displayId || grant.requestId || grant.id}"`,
      `"${grant.employeeName || grant.userName || 'N/A'}"`,
      `"${formatDate(grant.workedOn || grant.dateWorked)}"`,
      `"${(grant.reason || '').replace(/"/g, '""')}"`,
      grant.hoursWorked || 'N/A',
      grant.daysCredited ?? grant.daysGranted ?? grant.grantedDays ?? 'N/A',
      grant.daysClaimed || grant.claimedDays || 'N/A',
      grant.daysRemaining || grant.remainingDays || 'N/A',
      `"${formatDate(grant.expiryDate)}"`,
      `"${grant.status}"`,
      `"${formatDateTime(grant.createdAt)}"`
    ]);

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
      daysGranted: '',
      expiryDate: '',
      reason: '',
    });
  };

  const handleGrantFormClose = () => {
    setShowGrantForm(false);
    setShowConfirmGrant(false);
    setFormData({
      userId: '',
      workedOn: '',
      hoursWorked: '',
      daysGranted: '',
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
    if (!formData.daysGranted || parseFloat(formData.daysGranted) <= 0) {
      return 'Please enter valid days to grant.';
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

    // Show confirmation dialog
    setShowConfirmGrant(true);
  };

  const handleConfirmGrant = async () => {
    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    if (USE_MOCK) {
      setTimeout(() => {
        const newGrant = {
          requestId: mockCompOffGrants.length + 1,
          displayId: `CO-2024-${String(mockCompOffGrants.length + 1).padStart(3, '0')}`,
          userId: parseInt(formData.userId),
          employeeName: teamMembers.find(m => m.id === parseInt(formData.userId))?.fullName || 'Unknown',
          employeeCode: teamMembers.find(m => m.id === parseInt(formData.userId))?.employeeCode || 'N/A',
          workedOn: formData.workedOn,
          reason: formData.reason,
          hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : null,
          grantedDays: parseFloat(formData.daysGranted),
          claimedDays: 0.0,
          remainingDays: parseFloat(formData.daysGranted),
          expiryDate: formData.expiryDate,
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
        };

        setGrants(prev => [newGrant, ...prev]);
        setSummary(prev => ({
          ...prev,
          totalGrants: prev.totalGrants + 1,
          activeBalance: prev.activeBalance + parseFloat(formData.daysGranted),
          thisMonth: prev.thisMonth + parseFloat(formData.daysGranted),
        }));

        setSubmitting(false);
        setSuccessMessage('Comp-Off granted successfully!');
        setTimeout(() => {
          handleGrantFormClose();
        }, 1500);
      }, 1000);
      return;
    }

    try {
      // Field names must match the API's CompOffRequestInput exactly:
      // { userId, dateWorked, hoursWorked, expiryDate, notes }. The form
      // previously sent `workedOn` (backend expects `dateWorked`, a
      // *required* field, so it was missing from the request entirely)
      // and `reason` (backend expects `notes`). `daysGranted` isn't part
      // of the request schema at all — daysCredited is computed
      // server-side from hoursWorked via policy, so it's dropped here
      // rather than sent as a field the backend doesn't recognize.
      const payload = {
        userId: Number(formData.userId),
        dateWorked: formData.workedOn,
        hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : null,
        expiryDate: formData.expiryDate,
        notes: formData.reason.trim(),
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

  const handleRevokeClick = (grant) => {
    setGrantToRevoke(grant);
    setShowRevokeConfirm(true);
    setRevokeReason('');
  };

  const handleRevokeConfirm = async () => {
    if (!revokeReason.trim()) {
      alert('Please provide a reason for revoking this grant.');
      return;
    }

    setRevoking(true);

    if (USE_MOCK) {
      setTimeout(() => {
        const updatedGrants = grants.map(g =>
            (g.requestId || g.id) === (grantToRevoke.requestId || grantToRevoke.id)
                ? {
                  ...g,
                  status: 'REJECTED',
                  remainingDays: 0,
                  revokedAt: new Date().toISOString(),
                  revokedByName: user?.name,
                  revokeReason
                }
                : g
        );
        setGrants(updatedGrants);

        setSummary(prev => ({
          ...prev,
          activeBalance: prev.activeBalance - (grantToRevoke.remainingDays || grantToRevoke.daysRemaining || 0),
        }));

        setRevoking(false);
        setShowRevokeConfirm(false);
        setGrantToRevoke(null);
        setRevokeReason('');
      }, 1000);
      return;
    }

    try {
      const compId = grantToRevoke.requestId || grantToRevoke.id;
      await apiService.revokeCompOffGrant(compId);

      // Refresh grants + summary (reuses the same per-team-member fetch as initial load)
      await loadCompOffData();

      setRevoking(false);
      setShowRevokeConfirm(false);
      setGrantToRevoke(null);
      setRevokeReason('');
    } catch (err) {
      console.error('Error revoking grant:', err);
      alert(err.message || 'Failed to revoke grant. Please try again.');
      setRevoking(false);
    }
  };

  const handleGrantDetailOpen = async (grantId) => {
    setShowGrantDetail(true);
    setLoadingDetail(true);
    setGrantDetail(null);

    if (USE_MOCK) {
      const grant = mockCompOffGrants.find(g => g.requestId === grantId);
      setGrantDetail({
        ...grant,
        claims: [
          {
            claimId: 1,
            requestId: grantId,
            daysClaimed: 1.0,
            claimDate: '2024-06-01',
            status: 'ACTIVE',
            createdAt: '2024-06-01T10:00:00Z',
          }
        ],
        attachments: []
      });
      setLoadingDetail(false);
      return;
    }

    try {
      const detail = await apiService.getCompOffRequest(grantId);
      setGrantDetail(detail);
    } catch (err) {
      console.error('Error loading grant detail:', err);
      setError(err.message || 'Failed to load grant details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleGrantDetailClose = () => {
    setShowGrantDetail(false);
    setGrantDetail(null);
  };

  const getFilteredGrants = () => {
    if (activeTab === 'team') {
      return grants.filter(g => g.status === 'APPROVED')
          .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    }
    return grants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />
          <p>Loading Comp-Off Management...</p>
        </div>
    );
  }

  const filteredGrants = getFilteredGrants();
  const selectedEmployee = teamMembers.find(m => m.id === parseInt(formData.userId));

  return (
      <DashboardLayout
          title="Comp-Off Management"
          breadcrumbs={[{ label: 'Manager Dashboard', path: '/manager/dashboard' }, { label: 'Comp-Off Management' }]}
          portalLabel={MANAGER_PORTAL.portalLabel}
          navItems={MANAGER_PORTAL.navItems}
          searchPlaceholder={MANAGER_PORTAL.searchPlaceholder}
          dateLabel={formatToday()}
          user={user}
          onLogout={handleLogout}
      >
        {error && <div className="dashboard-error-banner">{error}</div>}

        {/* Summary Cards */}
        <div className="comp-off-summary-row">
          <StatCard
              icon={CoffeeIcon}
              iconClass="icon-green"
              label="Total Grants"
              value={`${summary?.totalGrants ?? 0}`}
              sublabel="All Time"
          />
          <StatCard
              icon={CalendarIcon}
              iconClass="icon-blue"
              label="Active Balance"
              value={`${summary?.activeBalance ?? 0} Days`}
              sublabel="Across Team"
          />
          <StatCard
              icon={ClockIcon}
              iconClass="icon-amber"
              label="This Month"
              value={`${summary?.thisMonth ?? 0} Days`}
              sublabel="Granted"
          />
        </div>

        {/* Information Banner */}
        <div className="comp-off-info-banner">
          <InfoIcon width={16} height={16} />
          <span>Grant comp-off credits to team members who worked on weekends or holidays</span>
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
              <h3>{activeTab === 'team' ? 'Team Comp-Off Grants' : 'Grant History'}</h3>
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
                  <th>Date Worked</th>
                  <th>Reason</th>
                  <th>Days Granted</th>
                  <th>Days Remaining</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Granted On</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredGrants.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="comp-off-empty">
                        No {activeTab === 'team' ? 'active team comp-off grants' : 'grant history'} found.
                      </td>
                    </tr>
                ) : (
                    filteredGrants.map((grant) => (
                        <tr key={grant.requestId || grant.id} className="comp-off-row">
                          <td className="employee-name">
                            <div className="employee-info">
                              <div className="employee-avatar">{getInitials(grant.employeeName || grant.userName)}</div>
                              <span>{grant.employeeName || grant.userName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="date-worked">{formatDate(grant.workedOn || grant.dateWorked)}</td>
                          <td className="reason">{grant.reason}</td>
                          <td className="days-granted">{grant.daysCredited ?? grant.grantedDays ?? grant.daysGranted ?? 0} Day</td>
                          <td className="days-remaining">
                        <span className={`days-remaining-value ${(grant.remainingDays || grant.daysRemaining || 0) > 0 ? 'positive' : 'zero'}`}>
                          {grant.remainingDays || grant.daysRemaining || 0} Day
                        </span>
                          </td>
                          <td className="expiry-date">{formatDate(grant.expiryDate)}</td>
                          <td className="status">
                            {(() => {
                              const statusInfo = getGrantStatusInfo(grant);
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
                          <td className="granted-on">{formatDateTime(grant.createdAt)}</td>
                          <td className="actions">
                            <div className="action-buttons">
                              {grant.status === 'APPROVED' && (
                                  <button
                                      className="btn-revoke"
                                      onClick={() => handleRevokeClick(grant)}
                                      title="Revoke remaining balance"
                                  >
                                    Revoke
                                  </button>
                              )}
                              <button
                                  className="btn-view-detail"
                                  onClick={() => handleGrantDetailOpen(grant.requestId || grant.id)}
                                  title="View details"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>

              {filteredGrants.length > 0 && (
                  <div className="comp-off-pagination">
                    <div className="pagination-info">
                      Showing 1 to {filteredGrants.length} of {filteredGrants.length} entries
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

                {!showConfirmGrant ? (
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
                          <option value="">Select an employee</option>
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

                      <div className="form-field">
                        <label>Hours Worked (Optional)</label>
                        <input
                            type="number"
                            name="hoursWorked"
                            step="0.5"
                            min="0"
                            value={formData.hoursWorked}
                            onChange={handleInputChange}
                            placeholder="e.g., 8"
                        />
                        <small>Supporting context only - does not affect days granted</small>
                      </div>

                      <div className="form-field">
                        <label>Days to Grant *</label>
                        <input
                            type="number"
                            name="daysGranted"
                            step="0.25"
                            min="0.25"
                            value={formData.daysGranted}
                            onChange={handleInputChange}
                            placeholder="e.g., 1.5"
                            required
                        />
                      </div>

                      <div className="form-field">
                        <label>Expiry Date *</label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                        <small>Last date this grant can be claimed</small>
                      </div>

                      <div className="form-field">
                        <label>Reason *</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="e.g., Worked on weekend project release"
                            required
                        />
                      </div>

                      <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleGrantFormClose}
                            disabled={submitting}
                        >
                          Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                        >
                          {submitting ? 'Processing...' : 'Review & Confirm'}
                        </button>
                      </div>
                    </form>
                ) : (
                    <div className="grant-confirmation">
                      <AlertCircleIcon width={48} height={48} className="info-icon" />
                      <h4>Confirm Comp-Off Grant</h4>
                      <div className="confirmation-details">
                        <p><strong>Employee:</strong> {selectedEmployee?.fullName} ({selectedEmployee?.employeeCode})</p>
                        <p><strong>Date Worked:</strong> {formatDate(formData.workedOn)}</p>
                        <p><strong>Hours Worked:</strong> {formData.hoursWorked || 'N/A'}</p>
                        <p><strong>Days to Grant:</strong> {formData.daysGranted}</p>
                        <p><strong>Expiry Date:</strong> {formatDate(formData.expiryDate)}</p>
                        <p><strong>Reason:</strong> {formData.reason}</p>
                      </div>
                      <div className="confirmation-warning">
                        <AlertCircleIcon width={20} height={20} />
                        <p>This grant will be immediately active. The employee can claim these comp-off days right away without any approval process.</p>
                      </div>
                      <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setShowConfirmGrant(false)}
                            disabled={submitting}
                        >
                          Back
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleConfirmGrant}
                            disabled={submitting}
                        >
                          {submitting ? 'Granting...' : 'Confirm Grant'}
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* Revoke Confirmation Modal */}
        {showRevokeConfirm && grantToRevoke && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Revoke Comp-Off Grant</h3>
                  <button className="modal-close" onClick={() => setShowRevokeConfirm(false)}>
                    <XIcon width={20} height={20} />
                  </button>
                </div>

                <div className="revoke-confirmation">
                  <AlertCircleIcon width={48} height={48} className="warning-icon" />
                  <p>Are you sure you want to revoke this grant?</p>
                  <p><strong>Grant Details:</strong></p>
                  <ul>
                    <li>Employee: {grantToRevoke.employeeName || grantToRevoke.userName}</li>
                    <li>Days Granted: {grantToRevoke.daysCredited ?? grantToRevoke.grantedDays ?? grantToRevoke.daysGranted}</li>
                    <li>Days Claimed: {grantToRevoke.claimedDays || grantToRevoke.daysClaimed}</li>
                    <li>Days Remaining: {grantToRevoke.remainingDays || grantToRevoke.daysRemaining}</li>
                  </ul>
                  <p className="warning-text">
                    {(grantToRevoke.claimedDays || grantToRevoke.daysClaimed) > 0
                        ? `Only the remaining ${grantToRevoke.remainingDays || grantToRevoke.daysRemaining} day(s) will be forfeited. Already-claimed days (${grantToRevoke.claimedDays || grantToRevoke.daysClaimed}) remain valid.`
                        : `All ${grantToRevoke.remainingDays || grantToRevoke.daysRemaining} day(s) will be forfeited.`}
                  </p>

                  <div className="form-field">
                    <label>Reason for Revocation *</label>
                    <textarea
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                        rows="3"
                        placeholder="Please provide a reason..."
                        required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowRevokeConfirm(false)}
                        disabled={revoking}
                    >
                      Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-danger"
                        onClick={handleRevokeConfirm}
                        disabled={revoking}
                    >
                      {revoking ? 'Revoking...' : 'Confirm Revoke'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Grant Detail Modal */}
        {showGrantDetail && (
            <div className="modal-overlay">
              <div className="modal-content large-modal">
                <div className="modal-header">
                  <h3>Grant Details - {grantDetail?.displayId || grantDetail?.grantId}</h3>
                  <button className="modal-close" onClick={handleGrantDetailClose}>
                    <XIcon width={20} height={20} />
                  </button>
                </div>

                {loadingDetail ? (
                    <div className="modal-loading">
                      <div className="dashboard-loading-spinner" />
                      <p>Loading grant details...</p>
                    </div>
                ) : grantDetail ? (
                    <div className="grant-detail-content">
                      <div className="grant-detail-section">
                        <h4>Grant Information</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>Employee:</label>
                            <span>
                        {grantDetail.employeeName || grantDetail.userName}
                              {(grantDetail.employeeCode || grantDetail.userCode) && ` (${grantDetail.employeeCode || grantDetail.userCode})`}
                      </span>
                          </div>
                          <div className="detail-item">
                            <label>Date Worked:</label>
                            <span>{formatDate(grantDetail.workedOn || grantDetail.dateWorked)}</span>
                          </div>
                          <div className="detail-item">
                            <label>Reason:</label>
                            <span>{grantDetail.reason}</span>
                          </div>
                          <div className="detail-item">
                            <label>Hours Worked:</label>
                            <span>{grantDetail.hoursWorked != null ? `${grantDetail.hoursWorked} hrs` : 'Not tracked'}</span>
                          </div>
                          <div className="detail-item">
                            <label>Days Granted:</label>
                            <span>{grantDetail.daysCredited ?? grantDetail.grantedDays ?? grantDetail.daysGranted}</span>
                          </div>
                          <div className="detail-item">
                            <label>Days Claimed:</label>
                            <span>{grantDetail.claimedDays || grantDetail.daysClaimed}</span>
                          </div>
                          <div className="detail-item">
                            <label>Days Remaining:</label>
                            <span className={(grantDetail.remainingDays || grantDetail.daysRemaining) > 0 ? 'text-green' : 'text-red'}>
                        {grantDetail.remainingDays || grantDetail.daysRemaining}
                      </span>
                          </div>
                          <div className="detail-item">
                            <label>Expiry Date:</label>
                            <span>{formatDate(grantDetail.expiryDate)}</span>
                          </div>
                          <div className="detail-item">
                            <label>Status:</label>
                            <span>{(() => {
                              const statusInfo = getGrantStatusInfo(grantDetail);
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
                            })()}</span>
                          </div>
                          <div className="detail-item">
                            <label>Created At:</label>
                            <span>{formatDateTime(grantDetail.createdAt)}</span>
                          </div>
                          {grantDetail.revokedAt && (
                              <>
                                <div className="detail-item">
                                  <label>Revoked At:</label>
                                  <span>{formatDateTime(grantDetail.revokedAt)}</span>
                                </div>
                                <div className="detail-item">
                                  <label>Revoked By:</label>
                                  <span>{grantDetail.revokedByName}</span>
                                </div>
                                <div className="detail-item full-width">
                                  <label>Revoke Reason:</label>
                                  <span>{grantDetail.revokeReason}</span>
                                </div>
                              </>
                          )}
                        </div>
                      </div>

                      {grantDetail.linkedLeaveRequests && grantDetail.linkedLeaveRequests.length > 0 && (
                          <div className="grant-detail-section">
                            <h4>Claim History</h4>
                            <table className="claims-table">
                              <thead>
                              <tr>
                                <th>Leave Dates</th>
                                <th>Days Claimed</th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Applied At</th>
                              </tr>
                              </thead>
                              <tbody>
                              {grantDetail.linkedLeaveRequests.map((claim) => (
                                  <tr key={claim.id}>
                                    <td>
                                      {formatDate(claim.startDate)}
                                      {claim.endDate && claim.endDate !== claim.startDate ? ` - ${formatDate(claim.endDate)}` : ''}
                                    </td>
                                    <td>{claim.totalDays}</td>
                                    <td>
                              <span
                                  className="claim-status-badge"
                                  style={{
                                    backgroundColor: claim.status === 'APPROVED' ? '#f0fdf4' : claim.status === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                                    color: claim.status === 'APPROVED' ? '#16a34a' : claim.status === 'REJECTED' ? '#dc2626' : '#b45309'
                                  }}
                              >
                                {claim.status}
                              </span>
                                    </td>
                                    <td>{claim.reason || '-'}</td>
                                    <td>{formatDateTime(claim.appliedAt || claim.createdAt)}</td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      )}

                      {grantDetail.attachments && grantDetail.attachments.length > 0 && (
                          <div className="grant-detail-section">
                            <h4>Attachments</h4>
                            <div className="attachments-list">
                              {grantDetail.attachments.map((attachment) => (
                                  <div key={attachment.id} className="attachment-item">
                                    <span>{attachment.fileName}</span>
                                    <a href={attachment.downloadUrl} target="_blank" rel="noopener noreferrer">
                                      Download
                                    </a>
                                  </div>
                              ))}
                            </div>
                          </div>
                      )}
                    </div>
                ) : (
                    <div className="modal-error">
                      Failed to load grant details.
                    </div>
                )}
              </div>
            </div>
        )}
      </DashboardLayout>
  );
};

export default ManagerCompOff;