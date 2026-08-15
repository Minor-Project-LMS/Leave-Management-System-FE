import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import LeaveTrendChart from '../components/dashboard/LeaveTrendChart';
import LeaveDistributionChart from '../components/dashboard/LeaveDistributionChart';
import HolidayCalendarWidget from '../components/dashboard/HolidayCalendarWidget';
import RecentRequestsTable from '../components/dashboard/RecentRequestsTable';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import { CalendarIcon, ClockIcon, HourglassIcon, CoffeeIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  mockSummary,
  mockTrend,
  mockDistribution,
  mockRecentRequests,
  mockHolidays,
  mockActivity,
} from '../utils/mockData';
import './Dashboard.css';

// While the backend dashboard endpoints aren't live yet, set VITE_USE_MOCK_DATA=true
// in .env to build/preview the UI against realistic sample data.
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA).toLowerCase() === 'true';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, initializing } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [requests, setRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [activity, setActivity] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    const handleSecurityError = (error) => {
        if (isSecurityError(error)) {
          logout();
        }
      };

    if (USE_MOCK) {
      setSummary(mockSummary);
      setTrend(mockTrend);
      setDistribution(mockDistribution);
      setRequests(mockRecentRequests);
      setHolidays(mockHolidays);
      setActivity(mockActivity);
      setLoading(false);
      return;
    }

    try {
      const [summaryRes, trendRes, distributionRes, requestsRes, holidaysRes, activityRes] =
        await Promise.all([
          apiService.getDashboardSummary(),
          apiService.getLeaveTrend(),
          apiService.getLeaveDistribution(),
          apiService.getRecentRequests(5),
          apiService.getUpcomingHolidays(),
          apiService.getRecentActivity(5),
        ]);

      setSummary(summaryRes?.data ?? summaryRes);
      setTrend(trendRes?.data ?? trendRes ?? []);
      setDistribution(distributionRes?.data ?? distributionRes ?? []);
      setRequests(requestsRes?.data ?? requestsRes ?? []);
      setHolidays(holidaysRes?.data ?? holidaysRes ?? []);
      setActivity(activityRes?.data ?? activityRes ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
      // Fall back to mock data so the layout still renders something useful.
      setSummary(mockSummary);
      setTrend(mockTrend);
      setDistribution(mockDistribution);
      setRequests(mockRecentRequests);
      setHolidays(mockHolidays);
      setActivity(mockActivity);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auth is already verified by ProtectedRoute before this component
    // renders, so we only need to fetch the dashboard data here.
    if (!initializing && !isAuthenticated) {
          navigate('/login', { replace: true });
        }
    loadDashboard();
  }, [initializing, isAuthenticated, navigate,loadDashboard]);

  const handleLogout = async () => {
    await logout(); // clears in-memory access token + httpOnly refresh cookie
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Employee Dashboard"
      subtitle={`Welcome back, ${user?.name || 'there'}!`}
      user={user}
      notificationCount={activity.length}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <div className="dashboard-stats-row">
        <StatCard
          icon={CalendarIcon}
          iconClass=""
          label="Available Leave"
          value={`${summary?.availableLeave ?? 0} Days`}
          sublabel="Balance as of today"
        />
        <StatCard
          icon={ClockIcon}
          iconClass="icon-green"
          label="Used Leave"
          value={`${summary?.usedLeave ?? 0} Days`}
          sublabel="This Year"
        />
        <StatCard
          icon={HourglassIcon}
          iconClass="icon-amber"
          label="Pending Requests"
          value={summary?.pendingRequests ?? 0}
          sublabel="Awaiting Approval"
        />
        <StatCard
          icon={CoffeeIcon}
          iconClass="icon-purple"
          label="Comp-Off Balance"
          value={`${summary?.compOffBalance ?? 0} Days`}
          sublabel="Available"
        />
      </div>

      <div className="dashboard-charts-row">
        <div className="dashboard-panel">
          <div className="widget-header">
            <h3>Leave Usage Trend (This Year)</h3>
          </div>
          <LeaveTrendChart data={trend} />
        </div>
        <div className="dashboard-panel">
          <div className="widget-header">
            <h3>Leave Distribution (This Year)</h3>
          </div>
          <LeaveDistributionChart data={distribution} />
        </div>
        <div className="dashboard-panel">
          <div className="widget-header">
            <h3>Upcoming Holidays</h3>
          </div>
          <HolidayCalendarWidget holidays={holidays} />
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="dashboard-panel">
          <RecentRequestsTable requests={requests} />
        </div>
        <div className="dashboard-panel">
          <QuickActions />
        </div>
        <div className="dashboard-panel">
          <RecentActivity items={activity} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
