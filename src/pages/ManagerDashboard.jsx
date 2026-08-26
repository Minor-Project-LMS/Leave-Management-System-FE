import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import LeaveTrendChart from '../components/dashboard/LeaveTrendChart';
import LeaveDistributionChart from '../components/dashboard/LeaveDistributionChart';
import PendingApprovalsWidget from '../components/manager/PendingApprovalsWidget';
import TeamLeaveOverviewTable from '../components/manager/TeamLeaveOverviewTable';
import UpcomingLeavesWidget from '../components/manager/UpcomingLeavesWidget';
import ManagerQuickActions from '../components/manager/ManagerQuickActions';
import NoteCard from '../components/manager/NoteCard';
import { UsersIcon, HourglassIcon, CalendarIcon, ClockIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MANAGER_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import {
  mockManagerSummary,
  mockManagerTrend,
  mockManagerDistribution,
  mockPendingApprovals,
  mockTeamLeaveOverview,
  mockUpcomingTeamLeaves,
} from '../utils/mockData';
import './ManagerDashboard.css';

const USE_MOCK = env.useMockData;

const formatToday = () =>
  new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' });

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('manager');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [teamOverview, setTeamOverview] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setSummary(mockManagerSummary);
      setTrend(mockManagerTrend);
      setDistribution(mockManagerDistribution);
      setApprovals(mockPendingApprovals);
      setTeamOverview(mockTeamLeaveOverview);
      setUpcomingLeaves(mockUpcomingTeamLeaves);
      setLoading(false);
      return;
    }

    try {
      const [summaryRes, trendRes, distributionRes, approvalsRes, overviewRes, upcomingRes] =
        await Promise.all([
          apiService.getManagerSummary(),
          apiService.getTeamLeaveTrend(),
          apiService.getTeamLeaveDistribution(),
          apiService.getPendingApprovals(5),
          apiService.getTeamLeaveOverview(),
          apiService.getUpcomingTeamLeaves(5),
        ]);

      setSummary(summaryRes?.data ?? summaryRes);
      setTrend(trendRes?.data ?? trendRes ?? []);
      setDistribution(distributionRes?.data ?? distributionRes ?? []);
      setApprovals(approvalsRes?.data ?? approvalsRes ?? []);
      setTeamOverview(overviewRes?.data ?? overviewRes ?? []);
      setUpcomingLeaves(upcomingRes?.data ?? upcomingRes ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load manager dashboard data.');
      setSummary(mockManagerSummary);
      setTrend(mockManagerTrend);
      setDistribution(mockManagerDistribution);
      setApprovals(mockPendingApprovals);
      setTeamOverview(mockTeamLeaveOverview);
      setUpcomingLeaves(mockUpcomingTeamLeaves);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading manager dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Manager Dashboard"
      breadcrumbs={[{ label: 'Dashboard', path: '/manager/dashboard' }, { label: 'Manager Dashboard' }]}
      dateLabel={formatToday()}
      portalLabel={MANAGER_PORTAL.portalLabel}
      navItems={MANAGER_PORTAL.navItems}
      searchPlaceholder={MANAGER_PORTAL.searchPlaceholder}
      badgeCounts={{ approvals: summary?.pendingApprovals || 0 }}
      user={user}
      notificationCount={summary?.pendingApprovals || 0}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <div className="manager-welcome">
        <h2>Welcome back, {(user?.name || 'there').split(' ')[0]}! 👋</h2>
        <p>Here's what's happening with your team today.</p>
      </div>

      <div className="dashboard-stats-row">
        <StatCard
          icon={UsersIcon}
          iconClass=""
          label="Total Team Size"
          value={summary?.totalTeamSize ?? 0}
          sublabel={`${summary?.activeEmployees ?? 0} Active Employees`}
        />
        <StatCard
          icon={HourglassIcon}
          iconClass="icon-amber"
          label="Pending Approvals"
          value={summary?.pendingApprovals ?? 0}
          sublabel="Needs your action"
        />
        <StatCard
          icon={CalendarIcon}
          iconClass="icon-purple"
          label="Leaves This Month"
          value={summary?.leavesThisMonth ?? 0}
          sublabel={`+${summary?.leavesThisMonthChangePct ?? 0}% vs last month`}
        />
        <StatCard
          icon={ClockIcon}
          iconClass="icon-green"
          label="Available Balance (Avg)"
          value={`${summary?.availableBalanceAvg ?? 0} Days`}
          sublabel="Days per employee"
        />
      </div>

      <div className="manager-charts-row">
        <div className="dashboard-panel">
          <div className="widget-header">
            <h3>Leave Trend (Last 6 Months)</h3>
          </div>
          <LeaveTrendChart data={trend} />
        </div>
        <div className="dashboard-panel">
          <div className="widget-header">
            <h3>Leave by Type This Month</h3>
          </div>
          <LeaveDistributionChart data={distribution} />
        </div>
      </div>

      <div className="manager-mid-row">
        <div className="dashboard-panel manager-overview-panel">
          <TeamLeaveOverviewTable rows={teamOverview} />
        </div>
        <div className="dashboard-panel">
          <UpcomingLeavesWidget leaves={upcomingLeaves} />
        </div>
      </div>

      <div className="manager-bottom-row">
        <div className="dashboard-panel">
          <PendingApprovalsWidget approvals={approvals} />
        </div>
        <div className="dashboard-panel">
          <ManagerQuickActions />
          <NoteCard>
            You can approve or reject leave requests from Approval Inbox.
          </NoteCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
