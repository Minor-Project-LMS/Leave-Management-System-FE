import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusBadge from '../components/dashboard/StatusBadge';
import { CalendarIcon, DownloadIcon, FilterIcon, MoreVerticalIcon, EyeIcon, XCircleIcon, EditIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { mockMyRequests } from '../utils/mockData';
import './MyRequests.css';

const STATUS_OPTIONS = ['All Status', 'Draft', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Withdrawn'];
const LEAVE_TYPE_OPTIONS = ['All Leave Types', 'Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp-Off'];
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

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

const MyRequests = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  // Filter states
  const [status, setStatus] = useState('All Status');
  const [leaveType, setLeaveType] = useState('All Leave Types');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRequests = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: 1,
        limit: 100,
        sort: 'recent',
        ...filterParams
      };

      if (filterParams.status && filterParams.status !== 'All Status') {
        params.status = filterParams.status === 'Draft' ? 'DRAFT' :
                      filterParams.status === 'Pending' ? 'PENDING_L1' :
                      filterParams.status === 'Approved' ? 'APPROVED' :
                      filterParams.status === 'Rejected' ? 'REJECTED' :
                      filterParams.status === 'Withdrawn' ? 'WITHDRAWN' :
                      filterParams.status === 'Cancelled' ? 'CANCELLED' : filterParams.status;
      }

      if (filterParams.leaveType && filterParams.leaveType !== 'All Leave Types') {
        params.categoryName = filterParams.leaveType;
      }

      if (filterParams.fromDate) params.fromDate = filterParams.fromDate;
      if (filterParams.toDate) params.toDate = filterParams.toDate;

      const response = await apiService.getLeaveRequests(params);
      const data = response?.data ?? response ?? [];

      let transformedRequests = data.map(req => ({
        rawId: req.id,
        id: req.displayId || req.id,
        type: req.categoryName || req.type,
        typeIcon: req.categoryCode || req.type?.substring(0, 2).toUpperCase() || 'LV',
        startDate: req.startDate,
        endDate: req.endDate,
        dateRange: `${formatDate(req.startDate)} - ${formatDate(req.endDate)} (${req.totalDays} Days)`,
        totalDays: req.totalDays,
        status: req.status === 'DRAFT' || req.status === 'Draft' ? 'Draft' :
                req.status === 'PENDING_L1' || req.status === 'PENDING_L2' ? 'Pending' :
                req.status === 'APPROVED' ? 'Approved' :
                req.status === 'REJECTED' ? 'Rejected' :
                req.status === 'WITHDRAWN' ? 'Withdrawn' :
                req.status === 'CANCELLED' ? 'Cancelled' : req.status,
        approverName: req.currentApproverName || 'Not Assigned',
        approverRole: 'Approver',
        approverInitials: req.currentApproverName ?
          req.currentApproverName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA',
        appliedOn: req.appliedAt || req.createdAt,
        reason: req.reason || '',
        applyFor: req.applyFor || 'Full Day',
        contactNo: req.contactNo || '',
        handoverTo: req.handoverTo || '',
        address: req.address || '',
        rawRequestData: req
      }));

      // Fallback client filtering if API doesn't support leave type param
      if (filterParams.leaveType && filterParams.leaveType !== 'All Leave Types') {
        transformedRequests = transformedRequests.filter(req => req.type === filterParams.leaveType);
      }

      setRequests(transformedRequests);
      setFilteredRequests(transformedRequests);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err.message || 'Failed to load leave requests. Using sample data.');
      setRequests(mockMyRequests);
      setFilteredRequests(mockMyRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleResetFilters = () => {
    setStatus('All Status');
    setLeaveType('All Leave Types');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    loadRequests();
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadRequests({ status, leaveType, fromDate, toDate });
  };

  // Functional CSV Export
  const handleExport = () => {
    if (!filteredRequests.length) return;

    const headers = ['Request ID', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Status', 'Approver', 'Applied On'];
    const rows = filteredRequests.map(req => [
      req.id,
      req.type,
      formatDate(req.startDate),
      formatDate(req.endDate),
      req.totalDays,
      req.status,
      req.approverName,
      formatDateTime(req.appliedOn)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `My_Leave_Requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Row & Action Click Handler
  const handleRowClick = (request) => {
    const isDraft = request.status?.toUpperCase() === 'DRAFT';

    if (isDraft) {
      // Navigate to Apply Leave form and pass full draft details to pre-fill inputs
      navigate('/apply-leave', {
        state: {
          draftData: {
            id: request.rawId || request.id,
            leaveType: request.type,
            fromDate: request.startDate,
            toDate: request.endDate,
            totalDays: request.totalDays,
            reason: request.reason,
            applyFor: request.applyFor,
            contactNo: request.contactNo,
            handoverTo: request.handoverTo,
            address: request.address,
            ...request.rawRequestData
          }
        }
      });
    } else {
      // Navigate to Request Details view
      navigate(`/my-requests/${request.id}`);
    }
  };

  const handleCancelOrWithdraw = async (requestId, currentStatus) => {
    const action = currentStatus === 'Pending' ? 'withdraw' : 'cancel';
    if (!window.confirm(`Are you sure you want to ${action} this leave request?`)) return;

    try {
      if (action === 'withdraw') {
        await apiService.withdrawLeaveRequest?.(requestId);
      } else {
        await apiService.cancelLeaveRequest?.(requestId);
      }
      setActiveMenuId(null);
      loadRequests({ status, leaveType, fromDate, toDate });
    } catch (err) {
      alert(`Failed to ${action} request: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);
  const showingFrom = filteredRequests.length > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, filteredRequests.length);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading My Requests...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="My Requests"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'My Requests' }]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} - Showing sample data for demonstration.</div>}

      <div className="my-requests-container">
        {/* Filters */}
        <div className="my-requests-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Leave Type</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                {LEAVE_TYPE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>From Date</label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <CalendarIcon className="date-icon" width={16} height={16} />
              </div>
            </div>

            <div className="filter-group">
              <label>To Date</label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || undefined}
                />
                <CalendarIcon className="date-icon" width={16} height={16} />
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn-reset" onClick={handleResetFilters}>
                Reset
              </button>
              <button className="btn-apply" onClick={handleApplyFilters}>
                <FilterIcon width={14} height={14} />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="my-requests-section">
          <div className="section-header">
            <h3>Leave Requests ({filteredRequests.length})</h3>
            <button className="btn-export" onClick={handleExport} disabled={!filteredRequests.length}>
              <DownloadIcon width={16} height={16} />
              Export
            </button>
          </div>

          {currentRequests.length === 0 ? (
            <div className="my-requests-empty">
              <p>No leave requests found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="my-requests-table-wrapper">
                <table className="my-requests-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Total Days</th>
                      <th>Status</th>
                      <th>Current Approver</th>
                      <th>Applied On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="my-requests-row"
                        onClick={() => handleRowClick(request)}
                      >
                        <td className="request-id">{request.id}</td>
                        <td className="leave-type">
                          <span className="leave-type-icon">{request.typeIcon}</span>
                          {request.type}
                        </td>
                        <td className="duration">{request.dateRange}</td>
                        <td className="total-days">{request.totalDays}</td>
                        <td className="status">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="current-approver">
                          <div className="approver-info">
                            <div className="approver-avatar">{request.approverInitials}</div>
                            <div className="approver-details">
                              <span className="approver-name">{request.approverName}</span>
                              <span className="approver-role">{request.approverRole}</span>
                            </div>
                          </div>
                        </td>
                        <td className="applied-on">{formatDateTime(request.appliedOn)}</td>
                        <td className="action" style={{ position: 'relative' }}>
                          <button
                            className="action-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === request.id ? null : request.id);
                            }}
                          >
                            <MoreVerticalIcon width={16} height={16} />
                          </button>

                          {/* Action Dropdown Menu */}
                          {activeMenuId === request.id && (
                            <div className="action-dropdown-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleRowClick(request)}>
                                {request.status === 'Draft' ? (
                                  <>
                                    <EditIcon width={14} height={14} /> Edit Draft
                                  </>
                                ) : (
                                  <>
                                    <EyeIcon width={14} height={14} /> View Details
                                  </>
                                )}
                              </button>

                              {(request.status === 'Pending' || request.status === 'Approved') && (
                                <button
                                  className="danger-action"
                                  onClick={() => handleCancelOrWithdraw(request.rawId || request.id, request.status)}
                                >
                                  <XCircleIcon width={14} height={14} />
                                  {request.status === 'Pending' ? 'Withdraw Request' : 'Cancel Leave'}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="my-requests-pagination">
                <div className="pagination-info">
                  Showing {showingFrom} to {showingTo} of {filteredRequests.length} entries
                </div>
                <div className="pagination-controls">
                  <div className="pagination-per-page">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {ITEMS_PER_PAGE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <span>per page</span>
                  </div>

                  <div className="pagination-nav">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      &lsaquo;
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      &rsaquo;
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyRequests;