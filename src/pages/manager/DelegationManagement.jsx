import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DelegationInfoBanner from '../../components/manager/DelegationInfoBanner';
import DelegationTabs from '../../components/manager/DelegationTabs';
import DelegationTable from '../../components/manager/DelegationTable';
import CreateDelegationModal from '../../components/manager/CreateDelegationModal';
import DelegationQuickActions from '../../components/manager/DelegationQuickActions';
import DelegationNotesCard from '../../components/manager/DelegationNotesCard';
import TeamOverviewList from '../../components/manager/TeamOverviewList';
import { CheckCircleIcon, HourglassIcon, HistoryIcon } from '../../components/icons/Icons';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MANAGER_PORTAL } from '../../config/navConfig';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { env } from '../../config/env';
import {
  mockDelegations,
  mockDepartments,
  mockLeaveSummaryCategories,
  mockEligibleDelegates,
} from '../../utils/mockData';
import './DelegationManagement.css';

const USE_MOCK = env.useMockData;
const LIMIT = 10;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const formatToday = () =>
  new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' });

const DelegationManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('manager');

  const [tab, setTab] = useState('ACTIVE');
  const [page, setPage] = useState(1);

  const [allDelegations, setAllDelegations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eligibleDelegates, setEligibleDelegates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDelegation, setEditingDelegation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Reference data (departments, leave types, and eligible-delegate list —
  // HR admins, per GET /delegations/eligible-delegates — for the "Delegate
  // To" selector) only needs to load once.
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
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setAllDelegations(mockDelegations);
      setLoading(false);
      return;
    }

    try {
      // Fetch the full set (uncommon to have more than a handful of
      // delegations per manager) so all three tab counts can be shown at
      // once, and filter/paginate client-side per active tab.
      const res = await apiService.getDelegations({ limit: 100 });
      setAllDelegations(res?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load delegations.'));
      setAllDelegations(mockDelegations);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDelegations();
  }, [loadDelegations]);

  const counts = useMemo(
    () => ({
      ACTIVE: allDelegations.filter((d) => d.computedStatus === 'ACTIVE').length,
      UPCOMING: allDelegations.filter((d) => d.computedStatus === 'UPCOMING').length,
      PAST: allDelegations.filter((d) => d.computedStatus === 'PAST' || d.computedStatus === 'REVOKED').length,
    }),
    [allDelegations]
  );

  const filtered = useMemo(() => {
    if (tab === 'PAST') {
      return allDelegations.filter((d) => d.computedStatus === 'PAST' || d.computedStatus === 'REVOKED');
    }
    return allDelegations.filter((d) => d.computedStatus === tab);
  }, [allDelegations, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const pageItems = filtered.slice((page - 1) * LIMIT, (page - 1) * LIMIT + LIMIT);

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
    setError('');
    try {
      if (USE_MOCK) {
        const delegate = eligibleDelegates.find((m) => m.id === payload.delegateId);
        if (editingDelegation) {
          setAllDelegations((prev) =>
            prev.map((d) => (d.id === editingDelegation.id ? { ...d, ...payload } : d))
          );
        } else {
          setAllDelegations((prev) => [
            ...prev,
            {
              id: Date.now(),
              delegatorId: 501,
              delegatorName: user?.name || 'You',
              delegateName: delegate?.name || 'HR Admin',
              computedStatus: 'UPCOMING',
              isActive: true,
              createdAt: new Date().toISOString(),
              ...payload,
            },
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
      setError(getErrorMessage(err, 'Failed to save delegation.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (delegation) => {
    if (!window.confirm(`Revoke ${delegation.delegateName}'s delegation?`)) return;
    setError('');
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
      setError(getErrorMessage(err, 'Failed to revoke delegation.'));
    }
  };

  return (
    <DashboardLayout
      title="Delegation Management"
      breadcrumbs={[{ label: 'Manager Dashboard', path: '/manager/dashboard' }, { label: 'Delegation Management' }]}
      dateLabel={formatToday()}
      portalLabel={MANAGER_PORTAL.portalLabel}
      navItems={MANAGER_PORTAL.navItems}
      searchPlaceholder={MANAGER_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <DelegationInfoBanner onCreate={openCreateModal} />

      <div className="delegation-layout">
        <div className="dashboard-panel delegation-main">
          <DelegationTabs active={tab} counts={counts} onChange={handleTabChange} />

          {loading ? (
            <p className="widget-empty">Loading delegations...</p>
          ) : (
            <DelegationTable
              delegations={pageItems}
              departments={departments}
              categories={categories}
              delegatorName={user?.name}
              page={page}
              totalPages={totalPages}
              totalCount={filtered.length}
              onPageChange={setPage}
              onEdit={openEditModal}
              onRevoke={handleRevoke}
            />
          )}
        </div>

        <div className="delegation-sidebar">
          <div className="dashboard-panel">
            <TeamOverviewList
              title="Delegation Summary"
              items={[
                { icon: CheckCircleIcon, label: 'Active Delegations', value: counts.ACTIVE, tone: 'green' },
                { icon: HourglassIcon, label: 'Upcoming Delegations', value: counts.UPCOMING, tone: 'amber' },
                { icon: HistoryIcon, label: 'Past Delegations', value: counts.PAST, tone: 'purple' },
              ]}
            />
          </div>

          <div className="dashboard-panel">
            <DelegationQuickActions
              onCreate={openCreateModal}
              onViewMine={() => handleTabChange('ACTIVE')}
              onOpenCalendar={() => navigate('/manager/team-calendar')}
            />
          </div>

          <div className="dashboard-panel">
            <DelegationNotesCard />
          </div>
        </div>
      </div>

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

export default DelegationManagement;
