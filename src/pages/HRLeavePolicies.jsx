import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import LeavePolicyTable from '../components/hr/LeavePolicyTable';
import LeavePolicyFormModal from '../components/hr/LeavePolicyFormModal';
import PolicyOverviewChart from '../components/hr/PolicyOverviewChart';
import PolicyQuickActions from '../components/hr/PolicyQuickActions';
import PolicyNotesCard from '../components/hr/PolicyNotesCard';
import { ClipboardListIcon, CheckCircleIcon, EditIcon, ArchiveIcon, SearchIcon, FilterIcon, PlusIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { mockHRLeavePolicies, mockLeaveCategories, mockDepartments } from '../utils/mockData';
import './HRLeavePolicies.css';

const USE_MOCK = env.useMockData;
const LIMIT = 10;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const HRLeavePolicies = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applicableFilter, setApplicableFilter] = useState('');
  const [page, setPage] = useState(1);

  const [allPolicies, setAllPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setCategories(mockLeaveCategories);
      setDepartments(mockDepartments);
      return;
    }
    Promise.all([apiService.getLeaveCategories('ACTIVE'), apiService.getDepartments({ limit: 50 })])
      .then(([catRes, deptRes]) => {
        setCategories(catRes?.data ?? catRes ?? []);
        setDepartments(deptRes?.data ?? []);
      })
      .catch(() => {
        setCategories(mockLeaveCategories);
        setDepartments(mockDepartments);
      });
  }, []);

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setAllPolicies(mockHRLeavePolicies);
      setLoading(false);
      return;
    }

    try {
      // Fetch the full set so the "Total/Active/Draft/Archived" counters
      // and the donut chart reflect everything, then filter/search/paginate
      // client-side — mirrors the Delegation Management page's approach.
      const res = await apiService.getLeavePolicies({ limit: 100 });
      setAllPolicies(res?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load leave policies.'));
      setAllPolicies(mockHRLeavePolicies);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const stats = useMemo(
    () => ({
      totalPolicies: allPolicies.length,
      activePolicies: allPolicies.filter((p) => p.status === 'ACTIVE').length,
      draftPolicies: allPolicies.filter((p) => p.status === 'DRAFT').length,
      archivedPolicies: allPolicies.filter((p) => p.status === 'ARCHIVED').length,
    }),
    [allPolicies]
  );

  const applicableOptions = useMemo(
    () => [...new Set(allPolicies.map((p) => p.applicableTo).filter(Boolean))],
    [allPolicies]
  );

  const filtered = useMemo(() => {
    let result = allPolicies;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.policyName.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.policyCode?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (applicableFilter) result = result.filter((p) => p.applicableTo === applicableFilter);
    return result;
  }, [allPolicies, search, statusFilter, applicableFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const pageItems = filtered.slice((page - 1) * LIMIT, (page - 1) * LIMIT + LIMIT);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openCreateModal = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  const handleSubmitPolicy = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else if (editingPolicy) {
        await apiService.updateLeavePolicy(editingPolicy.id, payload);
        await loadPolicies();
      } else {
        await apiService.createLeavePolicy(payload);
        await loadPolicies();
      }
      setModalOpen(false);
      setEditingPolicy(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save policy.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (policy, nextStatus) => {
    const verb = nextStatus === 'ARCHIVED' ? 'archive' : 'activate';
    if (!window.confirm(`Are you sure you want to ${verb} "${policy.policyName}"?`)) return;
    setError('');
    try {
      if (USE_MOCK) {
        setAllPolicies((prev) => prev.map((p) => (p.id === policy.id ? { ...p, status: nextStatus } : p)));
      } else {
        await apiService.updateLeavePolicy(policy.id, { status: nextStatus });
        await loadPolicies();
      }
    } catch (err) {
      setError(getErrorMessage(err, `Failed to ${verb} policy.`));
    }
  };

  const donutData = [
    { label: 'Active', value: stats.activePolicies, color: '#10b981' },
    { label: 'Draft', value: stats.draftPolicies, color: '#f59e0b' },
    { label: 'Archived', value: stats.archivedPolicies, color: '#9ca3af' },
  ];

  return (
    <DashboardLayout
      title="Leave Policies"
      breadcrumbs={[{ label: 'HR Dashboard', path: '/hr/dashboard' }, { label: 'Leave Policies' }]}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <div className="policy-toolbar-top">
        <div className="policy-stats-row">
          <StatCard
            variant="detailed"
            icon={ClipboardListIcon}
            label="Total Policies"
            value={stats.totalPolicies}
            sublabel="All Leave Types"
          />
          <StatCard
            variant="detailed"
            icon={CheckCircleIcon}
            iconClass="icon-green"
            label="Active Policies"
            value={stats.activePolicies}
            sublabel="Currently Active"
            sublabelTone="positive"
          />
          <StatCard
            variant="detailed"
            icon={EditIcon}
            iconClass="icon-amber"
            label="Draft Policies"
            value={stats.draftPolicies}
            sublabel="Under Review"
            sublabelTone="warning"
          />
          <StatCard
            variant="detailed"
            icon={ArchiveIcon}
            iconClass="icon-purple"
            label="Archived Policies"
            value={stats.archivedPolicies}
            sublabel="Inactive Rules"
          />
        </div>
        <button className="policy-create-btn" onClick={openCreateModal}>
          <PlusIcon width={16} height={16} />
          Create New Policy
        </button>
      </div>

      <div className="policy-filter-row">
        <div className="policy-search">
          <SearchIcon width={16} height={16} />
          <input
            type="text"
            placeholder="Search by policy name or leave type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="policy-filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Status: All</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          className="policy-filter-select"
          value={applicableFilter}
          onChange={(e) => {
            setApplicableFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Applicable To: All</option>
          {applicableOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <button className="policy-filter-btn">
          <FilterIcon width={15} height={15} />
          Filter
        </button>
      </div>

      <div className="policy-layout">
        <div className="dashboard-panel policy-main">
          {loading ? (
            <p className="widget-empty">Loading policies...</p>
          ) : (
            <LeavePolicyTable
              policies={pageItems}
              page={page}
              totalPages={totalPages}
              totalCount={filtered.length}
              onPageChange={setPage}
              onEdit={openEditModal}
              onViewHistory={() => {}}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>

        <div className="policy-sidebar">
          <div className="dashboard-panel">
            <div className="widget-header">
              <h3>Policy Overview</h3>
            </div>
            <PolicyOverviewChart data={donutData} />
          </div>

          <div className="dashboard-panel">
            <PolicyQuickActions
              onCreate={openCreateModal}
              onTemplates={() => {}}
              onApprovalWorkflow={() => {}}
              onHistory={() => {}}
            />
          </div>

          <div className="dashboard-panel">
            <PolicyNotesCard />
          </div>
        </div>
      </div>

      {modalOpen && (
        <LeavePolicyFormModal
          categories={categories}
          departments={departments}
          editing={editingPolicy}
          submitting={submitting}
          onCancel={() => {
            setModalOpen(false);
            setEditingPolicy(null);
          }}
          onSubmit={handleSubmitPolicy}
        />
      )}
    </DashboardLayout>
  );
};

export default HRLeavePolicies;
