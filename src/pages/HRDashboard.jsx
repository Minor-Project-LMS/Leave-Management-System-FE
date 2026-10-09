import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import LeaveDistributionChart from '../components/dashboard/LeaveDistributionChart';
import PendingApprovalsWidget from '../components/manager/PendingApprovalsWidget';
import HRLeaveTrendChart from '../components/hr/HRLeaveTrendChart';
import DepartmentSummaryTable from '../components/hr/DepartmentSummaryTable';
import HRQuickActions from '../components/hr/HRQuickActions';
import PendingWithManagersWidget from '../components/hr/PendingWithManagersWidget';
import NotifyManagerModal from '../components/hr/NotifyManagerModal';
import { UsersIcon, ClockIcon, HourglassIcon, ClipboardListIcon, DownloadIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { formatToday } from '../utils/date';
import {
  mockHRSummary,
  mockHRLeaveTrend,
  mockHRDistribution,
  mockHRDistributionTotal,
  mockDepartmentSummary,
  mockHRPendingApprovals,
} from '../utils/mockData';
import './HRDashboard.css';

const USE_MOCK = env.useMockData;

const buildSixMonthLeaveTrend = (requests = []) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      month: date.toLocaleString('en-US', { month: 'short' }),
      requests: 0,
      approved: 0,
    };
  });

  const monthMap = new Map(months.map((month) => [month.key, month]));

  requests.forEach((request) => {
    const requestDate = request.appliedAt || request.createdAt || request.startDate;
    if (!requestDate) return;

    const date = new Date(requestDate);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const month = monthMap.get(key);
    if (!month) return;

    const status = String(request.status || '').toUpperCase();

    // Drafts are not submitted requests. Other submitted states count as
    // requests; APPROVED is also counted in the approved series.
    if (status !== 'DRAFT') {
      month.requests += 1;
    }
    if (status === 'APPROVED') {
      month.approved += 1;
    }
  });

  return months.map(({ key, ...month }) => month);
};

const PENDING_STATUSES = ['PENDING_L1', 'PENDING_L2'];

// Leave starting on or before today + urgentWindowDays is "urgent" — the
// same rule the backend's LeaveEscalationService uses to decide what can
// escalate. /leave-requests doesn't send the urgent flag itself (only the
// approval inbox does), so it's derived here from the SLA settings.
const isUrgentLeave = (startDate, urgentWindowDays) => {
  if (!startDate || urgentWindowDays == null) return false;
  const urgentUntil = new Date();
  urgentUntil.setHours(0, 0, 0, 0);
  urgentUntil.setDate(urgentUntil.getDate() + Number(urgentWindowDays));
  return new Date(`${startDate}T00:00:00`) <= urgentUntil;
};

const fetchPendingWithManagers = async (hrUserId) => {
  const pages = await Promise.all(
    PENDING_STATUSES.map((status) =>
      apiService.getLeaveRequests({ status, page: 1, limit: 100, sort: 'oldest' })
    )
  );
  return pages
    .flatMap((res) => res?.data ?? res ?? [])
    // Requests already in HR's own seat are handled from the Delegation
    // inbox — there's no manager to notify for those.
    .filter((r) => r.currentApproverId == null || String(r.currentApproverId) !== String(hrUserId));
};

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchLeaveRequestsForTrend = async () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const allRequests = [];
  const limit = 100;

  for (let page = 1; page <= 20; page += 1) {
    const response = await apiService.getLeaveRequests({
      fromDate: toLocalDateString(from),
      toDate: toLocalDateString(today),
      page,
      limit,
      sort: 'recent',
    });

    const pageData = response?.data ?? response ?? [];
    const rows = Array.isArray(pageData) ? pageData : Array.isArray(pageData?.content) ? pageData.content : [];
    allRequests.push(...rows);

    if (rows.length < limit) break;
  }

  return allRequests;
};

const HRDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [distributionTotal, setDistributionTotal] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [approvals, setApprovals] = useState([]);

  // Pending requests still with managers, for HR's "notify manager" step.
  const [pendingWithManagers, setPendingWithManagers] = useState([]);
  const [urgentWindowDays, setUrgentWindowDays] = useState(null);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState('');
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifyError, setNotifyError] = useState('');
  const [notifySuccess, setNotifySuccess] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setSummary(mockHRSummary);
      setTrend(mockHRLeaveTrend);
      setDistribution(mockHRDistribution);
      setDistributionTotal(mockHRDistributionTotal);
      setDepartments(mockDepartmentSummary);
      setApprovals(mockHRPendingApprovals);
      setLoading(false);
      return;
    }

    try {
      const [hrSummaryRes, reportsSummaryRes, leaveRequests, deptRes, approvalsRes, distributionRes] = await Promise.all([
        apiService.getHRSummary(),
        apiService.getReportsSummary(),
        fetchLeaveRequestsForTrend(),
        apiService.getDepartmentSummary(),
        apiService.getHRPendingApprovals(5),
        apiService.getReportsDistribution(),
      ]);

      const hrSummary = hrSummaryRes?.data ?? hrSummaryRes ?? {};
      const reportsSummary = reportsSummaryRes?.data ?? reportsSummaryRes ?? {};

      setSummary({
        totalEmployees: hrSummary.totalEmployees ?? 0,
        onLeaveToday: hrSummary.onLeaveToday ?? 0,
        pendingRequests: reportsSummary.pendingRequests ?? 0,
        // Real YTD utilization (days used / days entitled). This used to be
        // fed the approval rate, which is a different number.
        leaveUtilizationPct: reportsSummary.utilizationPct ?? null,
      });

      setTrend(buildSixMonthLeaveTrend(leaveRequests));

      const deptData = (deptRes?.data ?? deptRes ?? []).map((d) => ({
        departmentName: d.departmentName,
        totalEmployees: d.totalEmployees,
        totalLeaveDays: d.totalLeaveDays,
        utilizationPct: d.utilizationPct ?? 0,
      }));
      setDepartments(deptData);

      setApprovals(approvalsRes?.data ?? approvalsRes ?? []);

      const distributionData = distributionRes?.data ?? distributionRes ?? {};
      setDistribution(distributionData.items ?? []);
      setDistributionTotal(distributionData.total ?? 0);
    } catch (err) {
      // Not falling back to sample numbers: a failed load should look like
      // one, not like a plausible-looking (fake) dashboard.
      setError(err.message || 'Failed to load HR dashboard data.');
      setSummary(null);
      setTrend([]);
      setDistribution([]);
      setDistributionTotal(0);
      setDepartments([]);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const hrUserId = user?.id;
  const loadPendingWithManagers = useCallback(async () => {
    if (USE_MOCK) {
      setPendingWithManagers([]);
      setPendingLoading(false);
      return;
    }
    setPendingLoading(true);
    setPendingError('');
    try {
      const [slaRes, pending] = await Promise.all([
        apiService.getApprovalSlaSettings().catch(() => null),
        fetchPendingWithManagers(hrUserId),
      ]);
      const sla = slaRes?.data ?? slaRes;
      const windowDays = sla?.urgentWindowDays ?? null;
      setUrgentWindowDays(windowDays);
      const rows = pending
        .map((r) => ({ ...r, urgent: r.urgent ?? isUrgentLeave(r.startDate, windowDays) }))
        // Urgent first (closest to escalating), then earliest start date.
        .sort((a, b) => {
          if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
          return String(a.startDate).localeCompare(String(b.startDate));
        });
      setPendingWithManagers(rows);
    } catch (err) {
      setPendingError(err.message || 'Failed to load pending requests.');
      setPendingWithManagers([]);
    } finally {
      setPendingLoading(false);
    }
  }, [hrUserId]);

  useEffect(() => {
    loadPendingWithManagers();
  }, [loadPendingWithManagers]);

  const handleNotifyConfirm = async (message) => {
    if (!notifyTarget) return;
    setNotifySubmitting(true);
    setNotifyError('');
    try {
      const res = await apiService.notifyManagerAboutRequest(notifyTarget.id, message);
      const updated = res?.data ?? res ?? {};
      setPendingWithManagers((prev) =>
        prev.map((r) =>
          r.id === notifyTarget.id
            ? {
                ...r,
                hrNotified: true,
                hrNotifiedAt: updated.hrNotifiedAt ?? new Date().toISOString(),
                hrNotificationMessage: updated.hrNotificationMessage ?? r.hrNotificationMessage,
              }
            : r
        )
      );
      setNotifySuccess(`${notifyTarget.currentApproverName || 'The manager'} has been notified.`);
      setNotifyTarget(null);
    } catch (err) {
      setNotifyError(err.message || 'Failed to notify the manager.');
    } finally {
      setNotifySubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleExportReport = async () => {
    if (exporting) return;
    setExporting(true);

    if (USE_MOCK) {
      setTimeout(() => setExporting(false), 1200);
      return;
    }

    try {
      // The backend now builds the file synchronously and returns it ready
      // as a data: URL — there's no job id to poll any more (this used to
      // poll for a downloadUrl that never arrived, then report a timeout).
      const res = await apiService.exportReport({ reportType: 'LEAVE_SUMMARY', format: 'csv' });
      const downloadUrl = res?.downloadUrl ?? res?.data?.downloadUrl;
      const filename = res?.filename ?? res?.data?.filename ?? 'leave-summary-report.csv';
      if (!downloadUrl) throw new Error('Export did not return a file.');

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading HR dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="HR Dashboard"
      subtitle="Organization-wide leave overview, workforce status, and approval activity"
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      dateLabel={formatToday()}
      badgeCounts={{ notifications: summary?.pendingRequests || 0 }}
      user={user}
      notificationCount={summary?.pendingRequests || 0}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}
      {notifySuccess && <div className="hr-dashboard-success-banner">{notifySuccess}</div>}

      <div className="hr-dashboard-header-row">
        <div />
        <button className="hr-export-btn" onClick={handleExportReport} disabled={exporting}>
          <DownloadIcon width={16} height={16} />
          {exporting ? 'Generating...' : 'Export Report'}
        </button>
      </div>

      <div className="dashboard-stats-row">
        <StatCard
          variant="detailed"
          icon={UsersIcon}
          label="Total Employees"
          value={summary?.totalEmployees ?? 0}
          sublabel="Active and inactive"
        />
        <StatCard
          variant="detailed"
          icon={ClockIcon}
          iconClass="icon-green"
          label="On Leave Today"
          value={summary?.onLeaveToday ?? 0}
          sublabel="Approved leave covering today"
        />
        <StatCard
          variant="detailed"
          icon={HourglassIcon}
          iconClass="icon-amber"
          label="Pending Requests"
          value={summary?.pendingRequests ?? 0}
          sublabel="across all departments"
          sublabelTone="warning"
        />
        <StatCard
          variant="detailed"
          icon={ClipboardListIcon}
          iconClass="icon-purple"
          label="Leave Utilization"
          value={summary?.leaveUtilizationPct != null ? `${summary.leaveUtilizationPct}%` : '—'}
          sublabel="YTD entitlement used"
        />
      </div>

      <div className="hr-charts-row">
        <div className="dashboard-panel">
          <div className="widget-header">
            <div>
              <h3>Leave Trend Overview</h3>
              <p className="hr-panel-subtitle">Organization-wide leave requests · Last 6 months</p>
            </div>
          </div>
          <HRLeaveTrendChart data={trend} />
        </div>
        <div className="dashboard-panel">
          <div className="widget-header">
            <div>
              <h3>Leave Distribution by Type</h3>
              <p className="hr-panel-subtitle">Approved leave days · YTD</p>
            </div>
          </div>
          <LeaveDistributionChart
            data={distribution}
            legendFormat="percent"
            centerValue={distributionTotal}
            centerLabel="days"
          />
        </div>
      </div>

      <div className="hr-bottom-row">
        <div className="dashboard-panel">
          <DepartmentSummaryTable rows={departments} />
        </div>
        <div className="dashboard-panel">
          <PendingApprovalsWidget
            approvals={approvals}
            subtitle="Requires attention"
            meta="days"
            ctaLabel="View Approval Queue →"
            ctaPath="/hr/employees"
            viewAllPath="/hr/employees"
          />
        </div>
        <div className="dashboard-panel">
          <HRQuickActions onExportReport={handleExportReport} exporting={exporting} />
        </div>
      </div>

      <div className="dashboard-panel hr-pending-managers-panel">
        <PendingWithManagersWidget
          requests={pendingWithManagers}
          urgentWindowDays={urgentWindowDays}
          loading={pendingLoading}
          error={pendingError}
          onNotify={(req) => {
            setNotifyError('');
            setNotifySuccess('');
            setNotifyTarget(req);
          }}
        />
      </div>

      {notifyTarget && (
        <NotifyManagerModal
          request={notifyTarget}
          onCancel={() => setNotifyTarget(null)}
          onConfirm={handleNotifyConfirm}
          submitting={notifySubmitting}
          error={notifyError}
        />
      )}
    </DashboardLayout>
  );
};

export default HRDashboard;
