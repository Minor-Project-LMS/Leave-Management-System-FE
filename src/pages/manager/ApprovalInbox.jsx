import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ApprovalTabs from '../../components/approvals/ApprovalTabs';
import ApprovalRequestsTable from '../../components/approvals/ApprovalRequestsTable';
import RequestDetailPanel from '../../components/approvals/RequestDetailPanel';
import RejectReasonModal from '../../components/approvals/RejectReasonModal';
import { HeadsetIcon } from '../../components/icons/Icons';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MANAGER_PORTAL } from '../../config/navConfig';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { env } from '../../config/env';
import { mockApprovalInbox, mockApprovalDetails } from '../../utils/mockData';
import './ApprovalInbox.css';

const USE_MOCK = env.useMockData;
const LIMIT = 5;

const isPendingStatus = (status) => status === 'PENDING_L1' || status === 'PENDING_L2';

// Helper to extract a human-readable string from any error object structure
const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (err?.response?.data?.message) return err.response.data.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

// Builds a reasonable detail object from a list row when no richer
// mockApprovalDetails/backend detail is available for that id.
const synthesizeDetail = (item) => ({
  ...item,
  employee: { employeeCode: `EMP-${String(item.userId).padStart(4, '0')}` },
  attachments: (item.attachments || []).map(att => ({
    ...att,
    uploadStatus: att.uploadStatus || att.status || 'ACTIVE',
  })),
  approvals: [
    {
      id: `${item.id}-req`,
      approverName: item.employeeName,
      decision: 'REQUESTED',
      decidedAt: item.appliedAt,
      comments: null,
    },
    ...(!isPendingStatus(item.status)
      ? [
          {
            id: `${item.id}-dec`,
            approverName: item.currentApproverName,
            decision: item.status,
            decidedAt: item.updatedAt,
            comments: null,
          },
        ]
      : []),
  ],
});

