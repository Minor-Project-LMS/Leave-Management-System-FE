import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import LeaveDistributionChart from '../components/dashboard/LeaveDistributionChart';
import PendingApprovalsWidget from '../components/manager/PendingApprovalsWidget';
import HRLeaveTrendChart from '../components/hr/HRLeaveTrendChart';
import DepartmentSummaryTable from '../components/hr/DepartmentSummaryTable';
import HRQuickActions from '../components/hr/HRQuickActions';
import { UsersIcon, ClockIcon, HourglassIcon, ClipboardListIcon, DownloadIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
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

const HRDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const pollRef = useRef(null);

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [distributionTotal, setDistributionTotal] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [approvals, setApprovals] = useState([]);

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
      const [hrSummaryRes, reportsSummaryRes, trendRes, deptRes, approvalsRes] = await Promise.all([
        apiService.getHRSummary(),
        apiService.getReportsSummary(),
        apiService.getHRLeaveTrend(),
        apiService.getDepartmentSummary(),
        apiService.getHRPendingApprovals(5),
      ]);

      const hrSummary = hrSummaryRes?.data ?? hrSummaryRes ?? {};
      const reportsSummary = reportsSummaryRes?.data ?? reportsSummaryRes ?? {};

      setSummary({
        totalEmployees: hrSummary.totalEmployees ?? 0,
        onLeaveToday: hrSummary.onLeaveToday ?? 0,
        pendingRequests: reportsSummary.pendingRequests ?? 0,
        // Not exposed by the backend today — see note in api.js's getHRSummary().
        leaveUtilizationPct: reportsSummary.approvalRate ?? null,
      });

      const trendData = trendRes?.data ?? trendRes ?? [];
      setTrend(trendData);

      const deptData = (deptRes?.data ?? deptRes ?? []).map((d) => ({
        departmentName: d.departmentName,
        totalEmployees: d.totalEmployees,
        totalLeaveDays: d.totalLeaveDays,
        utilizationPct: d.approvalRate ?? d.avgLeaveDaysPerEmployee ?? 0,
      }));
      setDepartments(deptData);

      setApprovals(approvalsRes?.data ?? approvalsRes ?? []);

      // Distribution isn't in the spec for HR yet — set empty for now
      setDistribution([]);
      setDistributionTotal(0);
    } catch (err) {
      setError(err.message || 'Failed to load HR dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    return () => clearInterval(pollRef.current);
  }, [loadDashboard]);

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
      const res = await apiService.exportReport({ reportType: 'LEAVE_SUMMARY', format: 'xlsx' });
      const jobId = res?.jobId ?? res?.data?.jobId;
      if (!jobId) throw new Error('Export did not return a job id.');

      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const statusRes = await apiService.getReportExportStatus(jobId);
          const status = statusRes?.status ?? statusRes?.data?.status;
          const downloadUrl = statusRes?.downloadUrl ?? statusRes?.data?.downloadUrl;

          if (status === 'READY' && downloadUrl) {
            clearInterval(pollRef.current);
            setExporting(false);
            window.open(downloadUrl, '_blank');
          } else if (status === 'FAILED' || attempts > 15) {
            clearInterval(pollRef.current);
            setExporting(false);
            setError('Report export failed or timed out.');
          }
        } catch {
          clearInterval(pollRef.current);
          setExporting(false);
          setError('Report export failed.');
        }
      }, 2000);
    } catch (err) {
      setExporting(false);
      setError(err.message || 'Failed to start report export.');
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
      badgeCounts={{ notifications: summary?.pendingRequests || 0 }}
      user={user}
      notificationCount={summary?.pendingRequests || 0}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}

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
          sublabel="vs. previous month"
          trend={{ value: summary?.totalEmployeesChangePct ?? 0, direction: 'up', tone: 'positive' }}
        />
        <StatCard
          variant="detailed"
          icon={ClockIcon}
          iconClass="icon-green"
          label="On Leave Today"
          value={summary?.onLeaveToday ?? 0}
          sublabel="of active workforce"
          trend={{ value: summary?.onLeaveTodayChangePct ?? 0, direction: 'up', tone: 'warning' }}
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
          sublabelTone="positive"
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
    </DashboardLayout>
  );
};

export default HRDashboard;
