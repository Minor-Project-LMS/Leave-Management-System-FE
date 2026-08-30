import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusBadge from '../components/dashboard/StatusBadge';
import { 
  ArrowLeftIcon,
  CalendarIcon, 
  CheckIcon,
  CheckCircleIcon,
  ClockIcon, 
  DownloadIcon, 
  FileTextIcon, 
  HourglassIcon,
  MessageSquareIcon,
  XCircleIcon
} from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { mockRequestDetails } from '../utils/mockData';
import './RequestDetails.css';

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

const RequestDetails = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [request, setRequest] = useState(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [newComment, setNewComment] = useState('');

  const loadRequestDetails = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch request details (basic response from actual API)
      const response = await apiService.getLeaveRequestDetail(requestId);
      
      // Check if response is valid
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        throw new Error('Invalid response from server');
      }

      // Handle wrapped response (some APIs return { success: true, data: {...} })
      const requestData = response.data || response;
      
      // Fetch additional data separately since API doesn't return full detail
      let employeeData = null;
      let balanceData = [];
      let approvalsData = [];
      let attachmentsData = [];
      let commentsData = [];

      try {
        // Fetch employee details
        if (requestData.userId) {
          employeeData = await apiService.getCurrentUser();
        }
      } catch (empErr) {
        // Silently fall back to user context
      }

      try {
        // Fetch leave ledger/balance
        balanceData = await apiService.getLeaveLedger(new Date().getFullYear());
      } catch (balanceErr) {
        // Silently ignore balance loading failure
      }

      try {
        // Fetch approvals
        approvalsData = await apiService.getLeaveApprovals(requestId);
      } catch (approvalsErr) {
        // Silently ignore approvals loading failure
      }

      try {
        // Fetch attachments
        attachmentsData = await apiService.getLeaveAttachments(requestId);
      } catch (attachmentsErr) {
        // Silently ignore attachments loading failure
      }

      try {
        // Fetch comments
        commentsData = await apiService.getLeaveComments(requestId);
      } catch (commentsErr) {
        // Silently ignore comments loading failure
      }
      
      // Transform API response to match our component structure
      const transformedRequest = {
        id: requestData.displayId || requestData.id || 'LR-000',
        displayId: requestData.displayId || requestData.id || 'LR-000',
        type: requestData.categoryName || requestData.leaveType || 'Leave',
        typeIcon: requestData.categoryCode || (requestData.categoryName?.substring(0, 2).toUpperCase()) || 'LV',
        categoryName: requestData.categoryName || requestData.leaveType || 'Leave',
        categoryCode: requestData.categoryCode || (requestData.categoryName?.substring(0, 2).toUpperCase()) || 'LV',
        startDate: requestData.startDate || requestData.fromDate || '',
        endDate: requestData.endDate || requestData.toDate || '',
        dateRange: requestData.startDate && requestData.endDate 
          ? `${formatDate(requestData.startDate)} - ${formatDate(requestData.endDate)}`
          : formatDate(requestData.startDate || requestData.fromDate || ''),
        totalDays: requestData.totalDays || requestData.days || 0,
        status: (() => {
          const apiStatus = requestData.status;
          
          if (apiStatus === 'PENDING_L1' || apiStatus === 'PENDING_L2') return 'Pending';
          if (apiStatus === 'APPROVED') return 'Approved';
          if (apiStatus === 'REJECTED') return 'Rejected';
          if (apiStatus === 'WITHDRAWN') return 'Withdrawn';
          if (apiStatus === 'CANCELLED') return 'Cancelled';
          if (apiStatus === 'DRAFT') return 'Draft';
          
          // If status is already in display format, return it
          if (['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Cancelled', 'Draft'].includes(apiStatus)) {
            return apiStatus;
          }
          
          // Fallback - check if there's a final approval decision
          const hasRejectedApproval = approvalsData?.some(a => a.decision === 'REJECTED');
          if (hasRejectedApproval) return 'Rejected';
          
          const hasApprovedApproval = approvalsData?.some(a => a.decision === 'APPROVED');
          if (hasApprovedApproval) return 'Approved';
          
          return apiStatus || 'Pending';
        })(),
        reason: requestData.reason || requestData.purpose || 'No reason provided',
        sessionType: requestData.sessionType || 'FULL_DAY',
        appliedOn: requestData.appliedAt || requestData.createdAt || requestData.submittedAt || '',
        appliedOnFormatted: formatDateTime(requestData.appliedAt || requestData.createdAt || requestData.submittedAt || ''),
        updatedAt: requestData.updatedAt,
        updatedAtFormatted: formatDateTime(requestData.updatedAt),
        
        // Contact and handover details - not in current API response
        contactNumber: requestData.contactNumber || employeeData?.data?.phone || '',
        addressDuringLeave: requestData.addressDuringLeave || employeeData?.data?.address || '',
        handoverTo: requestData.handoverTo,
        handoverToName: requestData.handoverToName,
        handoverNotes: requestData.handoverNotes,
        
        // Employee name from API
        employeeName: requestData.userName || requestData.employeeName || employeeData?.data?.name || user?.name || 'N/A',
        
        // Current approver
        approverName: requestData.currentApproverName || requestData.approver?.name || 'Not Assigned',
        approverRole: requestData.approverRole || requestData.approver?.role || 'Approver',
        approverInitials: requestData.currentApproverName || requestData.approver?.name ? 
          (requestData.currentApproverName || requestData.approver?.name).split(' ').map(n => n[0]).join('').toUpperCase() : 'NA',
        
        // Employee details - use fetched employee data or fallback
        employee: {
          fullName: employeeData?.data?.name || employeeData?.data?.fullName || user?.fullName || requestData.userName || requestData.employeeName || 'N/A',
          name: employeeData?.data?.name || employeeData?.data?.fullName || user?.fullName || requestData.userName || requestData.employeeName || 'N/A',
          employeeCode: employeeData?.data?.employeeCode || user?.employeeCode || requestData.employeeCode || user?.id || 'N/A',
          designation: employeeData?.data?.designation || user?.designation || requestData.designation || 'Not specified',
          department: employeeData?.data?.departmentName || user?.departmentName || requestData.department || 'N/A',
          email: employeeData?.data?.email || user?.email || requestData.email || 'N/A',
          phone: employeeData?.data?.phone || user?.phone || requestData.contactNumber || 'Not provided',
          managerName: employeeData?.data?.managerName || employeeData?.data?.reportsToName || user?.managerName || user?.reportsToName || requestData.managerName || 'N/A',
        },
        
        // Leave balance at time of request (from fetched balance data)
        leaveBalance: (() => {
          if (balanceData && balanceData.length > 0) {
            const categoryBalance = balanceData.find(
              b => b.categoryId === requestData.categoryId
            );
            if (categoryBalance) {
              return {
                available: categoryBalance.availableBalance || categoryBalance.available || 0,
                used: categoryBalance.used || categoryBalance.consumed || 0,
                total: (categoryBalance.openingBalance || 0) + (categoryBalance.accrued || 0) + (categoryBalance.carriedForward || 0),
              };
            }
          }
          
          // Fallback to default values
          return {
            available: 0,
            used: 0,
            total: 0,
          };
        })(),
        
        // Full balance array for Leave Balance card
        balanceAsOfRequestDate: balanceData || [],
        
        // Approval timeline - use fetched approvals data
        approvals: (approvalsData || []).map(approval => ({
          id: approval.id,
          level: approval.level || approval.approvalLevel || 1,
          approverName: approval.approverName || approval.approver || approval.name || 'Unknown',
          decision: approval.decision || approval.status || approval.action || 'PENDING',
          decidedAt: approval.decidedAt || approval.approvedAt || approval.timestamp,
          decidedAtFormatted: approval.decidedAt || approval.approvedAt || approval.timestamp 
            ? formatDateTime(approval.decidedAt || approval.approvedAt || approval.timestamp) 
            : null,
          comments: approval.comments || approval.remarks || approval.note,
        })),
        attachments: (attachmentsData || []).map(att => ({
          id: att.id,
          entityType: att.entityType,
          entityId: att.entityId,
          fileName: att.fileName || att.name || att.documentName,
          contentType: att.contentType,
          sizeBytes: att.sizeBytes,
          size: att.sizeBytes ? `${(att.sizeBytes / 1024).toFixed(0)} KB` : (att.fileSize ? `${(att.fileSize / 1024).toFixed(0)} KB` : 'Unknown'),
          storageProvider: att.storageProvider,
          status: att.status,
          blobUrl: att.blobUrl,
          downloadUrl: att.downloadUrl || att.url || '#',
          uploadedBy: att.uploadedBy,
          uploadedAt: att.uploadedAt || att.createdAt || att.uploadDate,
        })),
        // Comments from separate API call
        comments: (commentsData || []).map(comment => ({
          id: comment.id,
          author: comment.authorName || comment.author || comment.user || 'Unknown',
          authorInitials: (comment.authorName || comment.author || comment.user || 'U').split(' ').map(n => n[0]).join('').toUpperCase(),
          message: comment.message || comment.text || comment.content,
          timestamp: comment.createdAt || comment.timestamp || comment.postedAt,
          timestampFormatted: formatDateTime(comment.createdAt || comment.timestamp || comment.postedAt),
        })),
        
        // Team impact information (optional, for manager view)
        teamImpact: requestData.teamImpact || null,
      };
      
      setRequest(transformedRequest);
    } catch (err) {
      console.error('Error loading request details:', err);
      setError(err.message || 'Failed to load request details.');
      
      // Fallback to mock data for demonstration
      const mockData = mockRequestDetails[requestId] || mockRequestDetails['LR-2024-119'];
      setRequest(mockData);
    } finally {
      setLoading(false);
    }
  }, [requestId, user]);

  useEffect(() => {
    loadRequestDetails();
  }, [loadRequestDetails]);

  const handleBack = () => {
    navigate('/my-requests');
  };

  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) {
      setError('Please provide a reason for withdrawal.');
      return;
    }

    try {
      await apiService.withdrawLeaveRequest(requestId, { reason: withdrawReason });
      setRequest(prev => ({ ...prev, status: 'Withdrawn' }));
      setWithdrawModalOpen(false);
      setWithdrawReason('');
    } catch (err) {
      setError(err.message || 'Failed to withdraw request.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await apiService.addLeaveComment(requestId, { message: newComment });
      const newCommentObj = {
        id: response.id || Date.now(),
        author: user?.name || 'User',
        authorInitials: (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase(),
        message: newComment,
        timestamp: response.createdAt || new Date().toISOString(),
        timestampFormatted: formatDateTime(response.createdAt || new Date().toISOString()),
      };
      setRequest(prev => ({
        ...prev,
        comments: [...prev.comments, newCommentObj]
      }));
      setNewComment('');
    } catch (err) {
      setError(err.message || 'Failed to add comment.');
    }
  };

  const handleDownloadAttachment = (attachment) => {
    // Guard for PENDING status - only allow download when attachment is ACTIVE
    if (attachment.status === 'PENDING') {
      setError('Attachment upload is still in progress. Please wait for it to complete.');
      return;
    }

    // Use the download URL from the attachment (presigned blob-storage URL)
    if (attachment.downloadUrl && attachment.downloadUrl !== '#') {
      window.open(attachment.downloadUrl, '_blank');
    } else {
      // Fallback: construct download URL based on attachment ID
      const downloadUrl = `/leave-requests/${requestId}/attachments/${attachment.id}`;
      window.open(downloadUrl, '_blank');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await apiService.downloadRequestPDF(requestId);
      // Create a blob from the response
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Leave-Request-${request.displayId || request.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError(err.message || 'Failed to download PDF.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getApprovalStatusIcon = (decision) => {
    switch (decision) {
      case 'APPROVED':
        return <CheckCircleIcon className="approval-icon approved" width={20} height={20} />;
      case 'REJECTED':
        return <XCircleIcon className="approval-icon rejected" width={20} height={20} />;
      case 'PENDING':
        return <HourglassIcon className="approval-icon pending" width={20} height={20} />;
      case 'REQUESTED':
        return <ClockIcon className="approval-icon requested" width={20} height={20} />;
      default:
        return <ClockIcon className="approval-icon requested" width={20} height={20} />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Request Details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <DashboardLayout
        title="Request Details"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'My Requests', path: '/my-requests' }, { label: 'Request Details' }]}
        portalLabel={EMPLOYEE_PORTAL.portalLabel}
        navItems={EMPLOYEE_PORTAL.navItems}
        searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
        user={user}
        onLogout={handleLogout}
      >
        <div className="request-details-error">
          <p>Request not found.</p>
          <button className="btn-back" onClick={handleBack}>
            <ArrowLeftIcon width={16} height={16} />
            Back to My Requests
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const canWithdraw = request.status === 'Pending';
  const finalDecision = request.approvals && request.approvals.length > 0
    ? [...request.approvals].reverse().find(a => a.decision === 'APPROVED' || a.decision === 'REJECTED')
    : null;
  const statusAsOfLabel = request.status === 'Approved' || request.status === 'Rejected'
    ? `on ${finalDecision?.decidedAtFormatted || request.updatedAtFormatted || ''}`
    : request.status === 'Withdrawn' || request.status === 'Cancelled'
      ? `on ${request.updatedAtFormatted || ''}`
      : 'Awaiting decision';

  return (
    <DashboardLayout
      title="Request Details"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'My Requests', path: '/my-requests' },
        { label: 'Request Details' }
      ]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}

      <div className="request-details-container">
        {/* Back link */}
        <button className="btn-back-link" onClick={handleBack}>
          <ArrowLeftIcon width={16} height={16} />
          Back to My Requests
        </button>

        {/* Header */}
        <div className="request-details-header">
          <div className="request-details-title-row">
            <h1>Request Details</h1>
            <StatusBadge status={request.status} />
          </div>
          <div className="request-details-meta">
            <span>Request ID: {request.displayId || request.id}</span>
            <span className="meta-divider">•</span>
            <span>Submitted on: {request.appliedOnFormatted || formatDateTime(request.appliedOn)}</span>
          </div>
        </div>

        {/* Summary strip - single card, 4 divided sections */}
        <div className="request-summary-strip">
          <div className="strip-section">
            <span className="strip-label">Leave Summary</span>
            <div className="strip-summary-row">
              <span className="strip-icon-box">
                <CalendarIcon width={18} height={18} />
              </span>
              <div className="strip-summary-text">
                <span className="strip-value">{request.categoryName || request.type}</span>
                <span className="strip-sub">{request.categoryCode || request.categoryName?.substring(0, 2).toUpperCase() || 'LV'}</span>
              </div>
            </div>
          </div>
          <div className="strip-section">
            <span className="strip-label">Duration</span>
            <span className="strip-value">{request.dateRange}</span>
            <span className="strip-sub">({request.totalDays} {request.totalDays === 1 ? 'Day' : 'Days'})</span>
          </div>
          <div className="strip-section">
            <span className="strip-label">Total Days</span>
            <span className="strip-value strip-value-large">{Number(request.totalDays).toFixed(1)} Days</span>
          </div>
          <div className="strip-section">
            <span className="strip-label">Status</span>
            <StatusBadge status={request.status} />
            <span className="strip-sub">{statusAsOfLabel}</span>
          </div>
        </div>

        <div className="request-details-grid">
          {/* Column 1 - Left */}
          <div className="request-details-col-left">
            {/* Leave Details Card */}
            <div className="detail-card leave-details-card">
              <div className="detail-card-header">
                <h3>Leave Details</h3>
              </div>
              <div className="leave-details-content">
                <div className="detail-line">
                  <span className="detail-label">Leave Type</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{request.categoryName || request.type}</span>
                </div>
                <div className="detail-line">
                  <span className="detail-label">From Date</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{formatDate(request.startDate)}</span>
                </div>
                <div className="detail-line">
                  <span className="detail-label">To Date</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{formatDate(request.endDate)}</span>
                </div>
                <div className="detail-line">
                  <span className="detail-label">Total Days</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{request.totalDays} Days</span>
                </div>
                <div className="detail-line">
                  <span className="detail-label">Apply For</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{request.sessionType === 'FULL_DAY' ? 'Full Day' : 'Half Day'}</span>
                </div>
                <div className="detail-line">
                  <span className="detail-label">Reason</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{request.reason}</span>
                </div>
                <div className="detail-line">
                  <span className="detail-label">Contact No.</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{request.contactNumber || 'N/A'}</span>
                </div>
                <div className="detail-line">
                  <span className="detail-label">Handover To</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{request.handoverToName || 'N/A'}</span>
                </div>
                {request.handoverNotes && (
                  <div className="detail-line">
                    <span className="detail-label">Handover Notes</span>
                    <span className="detail-colon">:</span>
                    <span className="detail-value">{request.handoverNotes}</span>
                  </div>
                )}
                <div className="detail-line">
                  <span className="detail-label">Address</span>
                  <span className="detail-colon">:</span>
                  <span className="detail-value">{request.addressDuringLeave || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="detail-card attachments-card">
              <div className="detail-card-header">
                <h3>Attachments ({request.attachments?.length || 0})</h3>
              </div>
              <div className="attachments-list">
                {request.attachments && request.attachments.length > 0 ? (
                  request.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-item">
                      <div className="attachment-icon">
                        <FileTextIcon width={18} height={18} />
                      </div>
                      <div className="attachment-info">
                        <span className="attachment-name">{attachment.fileName}</span>
                        <span className="attachment-size">{attachment.size}</span>
                      </div>
                      <button
                        className="btn-download-attachment"
                        onClick={() => handleDownloadAttachment(attachment)}
                        aria-label={`Download ${attachment.fileName}`}
                      >
                        <DownloadIcon width={16} height={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="attachments-empty">
                    <span>No attachments</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2 - Middle */}
          <div className="request-details-col-middle">
            {/* Approval Timeline Card */}
            <div className="detail-card approval-timeline-card">
              <div className="detail-card-header">
                <h3>Approval Timeline</h3>
              </div>
              <div className="approval-timeline">
                {/* Initial submission */}
                <div className="timeline-row">
                  <div className="timeline-track">
                    <div className="timeline-marker completed">
                      <CheckIcon width={14} height={14} />
                    </div>
                    {(request.approvals && request.approvals.length > 0) && <div className="timeline-connector connector-solid" />}
                  </div>
                  <div className="timeline-body">
                    <div className="timeline-title title-green">Submitted</div>
                    <div className="timeline-person">
                      {request.employeeName || 'You'}{request.employee?.designation ? ` (${request.employee.designation})` : ' (You)'}
                    </div>
                    <div className="timeline-date">
                      {request.appliedOnFormatted || formatDateTime(request.appliedAt || request.appliedOn)}
                    </div>
                  </div>
                  <div className="timeline-note note-success">
                    <span className="note-title">Submitted</span>
                    <span className="note-text">Request requested successfully.</span>
                  </div>
                </div>

                {/* Approval steps - skip the REQUESTED step if it exists */}
                {request.approvals && request.approvals
                  .filter(approval => approval.decision !== 'REQUESTED')
                  .map((approval, index, filteredApprovals) => {
                  const isLast = index === filteredApprovals.length - 1;
                  const leadsToCompleted = isLast && (request.status === 'Approved' || request.status === 'Rejected');
                  const hasConnector = !isLast || leadsToCompleted;
                  const isRejected = approval.decision === 'REJECTED';
                  const isPending = approval.decision === 'PENDING';
                  
                  return (
                    <div key={approval.id} className="timeline-row">
                      <div className="timeline-track">
                        <div className={`timeline-marker ${isRejected ? 'rejected' : isPending ? 'pending' : 'completed'}`}>
                          {getApprovalStatusIcon(approval.decision)}
                        </div>
                        {hasConnector && (
                          <div className={`timeline-connector ${leadsToCompleted ? 'connector-dashed' : 'connector-solid'}`} />
                        )}
                      </div>
                      <div className="timeline-body">
                        <div className={`timeline-title ${isRejected ? 'title-red' : 'title-green'}`}>
                          {isRejected 
                            ? (approval.level === 1 ? 'Manager Rejected' : approval.level === 2 ? 'HR Rejected' : `Level ${approval.level} Rejected`)
                            : (approval.level === 1 ? 'Manager Approved' : approval.level === 2 ? 'HR Approved' : `Level ${approval.level} Reviewed`)
                          }
                        </div>
                        <div className="timeline-person">
                          {approval.approverName} {approval.level ? `(${approval.level === 1 ? 'Team Lead' : 'HR Manager'})` : ''}
                        </div>
                        {approval.decidedAt && (
                          <div className="timeline-date">
                            {approval.decidedAtFormatted || formatDateTime(approval.decidedAt)}
                          </div>
                        )}
                      </div>
                      <div className={`timeline-note ${isRejected ? 'note-danger' : isPending ? 'note-warning' : 'note-success'}`}>
                        <span className="note-title">{isRejected ? 'Rejected' : isPending ? 'Pending' : 'Approved'}</span>
                        <span className="note-text">{approval.comments || (isPending ? 'Awaiting review' : 'Reviewed and actioned.')}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Completed status for finalized requests (approved or rejected) */}
                {(request.status === 'Approved' || request.status === 'Rejected') && (
                  <div className="timeline-row timeline-final">
                    <div className="timeline-track">
                      <div className={`timeline-marker ${request.status === 'Rejected' ? 'rejected' : 'current-filled'}`}>
                        {request.status === 'Rejected' ? <XCircleIcon width={14} height={14} /> : <div className="timeline-dot" />}
                      </div>
                    </div>
                    <div className="timeline-body">
                      <div className={`timeline-title ${request.status === 'Rejected' ? 'title-red' : 'title-blue'}`}>
                        {request.status === 'Rejected' ? 'Process Completed' : 'Completed'}
                      </div>
                      <div className="timeline-date">
                        {request.updatedAtFormatted || formatDateTime(request.updatedAt)}
                      </div>
                    </div>
                    <div className={`timeline-note ${request.status === 'Rejected' ? 'note-danger' : 'note-info'}`}>
                      <span className="note-title">{request.status === 'Rejected' ? 'Process Completed' : 'Completed'}</span>
                      <span className="note-text">
                        {request.status === 'Rejected' 
                          ? 'Request has been reviewed and a decision has been made.' 
                          : 'Latest request has been fully approved.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Card */}
            <div className="detail-card comments-card">
              <div className="detail-card-header">
                <h3>Comments</h3>
              </div>
              <div className="comments-section">
                <div className="comments-list">
                  {request.comments && request.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar">{comment.authorInitials}</div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.author}</span>
                          <span className="comment-timestamp">
                            {comment.timestampFormatted || formatDateTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="comment-message">{comment.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="comment-input-wrapper">
                  <div className="comment-input-avatar">
                    {(user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="comment-input-container">
                    <textarea
                      className="comment-input"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <button 
                      className="btn-send-comment"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <MessageSquareIcon width={16} height={16} />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 - Right */}
          <div className="request-details-col-right">
            {/* Employee Details Card */}
            <div className="detail-card employee-details-card">
              <div className="detail-card-header">
                <h3>Employee Details</h3>
              </div>
              <div className="employee-details-content">
                <div className="employee-header-row">
                  <div className="employee-avatar-large">
                    {request.employee?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                     request.employeeName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                  <div className="employee-info">
                    <h4 className="employee-name">{request.employee?.fullName || request.employeeName || 'N/A'}</h4>
                    <p className="employee-designation">{request.employee?.designation || 'N/A'}</p>
                  </div>
                </div>
                <div className="employee-contact">
                  <div className="contact-item">
                    <span className="contact-label">Employee ID</span>
                    <span className="contact-colon">:</span>
                    <span className="contact-value">{request.employee?.employeeCode || 'N/A'}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Department</span>
                    <span className="contact-colon">:</span>
                    <span className="contact-value">{request.employee?.department || 'N/A'}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Manager</span>
                    <span className="contact-colon">:</span>
                    <span className="contact-value">{request.employee?.managerName || 'N/A'}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Email</span>
                    <span className="contact-colon">:</span>
                    <span className="contact-value">{request.employee?.email || 'N/A'}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Phone</span>
                    <span className="contact-colon">:</span>
                    <span className="contact-value">{request.employee?.phone || request.contactNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Balance Card */}
            <div className="detail-card leave-balance-card">
              <div className="detail-card-header">
                <h3>Leave Balance <span className="balance-date-label">(As on {request.appliedOnFormatted?.split(',')[0] || formatDate(request.appliedAt || request.appliedOn)})</span></h3>
              </div>
              <div className="leave-balance-content">
                {request.balanceAsOfRequestDate && request.balanceAsOfRequestDate.length > 0 ? (
                  request.balanceAsOfRequestDate.map((balance, index) => (
                    <div key={index} className="balance-row">
                      <div className="balance-info">
                        <span className="balance-category">{balance.categoryName}</span>
                        <span className="balance-code">({balance.categoryCode || balance.categoryName?.substring(0, 2).toUpperCase()})</span>
                      </div>
                      <div className="balance-values">
                        <span className="balance-current">{(balance.availableBalance ?? balance.closingBalance ?? balance.balance ?? 0).toFixed(1)}</span>
                        <span className="balance-separator">/</span>
                        <span className="balance-max">{((balance.openingBalance ?? 0) + (balance.accrued ?? 0) + (balance.carriedForward ?? 0) || balance.total || 0).toFixed(1)} Days</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="balance-empty">
                    <span>No balance information available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="detail-card actions-card">
              <div className="detail-card-header">
                <h3>Actions</h3>
              </div>
              <div className="actions-content">
                {canWithdraw && (
                  <button 
                    className="btn-action-withdraw"
                    onClick={() => setWithdrawModalOpen(true)}
                  >
                    <span className="btn-action-icon">🗑️</span>
                    Withdraw Request
                  </button>
                )}
                <button 
                  className="btn-action-download"
                  onClick={handleDownloadPDF}
                >
                  <DownloadIcon width={16} height={16} />
                  Download as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="request-info-banner">
          <span className="info-banner-icon">ℹ️</span>
          <span>You can withdraw your request only before the final approval.</span>
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="modal-overlay" onClick={() => setWithdrawModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Withdraw Request</h3>
              <button 
                className="modal-close"
                onClick={() => setWithdrawModalOpen(false)}
              >
                <XCircleIcon width={20} height={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-message">
                Are you sure you want to withdraw this leave request? This action cannot be undone.
              </p>
              <div className="form-field">
                <label>Reason for Withdrawal *</label>
                <textarea
                  rows={4}
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="Please provide a reason for withdrawing this request..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-modal-cancel"
                onClick={() => setWithdrawModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-modal-confirm"
                onClick={handleWithdraw}
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RequestDetails;