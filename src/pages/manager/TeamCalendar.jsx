import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CalendarLegend from '../../components/calendar/CalendarLegend';
import TeamCalendarGrid from '../../components/calendar/TeamCalendarGrid';
import TeamCalendarFilters from '../../components/calendar/TeamCalendarFilters';
import LeaveSummaryList from '../../components/manager/LeaveSummaryList';
import UpcomingLeavesWidget from '../../components/manager/UpcomingLeavesWidget';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FilterIcon,
} from '../../components/icons/Icons';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MANAGER_PORTAL } from '../../config/navConfig';
import { useRoleRedirect } from '../../hooks/useRoleRedirect';
import { env } from '../../config/env';
import { getMonthName } from '../../utils/date';
import {
  mockDepartments,
  mockLeaveCategories,
  mockLeaveSummaryCategories,
  mockTeamCalendarDays,
  mockTeamCalendarUpcoming,
} from '../../utils/mockData';
import './TeamCalendar.css';

const USE_MOCK = env.useMockData;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const formatToday = () =>
  new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' });

const TeamCalendar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('manager');

  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [view, setView] = useState('month'); // 'month' | 'week' (week is a placeholder toggle for now)

  const [departmentId, setDepartmentId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [showWeekends, setShowWeekends] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter dropdown data only needs to load once.
  useEffect(() => {
    if (USE_MOCK) {
      setDepartments(mockDepartments);
      setCategories(mockLeaveSummaryCategories);
      return;
    }
    (async () => {
      try {
        const [deptRes, catRes] = await Promise.all([
          apiService.getDepartments({ limit: 50 }),
          apiService.getLeaveCategories('ACTIVE'),
        ]);
        setDepartments(deptRes?.data ?? []);
        setCategories(catRes?.data ?? catRes ?? []);
      } catch {
        setDepartments(mockDepartments);
        setCategories(mockLeaveCategories);
      }
    })();
  }, []);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setCalendarDays(mockTeamCalendarDays);
      setLeaveSummary(mockLeaveSummaryCategories);
      setUpcomingLeaves(mockTeamCalendarUpcoming);
      setLoading(false);
      return;
    }

    try {
      const [calRes, summaryRes, upcomingRes] = await Promise.all([
        apiService.getTeamCalendar({
          month: cursor.month + 1,
          year: cursor.year,
          departmentId,
          categoryId,
          showWeekends,
        }),
        apiService.getTeamLeaveSummary({ year: cursor.year, month: cursor.month + 1 }),
        apiService.getUpcomingTeamLeaves(5),
      ]);
      setCalendarDays(calRes?.data ?? calRes ?? []);
      setLeaveSummary(summaryRes?.data ?? summaryRes ?? []);
      setUpcomingLeaves(upcomingRes?.data ?? upcomingRes ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load team calendar.'));
      setCalendarDays(mockTeamCalendarDays);
      setLeaveSummary(mockLeaveSummaryCategories);
      setUpcomingLeaves(mockTeamCalendarUpcoming);
    } finally {
      setLoading(false);
    }
  }, [cursor, departmentId, categoryId, showWeekends]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const daysByDate = useMemo(() => {
    const map = {};
    calendarDays.forEach((d) => {
      map[d.date] = d;
    });
    return map;
  }, [calendarDays]);

  const goToMonth = (delta) => {
    setCursor((prev) => {
      let month = prev.month + delta;
      let year = prev.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  };

  const goToday = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });

  const handleMonthPicker = (e) => {
    const [y, m] = e.target.value.split('-').map(Number);
    if (y && m) setCursor({ year: y, month: m - 1 });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      title="Team Calendar"
      breadcrumbs={[{ label: 'Manager Dashboard', path: '/manager/dashboard' }, { label: 'Team Calendar' }]}
      dateLabel={formatToday()}
      portalLabel={MANAGER_PORTAL.portalLabel}
      navItems={MANAGER_PORTAL.navItems}
      searchPlaceholder={MANAGER_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <div className="team-calendar-layout">
        <div className="dashboard-panel team-calendar-main">
          <div className="team-calendar-toolbar">
            <div className="team-calendar-toolbar-left">
              <button className="team-calendar-nav-btn" onClick={() => goToMonth(-1)} aria-label="Previous month">
                <ChevronLeftIcon width={16} height={16} />
              </button>
              <button className="team-calendar-nav-btn" onClick={() => goToMonth(1)} aria-label="Next month">
                <ChevronRightIcon width={16} height={16} />
              </button>
              <button className="team-calendar-today-btn" onClick={goToday}>
                Today
              </button>

              <label className="team-calendar-month-label">
                {getMonthName(cursor.month)} {cursor.year}
                <ChevronDownIcon width={14} height={14} />
                <input
                  type="month"
                  value={`${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`}
                  onChange={handleMonthPicker}
                />
              </label>
            </div>

            <div className="team-calendar-toolbar-right">
              <div className="team-calendar-view-toggle">
                <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>
                  Month
                </button>
                <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>
                  Week
                </button>
              </div>
              <button className="team-calendar-filter-btn">
                <FilterIcon width={15} height={15} />
                Filter
              </button>
            </div>
          </div>

          <CalendarLegend />

          {loading ? (
            <p className="widget-empty">Loading calendar...</p>
          ) : view === 'month' ? (
            <TeamCalendarGrid
              year={cursor.year}
              month={cursor.month}
              daysByDate={daysByDate}
              showWeekends={showWeekends}
            />
          ) : (
            <p className="widget-empty">Week view is coming soon — switch back to Month view.</p>
          )}
        </div>

        <div className="team-calendar-sidebar">
          <div className="dashboard-panel">
            <LeaveSummaryList
              title="Team Leave Summary"
              subtitle={`${getMonthName(cursor.month)} ${cursor.year}`}
              items={leaveSummary}
              showTotal
            />
          </div>

          <div className="dashboard-panel">
            <UpcomingLeavesWidget leaves={upcomingLeaves} />
          </div>

          <div className="dashboard-panel">
            <TeamCalendarFilters
              departments={departments}
              categories={categories}
              departmentId={departmentId}
              categoryId={categoryId}
              showWeekends={showWeekends}
              onDepartmentChange={setDepartmentId}
              onCategoryChange={setCategoryId}
              onShowWeekendsChange={setShowWeekends}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamCalendar;
