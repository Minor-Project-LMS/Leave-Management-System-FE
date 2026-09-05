import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import EmployeeManagementTable from '../components/hr/EmployeeManagementTable';
import EmployeeFormModal from '../components/hr/EmployeeFormModal';
import EmployeeQuickActions from '../components/hr/EmployeeQuickActions';
import DepartmentWiseCount from '../components/hr/DepartmentWiseCount';
import TeamOverviewList from '../components/manager/TeamOverviewList';
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { mockEmployees, mockEmployeeStats, mockDepartments, mockDepartmentSummary } from '../utils/mockData';
import './HREmployeeManagement.css';

const USE_MOCK = env.useMockData;
const LIMIT = 8;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const pct = (part, whole) => (whole > 0 ? `${((part / whole) * 100).toFixed(1)}% of total` : '—');

const HREmployeeManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState(null);
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [departments, setDepartments] = useState([]);
  const [departmentSummary, setDepartmentSummary] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(mockEmployeeStats);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setDepartments(mockDepartments);
      setDepartmentSummary(mockDepartmentSummary);
      return;
    }
    Promise.all([apiService.getDepartments({ limit: 50 }), apiService.getDepartmentSummary()])
      .then(([deptRes, summaryRes]) => {
        setDepartments(deptRes?.data ?? []);
        setDepartmentSummary(summaryRes?.data ?? summaryRes ?? []);
      })
      .catch(() => {
        setDepartments(mockDepartments);
        setDepartmentSummary(mockDepartmentSummary);
      });
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      let filtered = mockEmployees;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.fullName.toLowerCase().includes(q) ||
            e.employeeCode.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q)
        );
      }
      if (departmentId) filtered = filtered.filter((e) => e.departmentId === departmentId);
      if (designation) filtered = filtered.filter((e) => e.designation === designation);
      if (status) filtered = filtered.filter((e) => e.employmentStatus === status);

      const start = (page - 1) * LIMIT;
      setEmployees(filtered.slice(start, start + LIMIT));
      setStats(mockEmployeeStats);
      setTotalCount(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / LIMIT)));
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.getEmployees({
        q: search.trim() || undefined,
        departmentId,
        designation: designation || undefined,
        status: status || undefined,
        page,
        limit: LIMIT,
      });
      const data = res?.data ?? [];
      setEmployees(data);
      setTotalCount(res?.totalCount ?? data.length);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load employees.'));
      setEmployees(mockEmployees.slice(0, LIMIT));
      setStats(mockEmployeeStats);
      setTotalCount(mockEmployees.length);
      setTotalPages(Math.ceil(mockEmployees.length / LIMIT));
    } finally {
      setLoading(false);
    }
  }, [search, departmentId, designation, status, page]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Designation options aren't a dedicated endpoint — derive from whichever
  // employees we've already fetched. Best-effort, not exhaustive across
  // pages, but keeps the filter usable without an extra round trip.
  const designationOptions = useMemo(
    () => [...new Set((USE_MOCK ? mockEmployees : employees).map((e) => e.designation).filter(Boolean))],
    [employees]
  );

  const managers = useMemo(
    () =>
      (USE_MOCK ? mockEmployees : employees).filter(
        (e) => e.role === 'MANAGER' || e.designation?.toLowerCase().includes('manager')
      ),
    [employees]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleSubmitEmployee = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (USE_MOCK) {
        // Mock mode has no persistence layer for this list; just close the
        // modal so the flow can still be demoed end-to-end.
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else if (editingEmployee) {
        await apiService.updateEmployee(editingEmployee.id, payload);
        await loadEmployees();
      } else {
        await apiService.createEmployee(payload);
        await loadEmployees();
      }
      setModalOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save employee.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (employee) => {
    if (!window.confirm(`Deactivate ${employee.fullName}? They will no longer be able to log in.`)) return;
    setError('');
    try {
      if (USE_MOCK) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === employee.id ? { ...e, employmentStatus: 'SEPARATED' } : e))
        );
      } else {
        await apiService.deactivateEmployee(employee.id);
        await loadEmployees();
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to deactivate employee.'));
    }
  };

  return (
    <DashboardLayout
      title="Employee Management"
      breadcrumbs={[{ label: 'HR Dashboard', path: '/hr/dashboard' }, { label: 'Employee Management' }]}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <div className="employee-mgmt-stats-row">
        <StatCard
          variant="detailed"
          icon={UsersIcon}
          label="Total Employees"
          value={stats.totalEmployees}
          sublabel="0 this month"
        />
        <StatCard
          variant="detailed"
          icon={CheckCircleIcon}
          iconClass="icon-green"
          label="Active Employees"
          value={stats.activeEmployees}
          sublabel={pct(stats.activeEmployees, stats.totalEmployees)}
          sublabelTone="positive"
        />
        <StatCard
          variant="detailed"
          icon={ClockIcon}
          iconClass="icon-amber"
          label="On Leave Today"
          value={stats.onLeaveToday}
          sublabel={pct(stats.onLeaveToday, stats.totalEmployees)}
          sublabelTone="warning"
        />
        <StatCard
          variant="detailed"
          icon={XCircleIcon}
          iconClass="icon-red"
          label="Inactive Employees"
          value={stats.inactiveEmployees}
          sublabel={pct(stats.inactiveEmployees, stats.totalEmployees)}
        />
      </div>

      <div className="employee-mgmt-toolbar">
        <div className="employee-mgmt-search">
          <SearchIcon width={16} height={16} />
          <input
            type="text"
            placeholder="Search by name, employee ID or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="employee-mgmt-filter-select"
          value={departmentId ?? ''}
          onChange={(e) => {
            setDepartmentId(e.target.value ? Number(e.target.value) : null);
            setPage(1);
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.departmentName}
            </option>
          ))}
        </select>

        <select
          className="employee-mgmt-filter-select"
          value={designation}
          onChange={(e) => {
            setDesignation(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Designations</option>
          {designationOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          className="employee-mgmt-filter-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Status: All</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="SEPARATED">Inactive</option>
        </select>

        <button className="employee-mgmt-filter-btn">
          <FilterIcon width={15} height={15} />
          Filter
        </button>
        <button className="employee-mgmt-add-btn" onClick={openAddModal}>
          <PlusIcon width={16} height={16} />
          Add Employee
        </button>
      </div>

      <div className="employee-mgmt-layout">
        <div className="dashboard-panel employee-mgmt-main">
          {loading ? (
            <p className="widget-empty">Loading employees...</p>
          ) : (
            <EmployeeManagementTable
              employees={employees}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              onEdit={openEditModal}
              onDeactivate={handleDeactivate}
            />
          )}
        </div>

        <div className="employee-mgmt-sidebar">
          <div className="dashboard-panel">
            <TeamOverviewList
              title="Employee Summary"
              items={[
                { icon: UsersIcon, label: 'Total Employees', value: stats.totalEmployees, tone: 'blue' },
                { icon: CheckCircleIcon, label: 'Active Employees', value: stats.activeEmployees, tone: 'green' },
                { icon: ClockIcon, label: 'On Leave', value: stats.onLeaveToday, tone: 'amber' },
                { icon: XCircleIcon, label: 'Inactive Employees', value: stats.inactiveEmployees, tone: 'purple' },
                { icon: UsersIcon, label: 'New Joiners (This Month)', value: stats.newJoinersThisMonth, tone: 'blue' },
              ]}
              footerLink={{ label: 'View Full Report', path: '/hr/reports' }}
            />
          </div>

          <div className="dashboard-panel">
            <EmployeeQuickActions
              onAddEmployee={openAddModal}
              onImport={() => {}}
              onBulkUpdate={() => {}}
              onManageRoles={() => {}}
              onDocuments={() => {}}
            />
          </div>

          <div className="dashboard-panel">
            <DepartmentWiseCount departments={departmentSummary} />
          </div>
        </div>
      </div>

      {modalOpen && (
        <EmployeeFormModal
          departments={departments}
          managers={managers}
          editing={editingEmployee}
          submitting={submitting}
          onCancel={() => {
            setModalOpen(false);
            setEditingEmployee(null);
          }}
          onSubmit={handleSubmitEmployee}
        />
      )}
    </DashboardLayout>
  );
};

export default HREmployeeManagement;
