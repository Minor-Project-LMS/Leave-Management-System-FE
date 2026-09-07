import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import ReportsFilterBar from '../components/hr/ReportsFilterBar';
import ReportsCategoryTrendChart from '../components/hr/ReportsCategoryTrendChart';
import ReportsDistributionChart from '../components/hr/ReportsDistributionChart';
import LeaveByMonthBarChart from '../components/hr/LeaveByMonthBarChart';
import TopEmployeesList from '../components/hr/TopEmployeesList';
import InsightsCard from '../components/hr/InsightsCard';
import QuickReportsList from '../components/hr/QuickReportsList';
import DepartmentLeaveSummary from '../components/hr/DepartmentLeaveSummary';
import { ClipboardListIcon, UsersIcon, TrendUpIcon, CheckCircleIcon, HourglassIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import {
  mockReportsSummary,
  mockMonthlyLeaveTrend,
  mockCategoryTrend,
  mockReportsDistribution,
  mockReportsDistributionTotal,
  mockTopEmployees,
  mockDepartmentSummary,
  mockDepartments,
} from '../utils/mockData';
import './HRReportsAnalytics.css';

const USE_MOCK = env.useMockData;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const currentYearRange = () => {
  const year = new Date().getFullYear();
  return { from: `${year}-01-01`, to: `${year}-12-31` };
};

const HRReportsAnalytics = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');
  const pollRef = useRef(null);

  const initialRange = currentYearRange();
  const [reportType, setReportType] = useState('All');
  const [dateFrom, setDateFrom] = useState(initialRange.from);
  const [dateTo, setDateTo] = useState(initialRange.to);
  const [departmentId, setDepartmentId] = useState(null);
  const [location, setLocation] = useState('All');

  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [departmentSummary, setDepartmentSummary] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingType, setExportingType] = useState(null);

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

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setSummary(mockReportsSummary);
      setMonthlyTrend(mockMonthlyLeaveTrend);
      setDepartmentSummary(mockDepartmentSummary);
      setTopEmployees(mockTopEmployees);
      setLoading(false);
      return;
    }

    try {
      const [summaryRes, trendRes, deptRes, topRes] = await Promise.all([
        apiService.getReportsSummary({
          dateFrom,
          dateTo,
          ...(departmentId ? { departmentId } : {}),
        }),
        apiService.getHRLeaveTrend({ year: new Date(dateFrom).getFullYear(), departmentId }),
        apiService.getDepartmentSummary({ dateFrom, dateTo }),
        apiService.getTopEmployees({ dateFrom, dateTo, limit: 5 }),
      ]);

      setSummary(summaryRes?.data ?? summaryRes ?? {});
      setMonthlyTrend(trendRes?.data ?? trendRes ?? []);
      setDepartmentSummary(deptRes?.data ?? deptRes ?? []);
      setTopEmployees(topRes?.data ?? topRes ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reports data.'));
      setSummary(mockReportsSummary);
      setMonthlyTrend(mockMonthlyLeaveTrend);
      setDepartmentSummary(mockDepartmentSummary);
      setTopEmployees(mockTopEmployees);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, departmentId]);

  useEffect(() => {
    loadReports();
    return () => clearInterval(pollRef.current);
  }, [loadReports]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const runExport = (type) => {
    if (exportingType) return;
    setExportingType(type);

    if (USE_MOCK) {
      setTimeout(() => setExportingType(null), 1200);
      return;
    }

    apiService
      .exportReport({ reportType: type, format: 'xlsx', dateFrom, dateTo, departmentId: departmentId || undefined })
      .then((res) => {
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
              setExportingType(null);
              window.open(downloadUrl, '_blank');
            } else if (status === 'FAILED' || attempts > 15) {
              clearInterval(pollRef.current);
              setExportingType(null);
              setError('Report export failed or timed out.');
            }
          } catch {
            clearInterval(pollRef.current);
            setExportingType(null);
            setError('Report export failed.');
          }
        }, 2000);
      })
      .catch((err) => {
        setExportingType(null);
        setError(getErrorMessage(err, 'Failed to start report export.'));
      });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Reports &amp; Analytics...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Reports & Analytics"
      breadcrumbs={[{ label: 'HR Dashboard', path: '/hr/dashboard' }, { label: 'Reports & Analytics' }]}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <ReportsFilterBar
        reportType={reportType}
        onReportTypeChange={setReportType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        departmentId={departmentId}
        onDepartmentChange={setDepartmentId}
        departments={departments}
        location={location}
        onLocationChange={setLocation}
        onExport={() => runExport(reportType === 'All' ? 'LEAVE_SUMMARY' : reportType.toUpperCase().replace(/\s+/g, '_'))}
        exporting={!!exportingType}
      />

      <div className="reports-stats-row">
        <StatCard variant="detailed" icon={ClipboardListIcon} label="Total Leaves" value={summary?.totalLeavesTaken ?? 0} sublabel="Taken this period" />
        <StatCard variant="detailed" icon={UsersIcon} iconClass="icon-green" label="Active Employees" value={summary?.totalEmployees ?? 0} sublabel="Org-wide" />
        <StatCard variant="detailed" icon={TrendUpIcon} iconClass="icon-amber" label="Avg Leaves/Employee" value={summary?.avgLeavePerEmployee ?? 0} sublabel="This period" />
        <StatCard
          variant="detailed"
          icon={CheckCircleIcon}
          iconClass="icon-purple"
          label="Leave Approval Rate"
          value={summary?.approvalRate != null ? `${summary.approvalRate}%` : '—'}
          sublabel="vs last period"
          sublabelTone="positive"
        />
        <StatCard variant="detailed" icon={HourglassIcon} iconClass="icon-red" label="Pending Requests" value={summary?.pendingRequests ?? 0} sublabel="Awaiting action" sublabelTone="warning" />
      </div>

      <div className="reports-layout">
        <div className="reports-main">
          <div className="reports-charts-row">
            <div className="dashboard-panel">
              <div className="widget-header">
                <div>
                  <h3>Leave Trend Overview</h3>
                  <p className="hr-panel-subtitle">By leave type · This period</p>
                </div>
              </div>
              <ReportsCategoryTrendChart data={mockCategoryTrend} />
            </div>
            <div className="dashboard-panel">
              <div className="widget-header">
                <h3>Leave Distribution by Type</h3>
              </div>
              <ReportsDistributionChart data={mockReportsDistribution} total={mockReportsDistributionTotal} />
            </div>
          </div>

          <div className="reports-charts-row">
            <div className="dashboard-panel">
              <div className="widget-header">
                <h3>Leave by Month (Summary)</h3>
              </div>
              <LeaveByMonthBarChart data={monthlyTrend} />
            </div>
            <div className="dashboard-panel">
              <div className="widget-header">
                <h3>Top 5 Employees by Leaves Taken</h3>
              </div>
              <TopEmployeesList employees={topEmployees} />
            </div>
          </div>

          {summary?.insights?.length > 0 && <InsightsCard insights={summary.insights} />}
        </div>

        <div className="reports-sidebar">
          <div className="dashboard-panel">
            <QuickReportsList onSelect={runExport} exportingType={exportingType} />
          </div>
          <div className="dashboard-panel">
            <DepartmentLeaveSummary departments={departmentSummary} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRReportsAnalytics;
