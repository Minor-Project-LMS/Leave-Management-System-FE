import { useNavigate } from 'react-router-dom';
import './UpcomingLeavesWidget.css';

const UpcomingLeavesWidget = ({ leaves = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="upcoming-leaves">
      <div className="widget-header">
        <h3>Upcoming Leaves</h3>
        <button className="widget-view-all" onClick={() => navigate('/manager/team-calendar')}>
          View calendar
        </button>
      </div>

      {leaves.length === 0 ? (
        <p className="widget-empty">No upcoming leaves.</p>
      ) : (
        <ul className="upcoming-leaves-list">
          {leaves.map((leave, i) => (
            <li key={i} className="upcoming-leaves-row">
              <div className="upcoming-leaves-date">
                <span className="upcoming-leaves-day">{leave.day}</span>
                <span className="upcoming-leaves-month">{leave.month}</span>
              </div>
              <div className="upcoming-leaves-info">
                <span className="upcoming-leaves-name">{leave.name}</span>
                <span className="upcoming-leaves-meta">
                  {leave.type} · {leave.dateRange}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingLeavesWidget;
