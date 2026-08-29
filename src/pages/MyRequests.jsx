import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusBadge from '../components/dashboard/StatusBadge';
import { CalendarIcon, DownloadIcon, FilterIcon, XIcon, MoreVerticalIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { mockMyRequests } from '../utils/mockData';
import './MyRequests.css';

const STATUS_OPTIONS = ['All Status', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Withdrawn'];
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

      // Map filter values to API parameters
      if (filterParams.status && filterParams.status !== 'All Status') {
        params.status = filterParams.status === 'Pending' ? 'PENDING_L1' : 
                      filterParams.status === 'Approved' ? 'APPROVED' :
                      filterParams.status === 'Rejected' ? 'REJECTED' :
                      filterParams.status === 'Withdrawn' ? 'WITHDRAWN' :
                      filterParams.status === 'Cancelled' ? 'CANCELLED' : filterParams.status;
      }

      if (filterParams.fromDate) {
        params.fromDate = filterParams.fromDate;
      }

      if (filterParams.toDate) {
        params.toDate = filterParams.toDate;
      }

      const response = await apiService.getLeaveRequests(params);
      
      // Transform API response to match our component structure
      const data = response?.data ?? response ?? [];
      let transformedRequests = data.map(req => ({
        id: req.displayId || req.id,
        type: req.categoryName || req.type,
        typeIcon: req.categoryCode || req.type?.substring(0, 2).toUpperCase() || 'LV',
        startDate: req.startDate,
        endDate: req.endDate,
        dateRange: `${formatDate(req.startDate)} - ${formatDate(req.endDate)} (${req.totalDays} Days)`,
        totalDays: req.totalDays,
        status: req.status === 'PENDING_L1' ? 'Pending' : 
                req.status === 'PENDING_L2' ? 'Pending' :
                req.status === 'APPROVED' ? 'Approved' :
                req.status === 'REJECTED' ? 'Rejected' :
                req.status === 'WITHDRAWN' ? 'Withdrawn' :
                req.status === 'CANCELLED' ? 'Cancelled' : req.status,
        approverName: req.currentApproverName || 'Not Assigned',
        approverRole: 'Approver',
        approverInitials: req.currentApproverName ? 
          req.currentApproverName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA',
        appliedOn: req.appliedAt || req.createdAt,
      }));

      // Client-side filtering for leave type (since API uses categoryId)
      if (filterParams.leaveType && filterParams.leaveType !== 'All Leave Types') {
        transformedRequests = transformedRequests.filter(req => req.type === filterParams.leaveType);
      }

      setRequests(transformedRequests);
      setFilteredRequests(transformedRequests);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err.message || 'Failed to load leave requests. Using sample data for demonstration.');
      // Fallback to mock data
      setRequests(mockMyRequests);
      setFilteredRequests(mockMyRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial requests on mount
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Apply filters - only when reset or explicitly called
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleResetFilters = () => {
    setStatus('All Status');
    setLeaveType('All Leave Types');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    // Reload initial data
    loadRequests();
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadRequests({ status, leaveType, fromDate, toDate });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  const handleRowClick = (requestId) => {
    navigate(`/my-requests/${requestId}`);
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
        {/* Filter Section */}
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

        {/* Leave Requests Section */}
        <div className="my-requests-section">
          <div className="section-header">
            <h3>Leave Requests ({filteredRequests.length})</h3>
            <button className="btn-export" onClick={handleExport}>
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
                        onClick={() => handleRowClick(request.id)}
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
                        <td className="action">
                          <button 
                            className="action-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement action menu
                            }}
                          >
                            <MoreVerticalIcon width={16} height={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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