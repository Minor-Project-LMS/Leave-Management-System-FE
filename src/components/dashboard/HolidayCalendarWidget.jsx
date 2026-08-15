import { useState } from 'react';
import { getMonthMatrix, getMonthName, getWeekdayLabels, formatShortDate } from '../../utils/date';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import './HolidayCalendarWidget.css';

const HolidayCalendarWidget = ({ holidays = [] }) => {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const weeks = getMonthMatrix(cursor.year, cursor.month);
  const holidayDates = new Set(holidays.map((h) => h.date));

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

  return (
    <div className="holiday-widget">
      <div className="holiday-calendar">
        <div className="holiday-calendar-header">
          <span>
            {getMonthName(cursor.month)} {cursor.year}
          </span>
          <div className="holiday-calendar-nav">
            <button onClick={() => goToMonth(-1)} aria-label="Previous month">
              <ChevronLeftIcon width={16} height={16} />
            </button>
            <button onClick={() => goToMonth(1)} aria-label="Next month">
              <ChevronRightIcon width={16} height={16} />
            </button>
          </div>
        </div>

        <div className="holiday-calendar-weekdays">
          {getWeekdayLabels().map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="holiday-calendar-grid">
          {weeks.flat().map((cell, i) => (
            <div
              key={i}
              className={`holiday-calendar-cell ${cell?.isToday ? 'is-today' : ''} ${
                cell && holidayDates.has(cell.dateKey) ? 'is-holiday' : ''
              }`}
            >
              {cell?.day || ''}
            </div>
          ))}
        </div>
      </div>

      <div className="holiday-upcoming">
        <h4>Upcoming Holidays</h4>
        <ul>
          {holidays.length === 0 && <li className="holiday-upcoming-empty">No upcoming holidays.</li>}
          {holidays.map((h) => (
            <li key={h.name}>
              <span className="holiday-dot" />
              <div>
                <span className="holiday-name">{h.name}</span>
                <span className="holiday-date">
                  {formatShortDate(h.date)} · {h.day}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HolidayCalendarWidget;