const ApprovalInbox = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('manager');

  const [mockState, setMockState] = useState(null); // local mutable copy for mock mode
  const [status, setStatus] = useState('PENDING');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Seed the local mock dataset once.
  useEffect(() => {
    if (USE_MOCK) setMockState(mockApprovalInbox.map((r) => ({ ...r })));
  }, []);

  const computeMockCounts = useCallback((all) => ({
    all: all.length,
    pending: all.filter((r) => isPendingStatus(r.status)).length,
    approved: all.filter((r) => r.status === 'APPROVED').length,
    rejected: all.filter((r) => r.status === 'REJECTED').length,
  }), []);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      if (!mockState) return; // wait for seed effect
      let filtered = mockState;
      if (status === 'PENDING') filtered = mockState.filter((r) => isPendingStatus(r.status));
      else if (status !== 'ALL') filtered = mockState.filter((r) => r.status === status);

      filtered = [...filtered].sort((a, b) => {
        const diff = new Date(a.appliedAt) - new Date(b.appliedAt);
        return sort === 'oldest' ? diff : -diff;
      });

      const start = (page - 1) * LIMIT;
      const pageItems = filtered.slice(start, start + LIMIT);

      setRequests(pageItems);
      setCounts(computeMockCounts(mockState));
      setTotalCount(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / LIMIT)));
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.getApprovalInbox({ status, page, limit: LIMIT, sort });
      const data = res?.data ?? [];
      setRequests(data);
      setCounts(res?.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 });
      setTotalCount(res?.totalCount ?? data.length);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load approval inbox.'));
      setRequests(mockApprovalInbox.slice(0, LIMIT));
      setCounts({ all: 5, pending: 5, approved: 0, rejected: 0 });
      setTotalCount(5);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [status, sort, page, mockState, computeMockCounts]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  // Auto-select the first row whenever the visible list changes and nothing
  // in it is currently selected.
  useEffect(() => {
    if (requests.length === 0) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    if (!requests.some((r) => r.id === selectedId)) {
      setSelectedId(requests[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const loadDetail = useCallback(
    async (id) => {
      setDetailLoading(true);
      if (USE_MOCK) {
        const item = mockState?.find((r) => r.id === id);
        setDetail(item ? mockApprovalDetails[id] ?? synthesizeDetail(item) : null);
        setDetailLoading(false);
        return;
      }
      try {
        const res = await apiService.getLeaveRequestDetail(id);
        setDetail(res?.data ?? res);
      } catch {
        const item = requests.find((r) => r.id === id);
        setDetail(item ? synthesizeDetail(item) : null);
      } finally {
        setDetailLoading(false);
      }
    },
    [mockState, requests]
  );

  useEffect(() => {
    if (selectedId != null) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const applyDecisionLocally = (id, decision) => {
    setMockState((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: decision, updatedAt: new Date().toISOString() } : r))
    );
  };

  const handleApprove = async (req) => {
    setActionSubmitting(true);
    setActionError('');
    try {
      if (USE_MOCK) {
        applyDecisionLocally(req.id, 'APPROVED');
      } else {
        await apiService.decideLeaveRequest(req.id, 'APPROVED');
        await loadInbox();
        if (selectedId === req.id) await loadDetail(req.id);
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to approve request.');
      setActionError(msg);

      // Auto-refresh data if conflict occurs (e.g., overlapping leave exists)
      if (err?.status === 409 || err?.response?.status === 409 || msg.toLowerCase().includes('overlapping')) {
        await loadInbox();
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRejectConfirm = async (comment) => {
    if (!rejectTarget) return;
    setActionSubmitting(true);
    setActionError('');
    try {
      if (USE_MOCK) {
        applyDecisionLocally(rejectTarget.id, 'REJECTED');
      } else {
        await apiService.decideLeaveRequest(rejectTarget.id, 'REJECTED', comment);
        await loadInbox();
        if (selectedId === rejectTarget.id) await loadDetail(rejectTarget.id);
      }
      setRejectTarget(null);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to reject request.');
      setActionError(msg);

      if (err?.status === 409 || err?.response?.status === 409 || msg.toLowerCase().includes('overlapping')) {
        await loadInbox();
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStatusChange = (s) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <DashboardLayout
      title="Approval Inbox"
      breadcrumbs={[{ label: 'Manager Dashboard', path: '/manager/dashboard' }, { label: 'Approval Inbox' }]}
      portalLabel={MANAGER_PORTAL.portalLabel}
      navItems={MANAGER_PORTAL.navItems}
      searchPlaceholder={MANAGER_PORTAL.searchPlaceholder}
      badgeCounts={{ approvals: counts.pending }}
      user={user}
      notificationCount={counts.pending}
      onLogout={handleLogout}
      helpCard={{
        subtitle: 'Contact HR Support',
        buttonLabel: 'Contact Us',
        icon: HeadsetIcon,
        onClick: () => navigate('/hr/employees'),
      }}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}
      {actionError && <div className="dashboard-error-banner">{actionError}</div>}

      <div className="approval-inbox-layout">
        <div className="dashboard-panel approval-inbox-main">
          <ApprovalTabs
            activeStatus={status}
            onStatusChange={handleStatusChange}
            counts={counts}
            sort={sort}
            onSortChange={(s) => {
              setSort(s);
              setPage(1);
            }}
          />

          {loading ? (
            <p className="widget-empty">Loading requests...</p>
          ) : (
            <ApprovalRequestsTable
              requests={requests}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          )}
        </div>

        <div className="dashboard-panel approval-inbox-detail">
          <RequestDetailPanel detail={detail} loading={detailLoading} />
        </div>
      </div>

      {rejectTarget && (
        <RejectReasonModal
          request={rejectTarget}
          onCancel={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
          submitting={actionSubmitting}
        />
      )}
    </DashboardLayout>
  );
};

export default ApprovalInbox;