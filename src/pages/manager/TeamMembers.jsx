import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TeamMembersTable from '../../components/manager/TeamMembersTable';
import TeamOverviewList from '../../components/manager/TeamOverviewList';
import LeaveSummaryList from '../../components/manager/LeaveSummaryList';
import TeamMembersQuickActions from '../../components/manager/TeamMembersQuickActions';
import NoteCard from '../../components/manager/NoteCard';
import EmployeeProfileModal from '../../components/hr/EmployeeProfileModal';
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
  mockLeaveLedger,
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
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [error, setError] = useState('');

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMember, setProfileMember] = useState(null);

  const [leaveYear, setLeaveYear] = useState(new Date().getFullYear());
  const [leaveLedger, setLeaveLedger] = useState([]);
  const [leaveLedgerLoading, setLeaveLedgerLoading] = useState(false);
  const [leaveLedgerError, setLeaveLedgerError] = useState('');

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
      const raw = membersRes?.data ?? [];
      // Normalize backend TeamMemberDto (userId/department) to the shape
      // the table and mock data both use (id/departmentName), so Employee
      // ID, Department, and View Profile (which needs `id`) all work.
      const data = raw.map((m) => ({
        ...m,
        id: m.id ?? m.userId,
        departmentName: m.departmentName ?? m.department,
      }));
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

  // Exports the full team (respecting the current department filter, but
  // not limited to the current page — a manager clicking "export" wants
  // the whole list, not just the 8 rows currently visible).
  const csvEscape = (value) => {
    const str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const buildMembersCsv = (rows) => {
    const header = ['Name', 'Employee ID', 'Department', 'Designation', 'Email', 'Phone', 'Status'];
    const lines = rows.map((m) =>
      [m.fullName, m.employeeCode, m.departmentName, m.designation, m.email, m.phone, m.status]
        .map(csvEscape)
        .join(',')
    );
    return [header.join(','), ...lines].join('\n');
  };

  const handleExportMembers = async () => {
    setExporting(true);
    setExportError('');
    try {
      let rows;

      if (USE_MOCK) {
        rows = departmentId ? mockTeamMembers.filter((m) => m.departmentId === departmentId) : mockTeamMembers;
      } else {
        // Fetch the whole filtered set in one go rather than paging through
        // it — team sizes here are small enough that a single large-limit
        // call is simpler and safer than stitching pages together.
        const res = await apiService.getTeamMembers({ departmentId, page: 1, limit: 1000 });
        const raw = res?.data ?? [];
        rows = raw.map((m) => ({
          ...m,
          id: m.id ?? m.userId,
          departmentName: m.departmentName ?? m.department,
        }));
      }

      const csv = buildMembersCsv(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-members-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setExportError(getErrorMessage(err, 'Failed to export member list.'));
    } finally {
      setExporting(false);
    }
  };

  const handleQuickAction = (label) => {
    if (label === 'Export Member List') {
      handleExportMembers();
    }
  };

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

  const openViewProfile = (member) => {
    // Managers can't call the HR-only single-employee endpoint, but the
    // team members list already carries everything the profile view
    // needs, so we just use the row data directly rather than refetching.
    setProfileMember(member);
    setProfileOpen(true);
    setLeaveYear(new Date().getFullYear());
  };

  const closeViewProfile = () => {
    setProfileOpen(false);
    setProfileMember(null);
    setLeaveLedger([]);
    setLeaveLedgerError('');
  };

  const loadLeaveLedgerFor = useCallback(async (memberId, year) => {
    setLeaveLedgerError('');

    if (USE_MOCK) {
      setLeaveLedger(mockLeaveLedger);
      return;
    }

    setLeaveLedgerLoading(true);
    try {
      const res = await apiService.getEmployeeLeaveLedger(memberId, year);
      const data = res?.data ?? res ?? [];
      setLeaveLedger(Array.isArray(data) ? data : []);
    } catch (err) {
      setLeaveLedgerError(getErrorMessage(err, 'Failed to load leave balance for this member.'));
      setLeaveLedger([]);
    } finally {
      setLeaveLedgerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profileOpen && profileMember?.id) {
      loadLeaveLedgerFor(profileMember.id, leaveYear);
    }
  }, [profileOpen, profileMember?.id, leaveYear, loadLeaveLedgerFor]);

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
      {exportError && <div className="dashboard-error-banner">{exportError}</div>}

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
              onViewProfile={openViewProfile}
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
            <TeamMembersQuickActions onAction={handleQuickAction} exporting={exporting} />
            <NoteCard tone="info">
              You can view member leave details, balances, and request history from their profile.
            </NoteCard>
          </div>
        </div>
      </div>

      {profileOpen && (
        <EmployeeProfileModal
          employee={profileMember}
          leaveLedger={leaveLedger}
          leaveLedgerLoading={leaveLedgerLoading}
          leaveLedgerError={leaveLedgerError}
          leaveYear={leaveYear}
          onLeaveYearChange={setLeaveYear}
          onClose={closeViewProfile}
        />
      )}
    </DashboardLayout>
  );
};

export default TeamMembers;
