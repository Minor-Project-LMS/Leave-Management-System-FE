import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { getMonthMatrix, getMonthName, getWeekdayLabels, formatShortDate } from '../utils/date';
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, PlusIcon, XIcon } from '../components/icons/Icons';
import './HolidayCalendar.css';

const USE_MOCK = env.useMockData;

const mockHolidays = [
  { id: 1, name: 'Labour Day', date: '2024-05-01', restricted: false, recurring: false },
  { id: 2, name: 'Buddha Purnima', date: '2024-05-21', restricted: false, recurring: false },
  { id: 3, name: 'Id-Ul-Fitr', date: '2024-05-30', restricted: false, recurring: false },
  { id: 4, name: 'Independence Day', date: '2024-08-15', restricted: false, recurring: false },
  { id: 5, name: 'Janmashtami', date: '2024-08-26', restricted: false, recurring: false },
  { id: 6, name: 'Gandhi Jayanti', date: '2024-10-02', restricted: false, recurring: false },
];

const HolidayTypeConfig = {
  NATIONAL: { color: '#ef4444', label: 'National Holiday', bg: '#fef2f2' },
  FESTIVAL: { color: '#3b82f6', label: 'Festival', bg: '#eff6ff' },
  OPTIONAL: { color: '#10b981', label: 'Optional Holiday', bg: '#d1fae5' },
  COMPANY: { color: '#f59e0b', label: 'Company Holiday', bg: '#fef3c7' },
  RESTRICTED: { color: '#8b5cf6', label: 'Restricted Holiday', bg: '#f3e8ff' },
};

