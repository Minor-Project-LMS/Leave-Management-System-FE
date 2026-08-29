import { getMonthMatrix, getWeekdayLabels } from '../../utils/date';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import './TeamCalendarGrid.css';

const CODE_CLASS = {
  CL: 'day-entry-blue',
  SL: 'day-entry-green',
  EL: 'day-entry-amber',
  CO: 'day-entry-purple',
};

const WEEKEND_INDEXES = new Set([0, 6]); // Sun, Sat

const TeamCalendarGrid = ({ year, month, daysByDate = {}, showWeekends = true }) => {
  const weeks = getMonthMatrix(year, month);
  const weekdayLabels = getWeekdayLabels();
  const visibleIndexes = weekdayLabels
    .map((_, i) => i)
    .filter((i) => showWeekends || !WEEKEND_INDEXES.has(i));

  return (
    <div
      className="team-calendar-grid"
      style={{ gridTemplateColumns: `repeat(${visibleIndexes.length}, 1fr)` }}
    >
      {visibleIndexes.map((i) => (
        <div key={weekdayLabels[i]} className={`team-calendar-weekday ${WEEKEND_INDEXES.has(i) ? 'is-weekend' : ''}`}>
          {weekdayLabels[i]}
        </div>
      ))}

      {weeks.flatMap((week, weekIdx) =>
        visibleIndexes.map((colIdx) => {
          const cell = week[colIdx];
          const key = `${weekIdx}-${colIdx}`;

          if (!cell) {
            return <div key={key} className="team-calendar-cell is-empty" />;
          }

          const dayInfo = daysByDate[cell.dateKey];
          const entries = dayInfo?.entries || [];
          const holiday = dayInfo?.holiday;
          const isWeekend = WEEKEND_INDEXES.has(colIdx);
          const visibleEntries = entries.slice(0, 2);
          const extraCount = entries.length - visibleEntries.length;

          return (
            <div
              key={key}
              className={`team-calendar-cell ${cell.isToday ? 'is-today' : ''} ${
                holiday ? 'is-holiday' : ''
              } ${isWeekend && !holiday ? 'is-weekend' : ''}`}
            >
              <span className="team-calendar-day-number">{cell.day}</span>

              {holiday && <span className="team-calendar-holiday-label">{holiday.name} (Holiday)</span>}

              {visibleEntries.length > 0 && (
                <div className="team-calendar-entries">
                  {visibleEntries.map((entry) => {
                    const code = entry.categoryCode || (entry.categoryName || '').slice(0, 2).toUpperCase();
                    const color = getAvatarColor(entry.fullName);
                    return (
                      <div key={`${entry.userId}-${entry.categoryId}`} className={`team-calendar-entry ${CODE_CLASS[code] || 'day-entry-default'}`}>
                        <span className="team-calendar-entry-avatar" style={{ background: color.bg, color: color.fg }}>
                          {getInitials(entry.fullName)}
                        </span>
                        <span className="team-calendar-entry-name">{entry.fullName}</span>
                        <span className="team-calendar-entry-code">{code}</span>
                      </div>
                    );
                  })}
                  {extraCount > 0 && <span className="team-calendar-entry-more">+{extraCount} more</span>}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TeamCalendarGrid;
