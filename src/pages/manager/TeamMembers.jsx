import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TeamMembersTable from '../../components/manager/TeamMembersTable';
import TeamOverviewList from '../../components/manager/TeamOverviewList';
import LeaveSummaryList from '../../components/manager/LeaveSummaryList';
import TeamMembersQuickActions from '../../components/manager/TeamMembersQuickActions';
import NoteCard from '../../components/manager/NoteCard';
import { UsersIcon, HourglassIcon, CheckCircleIcon, ClipboardListIcon, FilterIcon, PlusIcon, ChevronDownIcon } from '../../components/icons/Icons';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MANAGER_PORTAL } from '../../config/navConfig';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { env } from '../../config/env';
import {
  mockDepartments,
  mockTeamMembers,
  mockTeamMembersStats,
  mockLeaveSummaryCategories,
} from '../../utils/mockData';
import './TeamMembers.css';

const USE_MOCK = env.useMockData;
const LIMIT = 8;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const formatToday = () =>
  new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' });

const computeStatsFromMembers = (members) => ({
  totalMembers: members.length,
  onLeaveToday: members.filter((m) => m.status === 'ON_LEAVE').length,
  availableToday: members.filter((m) => m.status !== 'ON_LEAVE').length,
  departments: new Set(members.map((m) => m.departmentId)).size,
});

const TeamMembers = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('manager');

  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState(null);
  const [page, setPage] = useState(1);

  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(mockTeamMembersStats);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [leaveSummary, setLeaveSummary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (USE_MOCK) {
      setDepartments(mockDepartments);
      return;
    }
    apiService
      .getDepartments({ limit: 50 })
      .then((res) => setDepartments(res?.data ?? []))
      .catch(() => setDepartments(mockDepartments));
  }, []);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      let filtered = mockTeamMembers;
      if (departmentId) filtered = filtered.filter((m) => m.departmentId === departmentId);

      const start = (page - 1) * LIMIT;
      const pageItems = filtered.slice(start, start + LIMIT);

      setMembers(pageItems);
      setStats(mockTeamMembersStats);
      setTotalCount(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / LIMIT)));
      setLeaveSummary(mockLeaveSummaryCategories);
      setLoading(false);
      return;
    }

    try {
      const [membersRes, summaryRes] = await Promise.all([
        apiService.getTeamMembers({ departmentId, page, limit: LIMIT }),
        apiService.getTeamLeaveSummary({}),
      ]);
      const data = membersRes?.data ?? [];
      setMembers(data);
      setStats(computeStatsFromMembers(data));
      setTotalCount(membersRes?.totalCount ?? data.length);
      setTotalPages(membersRes?.totalPages ?? 1);
      setLeaveSummary(summaryRes?.data ?? summaryRes ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load team members.'));
      setMembers(mockTeamMembers.slice(0, LIMIT));
      setStats(mockTeamMembersStats);
      setTotalCount(mockTeamMembers.length);
      setTotalPages(Math.ceil(mockTeamMembers.length / LIMIT));
      setLeaveSummary(mockLeaveSummaryCategories);
    } finally {
      setLoading(false);
    }
  }, [departmentId, page]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDepartmentChange = (value) => {
    setDepartmentId(value ? Number(value) : null);
    setPage(1);
  };

  return (
    <DashboardLayout
      title="Team Members"
      breadcrumbs={[{ label: 'Manager Dashboard', path: '/manager/dashboard' }, { label: 'Team Members' }]}
      dateLabel={formatToday()}
      portalLabel={MANAGER_PORTAL.portalLabel}
      navItems={MANAGER_PORTAL.navItems}
      searchPlaceholder={MANAGER_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <div className="team-members-toolbar">
        <div className="team-members-stat-trio">
          <div className="team-members-stat">
            <span className="team-members-stat-label">Total Members</span>
            <span className="team-members-stat-value">{stats.totalMembers}</span>
          </div>
          <div className="team-members-stat-divider" />
          <div className="team-members-stat">
            <span className="team-members-stat-label">On Leave Today</span>
            <span className="team-members-stat-value tone-warning">{stats.onLeaveToday}</span>
          </div>
          <div className="team-members-stat-divider" />
          <div className="team-members-stat">
            <span className="team-members-stat-label">Available</span>
            <span className="team-members-stat-value tone-positive">{stats.availableToday}</span>
          </div>
        </div>

        <div className="team-members-toolbar-actions">
          <div className="team-members-dept-select">
            <select value={departmentId ?? ''} onChange={(e) => handleDepartmentChange(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>
            <ChevronDownIcon width={14} height={14} />
          </div>
          <button className="team-members-filter-btn">
            <FilterIcon width={15} height={15} />
            Filter
          </button>
          <button className="team-members-add-btn">
            <PlusIcon width={16} height={16} />
            Add Member
          </button>
        </div>
      </div>

      <div className="team-members-layout">
        <div className="dashboard-panel team-members-main">
          {loading ? (
            <p className="widget-empty">Loading team members...</p>
          ) : (
            <TeamMembersTable
              members={members}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          )}
        </div>

        <div className="team-members-sidebar">
          <div className="dashboard-panel">
            <TeamOverviewList
              items={[
                { icon: UsersIcon, label: 'Total Members', value: stats.totalMembers, tone: 'blue' },
                { icon: HourglassIcon, label: 'On Leave Today', value: stats.onLeaveToday, tone: 'amber' },
                { icon: CheckCircleIcon, label: 'Available Today', value: stats.availableToday, tone: 'green' },
                { icon: ClipboardListIcon, label: 'Departments', value: stats.departments, tone: 'purple' },
              ]}
            />
          </div>

          <div className="dashboard-panel">
            <LeaveSummaryList title="Leave Balance Overview" items={leaveSummary} />
          </div>

          <div className="dashboard-panel">
            <TeamMembersQuickActions />
            <NoteCard tone="info">
              You can view member leave details, balances, and request history from their profile.
            </NoteCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamMembers;