const HolidayCalendar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [allHolidays, setAllHolidays] = useState([]);
  const [showFullListModal, setShowFullListModal] = useState(false);
  
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [notificationCount] = useState(3);

  const normalizeHolidayData = (holiday) => {
    const dateStr = holiday.date || holiday.holidayDate;
    const date = new Date(dateStr);
    return {
      id: holiday.id,
      holidayName: holiday.name || holiday.holidayName,
      holidayDate: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      holidayType: holiday.holidayType || 'NATIONAL', // Default to NATIONAL since backend doesn't provide type
      isRestricted: holiday.restricted || holiday.isRestricted || false,
      location: holiday.location || 'All Locations', // Default since backend doesn't provide location
      name: holiday.name || holiday.holidayName,
      date: dateStr,
      restricted: holiday.restricted || holiday.isRestricted || false,
      departmentId: holiday.departmentId,
      departmentName: holiday.departmentName,
      recurring: holiday.recurring || false,
      ...holiday
    };
  };

  const loadAllHolidays = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('year', cursor.year);
      params.set('limit', 100); // Get all holidays for the year
      
      const holidaysRes = await apiService.request(`/holidays?${params.toString()}`, {
        method: 'GET',
        headers: apiService.authHeaders(),
      });
      
      const holidaysData = holidaysRes?.data ?? holidaysRes ?? [];
      const normalizedHolidays = holidaysData.map(normalizeHolidayData);
      setAllHolidays(normalizedHolidays);
    } catch (err) {
      console.error('Error loading all holidays:', err);
      setError(err.message || 'Failed to load all holidays.');
    }
  }, [cursor.year]);

  const handleViewFullList = async () => {
    setShowFullListModal(true);
    await loadAllHolidays();
  };

  const loadHolidays = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      const normalizedMock = mockHolidays.map(normalizeHolidayData);
      setHolidays(normalizedMock);
      setUpcomingHolidays(normalizedMock.slice(0, 6));
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set('year', cursor.year);
      params.set('month', cursor.month + 1);
      
      const holidaysRes = await apiService.request(`/holidays?${params.toString()}`, {
        method: 'GET',
        headers: apiService.authHeaders(),
      });
      
      const upcomingRes = await apiService.getUpcomingHolidays(cursor.month + 1, cursor.year);
      
      const holidaysData = holidaysRes?.data ?? holidaysRes ?? [];
      const upcomingData = upcomingRes ?? [];
      
      const normalizedHolidays = holidaysData.map(normalizeHolidayData);
      const normalizedUpcoming = upcomingData.map(normalizeHolidayData);
      
      setHolidays(normalizedHolidays);
      setUpcomingHolidays(normalizedUpcoming);
    } catch (err) {
      console.error('Error loading holidays:', err);
      setError(err.message || 'Failed to load holidays.');
      const normalizedMock = mockHolidays.map(normalizeHolidayData);
      setHolidays(normalizedMock);
      setUpcomingHolidays(normalizedMock.slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, [cursor.year, cursor.month]);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToToday = () => {
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
  };

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

  const weeks = getMonthMatrix(cursor.year, cursor.month);
  const holidayMap = new Map();
  holidays.forEach((h) => {
    const dateKey = h.holidayDate || h.date;
    // Ensure the date key is in YYYY-MM-DD format
    const normalizedDateKey = dateKey;
    if (!holidayMap.has(normalizedDateKey)) {
      holidayMap.set(normalizedDateKey, []);
    }
    holidayMap.get(normalizedDateKey).push(h);
  });

  const getHolidayForDate = (cell) => {
    if (!cell) return null;
    const holidayList = holidayMap.get(cell.dateKey);
    return holidayList?.[0] || null;
  };

  const formatDateFull = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getUpcomingHolidaysSorted = () => {
    const todayStr = today.toISOString().split('T')[0];
    return upcomingHolidays
      .filter(h => h.holidayDate >= todayStr)
      .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate))
      .slice(0, 6);
  };

  const sortedUpcoming = getUpcomingHolidaysSorted();

  if (loading) {
    return (
      <div className="holiday-calendar-loading">
        <div className="holiday-calendar-loading-spinner" />
        <p>Loading holiday calendar...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Holiday Calendar"
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      user={user}
      notificationCount={notificationCount}
      onLogout={handleLogout}
    >
      {error && <div className="holiday-calendar-error-banner">{error}</div>}

      <div className="holiday-calendar-page">
        <div className="holiday-calendar-main">
          <div className="calendar-header">
            <div className="calendar-header-left">
              <button className="today-button" onClick={goToToday}>
                Today
              </button>
              <div className="month-navigation">
                <button onClick={() => goToMonth(-1)} aria-label="Previous month">
                  <ChevronLeftIcon width={20} height={20} />
                </button>
                <span className="current-month">
                  {getMonthName(cursor.month)} {cursor.year}
                </span>
                <button onClick={() => goToMonth(1)} aria-label="Next month">
                  <ChevronRightIcon width={20} height={20} />
                </button>
              </div>
            </div>
            
            <div className="calendar-header-right">
              <select 
                className="location-filter"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="All Locations">All Locations</option>
                <option value="Bangalore, India">Bangalore, India</option>
              </select>
              <button className="add-to-calendar-button">
                <PlusIcon width={16} height={16} />
                Add to Calendar
              </button>
            </div>
          </div>

          <div className="calendar-grid-container">
            <div className="calendar-weekdays">
              {getWeekdayLabels().map((day) => (
                <div key={day} className="weekday-label">{day}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {weeks.flat().map((cell, i) => {
                const holiday = getHolidayForDate(cell);
                const config = holiday ? HolidayTypeConfig[holiday.holidayType] : null;
                
                return (
                  <div
                    key={i}
                    className={`calendar-cell ${cell?.isToday ? 'is-today' : ''} ${
                      cell?.isOtherMonth ? 'is-other-month' : ''
                    } ${holiday ? 'is-holiday' : ''}`}
                    style={holiday ? { '--holiday-color': config?.color, '--holiday-bg': config?.bg } : {}}
                  >
                    <span className="cell-date">{cell?.day || ''}</span>
                    {holiday && (
                      <div className="holiday-indicator">
                        <span className="holiday-dot" style={{ backgroundColor: config?.color }} />
                        <span className="holiday-name" style={{ color: config?.color }}>
                          {holiday.holidayName || holiday.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="holiday-legend">
            <div className="legend-items">
              {Object.entries(HolidayTypeConfig).map(([type, config]) => (
                <div key={type} className="legend-item">
                  <span 
                    className="legend-dot" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="legend-label">{config.label}</span>
                </div>
              ))}
            </div>
            
            <div className="location-banner">
              <InfoIcon width={16} height={16} />
              <span>
                Holidays are based on your office location - <strong>{selectedLocation}</strong>. 
              </span>
            </div>
          </div>
        </div>

        <div className="holiday-calendar-sidebar">
          <div className="upcoming-holidays-card">
            <h3>Upcoming Holidays</h3>
            <div className="upcoming-holidays-list">
              {sortedUpcoming.length === 0 ? (
                <p className="no-holidays">No upcoming holidays</p>
              ) : (
                sortedUpcoming.map((holiday) => {
                  const config = HolidayTypeConfig[holiday.holidayType];
                  const date = new Date(holiday.holidayDate || holiday.date);
                  const dayNumber = date.getDate();
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                  const dayName = holiday.day || getDayName(holiday.holidayDate || holiday.date);
                  
                  return (
                    <div key={holiday.id} className="upcoming-holiday-item">
                      <div className="holiday-date-badge">
                        <span className="badge-day">{dayNumber}</span>
                        <span className="badge-month">{monthName}</span>
                      </div>
                      <div className="holiday-details">
                        <h4>{holiday.holidayName || holiday.name}</h4>
                        <p>{dayName}, {formatDateFull(holiday.holidayDate || holiday.date)}</p>
                        <span 
                          className="holiday-type-badge"
                          style={{ 
                            backgroundColor: config?.bg, 
                            color: config?.color 
                          }}
                        >
                          {config?.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button className="view-full-list-button" onClick={handleViewFullList}>
              View Full Holiday List
            </button>
          </div>

          <div className="note-callout">
            <div className="note-header">
              <InfoIcon width={20} height={20} />
              <h4>Note</h4>
            </div>
            <p>Holidays are subject to change as per government notifications and company policy.</p>
          </div>
        </div>
      </div>

      {/* Full Holiday List Modal */}
      {showFullListModal && (
        <div className="modal-overlay" onClick={() => setShowFullListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Full Holiday List - {cursor.year}</h3>
              <button 
                className="modal-close-button" 
                onClick={() => setShowFullListModal(false)}
                aria-label="Close modal"
              >
                <XIcon width={20} height={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {allHolidays.length === 0 ? (
                <div className="no-holidays-message">
                  <p>No holidays found for {cursor.year}</p>
                </div>
              ) : (
                <div className="full-holiday-list">
                  {allHolidays
                    .sort((a, b) => new Date(a.holidayDate || a.date) - new Date(b.holidayDate || b.date))
                    .map((holiday) => {
                      const config = HolidayTypeConfig[holiday.holidayType];
                      const date = new Date(holiday.holidayDate || holiday.date);
                      const dayNumber = date.getDate();
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                      const dayName = holiday.day || getDayName(holiday.holidayDate || holiday.date);
                      
                      return (
                        <div key={holiday.id} className="full-holiday-item">
                          <div className="holiday-date-badge">
                            <span className="badge-day">{dayNumber}</span>
                            <span className="badge-month">{monthName}</span>
                          </div>
                          <div className="holiday-details">
                            <h4>{holiday.holidayName || holiday.name}</h4>
                            <p>{dayName}, {formatDateFull(holiday.holidayDate || holiday.date)}</p>
                            <span 
                              className="holiday-type-badge"
                              style={{ 
                                backgroundColor: config?.bg, 
                                color: config?.color 
                              }}
                            >
                              {config?.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HolidayCalendar;