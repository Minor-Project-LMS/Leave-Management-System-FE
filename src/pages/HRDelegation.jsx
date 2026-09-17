import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import DelegationTabs from '../components/manager/DelegationTabs';
import DelegationTable from '../components/manager/DelegationTable';
import CreateDelegationModal from '../components/manager/CreateDelegationModal';
import TeamOverviewList from '../components/manager/TeamOverviewList';
import ApprovalTabs from '../components/approvals/ApprovalTabs';
import ApprovalRequestsTable from '../components/approvals/ApprovalRequestsTable';
import RequestDetailPanel from '../components/approvals/RequestDetailPanel';
import RejectReasonModal from '../components/approvals/RejectReasonModal';
import { InfoIcon, PlusIcon, CheckCircleIcon, HourglassIcon, HistoryIcon, InboxIcon, ClipboardListIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { normalizeDelegation } from '../utils/delegation';
import {
  mockDelegations,
  mockDepartments,
  mockLeaveSummaryCategories,
  mockEligibleDelegates,
  mockApprovalInbox,
  mockApprovalDetails,
} from '../utils/mockData';
import './HRDelegation.css';

const USE_MOCK = env.useMockData;
const DELEGATION_LIMIT = 10;
const APPROVAL_LIMIT = 5;

const isPendingStatus = (status) => status === 'PENDING_L1' || status === 'PENDING_L2';

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const formatToday = () =>
  new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' });

// Builds a reasonable detail object from a list row when no richer detail
// is available — mirrors the same helper in the Manager Approval Inbox.
const synthesizeDetail = (item) => ({
  ...item,
  employee: { employeeCode: `EMP-${String(item.userId).padStart(4, '0')}` },
  attachments: (item.attachments || []).map((att) => ({
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

// HR's version of the Delegation feature. Two things live here:
//
// 1. "Delegated Approvals" — leave requests HR currently needs to act on.
//    When a manager who's out of office has delegated their approval
//    authority (typically to HR), the backend automatically routes those
//    requests' currentApprover to the delegate — so this is just the
//    normal Approval Inbox (GET /approvals/inbox), scoped to HR, showing
//    up wherever a manager's delegation has put HR in the approval seat.
//
// 2. "All Delegations" — org-wide visibility into who has delegated to
//    whom (every manager's delegations, not just HR's own), plus the
//    ability for HR to set up their own delegation if HR itself is going
//    to be out. Reuses the same components as the Manager Delegation page.
const HRDelegation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');

  const [view, setView] = useState('APPROVALS'); // APPROVALS | DELEGATIONS

  // --- Delegated Approvals state ---
  const [approvalStatus, setApprovalStatus] = useState('PENDING');
  const [approvalSort, setApprovalSort] = useState('newest');
  const [approvalPage, setApprovalPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [approvalCounts, setApprovalCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [approvalTotalCount, setApprovalTotalCount] = useState(0);
  const [approvalTotalPages, setApprovalTotalPages] = useState(1);
  const [approvalLoading, setApprovalLoading] = useState(true);
  const [approvalError, setApprovalError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const [mockState, setMockState] = useState(null);

  useEffect(() => {
    if (USE_MOCK) setMockState(mockApprovalInbox.map((r) => ({ ...r })));
  }, []);

  const computeMockCounts = useCallback(
    (all) => ({
      all: all.length,
      pending: all.filter((r) => isPendingStatus(r.status)).length,
      approved: all.filter((r) => r.status === 'APPROVED').length,
      rejected: all.filter((r) => r.status === 'REJECTED').length,
    }),
    []
  );

  const loadInbox = useCallback(async () => {
    setApprovalLoading(true);
    setApprovalError('');

    if (USE_MOCK) {
      if (!mockState) return;
      let filtered = mockState;
      if (approvalStatus === 'PENDING') filtered = mockState.filter((r) => isPendingStatus(r.status));
      else if (approvalStatus !== 'ALL') filtered = mockState.filter((r) => r.status === approvalStatus);

      filtered = [...filtered].sort((a, b) => {
        const diff = new Date(a.appliedAt) - new Date(b.appliedAt);
        return approvalSort === 'oldest' ? diff : -diff;
      });

      const start = (approvalPage - 1) * APPROVAL_LIMIT;
      setRequests(filtered.slice(start, start + APPROVAL_LIMIT));
      setApprovalCounts(computeMockCounts(mockState));
      setApprovalTotalCount(filtered.length);
      setApprovalTotalPages(Math.max(1, Math.ceil(filtered.length / APPROVAL_LIMIT)));
      setApprovalLoading(false);
      return;
    }

    try {
      const res = await apiService.getApprovalInbox({
        status: approvalStatus,
        page: approvalPage,
        limit: APPROVAL_LIMIT,
        sort: approvalSort,
      });
      const data = res?.data ?? [];
      setRequests(data);
      setApprovalCounts(res?.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 });
      setApprovalTotalCount(res?.totalCount ?? data.length);
      setApprovalTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      setApprovalError(getErrorMessage(err, 'Failed to load delegated approvals.'));
      setRequests([]);
      setApprovalCounts({ all: 0, pending: 0, approved: 0, rejected: 0 });
      setApprovalTotalCount(0);
      setApprovalTotalPages(1);
    } finally {
      setApprovalLoading(false);
    }
  }, [approvalStatus, approvalSort, approvalPage, mockState, computeMockCounts]);

  useEffect(() => {
    if (view === 'APPROVALS') loadInbox();
  }, [view, loadInbox]);

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
    if (view === 'APPROVALS' && selectedId != null) loadDetail(selectedId);
  }, [view, selectedId, loadDetail]);

  const applyDecisionLocally = (id, decision) => {
    setMockState((prev) => prev.map((r) => (r.id === id ? { ...r, status: decision, updatedAt: new Date().toISOString() } : r)));
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

  // --- All Delegations state ---
  const [delegationTab, setDelegationTab] = useState('ACTIVE');
  const [delegationPage, setDelegationPage] = useState(1);
  const [allDelegations, setAllDelegations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eligibleDelegates, setEligibleDelegates] = useState([]);
  const [delegationsLoading, setDelegationsLoading] = useState(true);
  const [delegationsError, setDelegationsError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDelegation, setEditingDelegation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setDepartments(mockDepartments);
      setCategories(mockLeaveSummaryCategories);
      setEligibleDelegates(mockEligibleDelegates);
      return;
    }
    Promise.all([
      apiService.getDepartments({ limit: 50 }),
      apiService.getLeaveCategories('ACTIVE'),
      apiService.getEligibleDelegates(),
    ])
      .then(([deptRes, catRes, delegatesRes]) => {
        setDepartments(deptRes?.data ?? []);
        setCategories(catRes?.data ?? catRes ?? []);
        setEligibleDelegates(delegatesRes?.data ?? delegatesRes ?? []);
      })
      .catch(() => {
        setDepartments(mockDepartments);
        setCategories(mockLeaveSummaryCategories);
        setEligibleDelegates(mockEligibleDelegates);
      });
  }, []);

  const loadDelegations = useCallback(async () => {
    setDelegationsLoading(true);
    setDelegationsError('');

    if (USE_MOCK) {
      setAllDelegations(mockDelegations.map(normalizeDelegation));
      setDelegationsLoading(false);
      return;
    }

    try {
      // No delegatorId param — for an HR caller the backend returns every
      // delegation org-wide, not just ones HR created themselves.
      const res = await apiService.getDelegations({ limit: 100 });
      setAllDelegations((res?.data ?? []).map(normalizeDelegation));
    } catch (err) {
      setDelegationsError(getErrorMessage(err, 'Failed to load delegations.'));
      setAllDelegations(mockDelegations.map(normalizeDelegation));
    } finally {
      setDelegationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'DELEGATIONS') loadDelegations();
  }, [view, loadDelegations]);

  const delegationCounts = {
    ACTIVE: allDelegations.filter((d) => d.computedStatus === 'ACTIVE').length,
    UPCOMING: allDelegations.filter((d) => d.computedStatus === 'UPCOMING').length,
    PAST: allDelegations.filter((d) => d.computedStatus === 'PAST' || d.computedStatus === 'REVOKED').length,
  };

  const filteredDelegations =
    delegationTab === 'PAST'
      ? allDelegations.filter((d) => d.computedStatus === 'PAST' || d.computedStatus === 'REVOKED')
      : allDelegations.filter((d) => d.computedStatus === delegationTab);

  const delegationTotalPages = Math.max(1, Math.ceil(filteredDelegations.length / DELEGATION_LIMIT));
  const delegationPageItems = filteredDelegations.slice(
    (delegationPage - 1) * DELEGATION_LIMIT,
    (delegationPage - 1) * DELEGATION_LIMIT + DELEGATION_LIMIT
  );

  const openCreateModal = () => {
    setEditingDelegation(null);
    setModalOpen(true);
  };

  const openEditModal = (delegation) => {
    setEditingDelegation(delegation);
    setModalOpen(true);
  };

  const handleSubmitDelegation = async (payload) => {
    setSubmitting(true);
    setDelegationsError('');
    try {
      if (USE_MOCK) {
        const delegate = eligibleDelegates.find((m) => m.id === payload.delegateId);
        if (editingDelegation) {
          setAllDelegations((prev) => prev.map((d) => (d.id === editingDelegation.id ? { ...d, ...payload } : d)));
        } else {
          setAllDelegations((prev) => [
            ...prev,
            normalizeDelegation({
              id: Date.now(),
              delegatorId: user?.id,
              delegatorName: user?.name || 'You',
              delegateName: delegate?.name || 'HR Admin',
              computedStatus: 'UPCOMING',
              isActive: true,
              createdAt: new Date().toISOString(),
              ...payload,
            }),
          ]);
        }
      } else if (editingDelegation) {
        await apiService.updateDelegation(editingDelegation.id, payload);
        await loadDelegations();
      } else {
        await apiService.createDelegation(payload);
        await loadDelegations();
      }
      setModalOpen(false);
      setEditingDelegation(null);
    } catch (err) {
      setDelegationsError(getErrorMessage(err, 'Failed to save delegation.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (delegation) => {
    if (!window.confirm(`Revoke ${delegation.delegateName}'s delegation?`)) return;
    setDelegationsError('');
    try {
      if (USE_MOCK) {
        setAllDelegations((prev) =>
          prev.map((d) => (d.id === delegation.id ? { ...d, computedStatus: 'REVOKED', isActive: false } : d))
        );
      } else {
        await apiService.revokeDelegation(delegation.id);
        await loadDelegations();
      }
    } catch (err) {
      setDelegationsError(getErrorMessage(err, 'Failed to revoke delegation.'));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      title="Delegation"
      breadcrumbs={[{ label: 'HR Dashboard', path: '/hr/dashboard' }, { label: 'Delegation' }]}
      dateLabel={formatToday()}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      badgeCounts={{ approvals: approvalCounts.pending }}
      user={user}
      onLogout={handleLogout}
    >
      <div className="hr-delegation-info-banner">
        <div className="hr-delegation-info-left">
          <span className="hr-delegation-info-icon">
            <InfoIcon width={18} height={18} />
          </span>
          <div>
            <strong>How delegation works</strong>
            <p>
              When a manager is on leave or not available, they delegate their approval authority — usually to HR. Any leave
              request that would normally wait for that manager is automatically routed to the delegate instead,
              so nothing gets stuck waiting for someone who's out of office.
            </p>
          </div>
        </div>
      </div>

      <div className="hr-delegation-view-toggle">
        <button
          className={`hr-delegation-view-btn ${view === 'APPROVALS' ? 'active' : ''}`}
          onClick={() => setView('APPROVALS')}
        >
          <InboxIcon width={15} height={15} />
          Delegated Approvals
          {approvalCounts.pending > 0 && <span className="hr-delegation-view-badge">{approvalCounts.pending}</span>}
        </button>
        <button
          className={`hr-delegation-view-btn ${view === 'DELEGATIONS' ? 'active' : ''}`}
          onClick={() => setView('DELEGATIONS')}
        >
          <ClipboardListIcon width={15} height={15} />
          All Delegations
        </button>
      </div>

      {view === 'APPROVALS' && (
        <>
          {approvalError && <div className="dashboard-error-banner">{approvalError}</div>}
          {actionError && <div className="dashboard-error-banner">{actionError}</div>}

          <div className="approval-inbox-layout">
            <div className="dashboard-panel approval-inbox-main">
              <ApprovalTabs
                activeStatus={approvalStatus}
                onStatusChange={(s) => {
                  setApprovalStatus(s);
                  setApprovalPage(1);
                }}
                counts={approvalCounts}
                sort={approvalSort}
                onSortChange={(s) => {
                  setApprovalSort(s);
                  setApprovalPage(1);
                }}
              />

              {approvalLoading ? (
                <p className="widget-empty">Loading requests...</p>
              ) : requests.length === 0 ? (
                <p className="widget-empty">
                  No requests are currently delegated to you. Requests appear here when a manager who has
                  delegated to you is out of office.
                </p>
              ) : (
                <ApprovalRequestsTable
                  requests={requests}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onApprove={handleApprove}
                  onReject={setRejectTarget}
                  page={approvalPage}
                  totalPages={approvalTotalPages}
                  totalCount={approvalTotalCount}
                  onPageChange={setApprovalPage}
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
        </>
      )}

      {view === 'DELEGATIONS' && (
        <>
          {delegationsError && <div className="dashboard-error-banner">{delegationsError} — showing sample data instead.</div>}

          <div className="delegation-layout">
            <div className="dashboard-panel delegation-main">
              <DelegationTabs active={delegationTab} counts={delegationCounts} onChange={(t) => { setDelegationTab(t); setDelegationPage(1); }} />

              {delegationsLoading ? (
                <p className="widget-empty">Loading delegations...</p>
              ) : (
                <DelegationTable
                  delegations={delegationPageItems}
                  departments={departments}
                  categories={categories}
                  page={delegationPage}
                  totalPages={delegationTotalPages}
                  totalCount={filteredDelegations.length}
                  onPageChange={setDelegationPage}
                  onEdit={openEditModal}
                  onRevoke={handleRevoke}
                />
              )}
            </div>

            <div className="delegation-sidebar">
              <div className="dashboard-panel">
                <TeamOverviewList
                  title="Org-Wide Delegation Summary"
                  items={[
                    { icon: CheckCircleIcon, label: 'Active Delegations', value: delegationCounts.ACTIVE, tone: 'green' },
                    { icon: HourglassIcon, label: 'Upcoming Delegations', value: delegationCounts.UPCOMING, tone: 'amber' },
                    { icon: HistoryIcon, label: 'Past Delegations', value: delegationCounts.PAST, tone: 'purple' },
                  ]}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {modalOpen && (
        <CreateDelegationModal
          eligibleDelegates={eligibleDelegates}
          departments={departments}
          categories={categories}
          editing={editingDelegation}
          submitting={submitting}
          onCancel={() => {
            setModalOpen(false);
            setEditingDelegation(null);
          }}
          onSubmit={handleSubmitDelegation}
        />
      )}
    </DashboardLayout>
  );
};

export default HRDelegation;
