import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/date';
import './RecentActivity.css';

const RecentActivity = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="recent-activity">
      <div className="widget-header">
        <h3>Recent Activity</h3>
        <button className="widget-view-all" onClick={() => navigate('/notifications')}>
          View All
        </button>
      </div>

      {items.length === 0 ? (
        <p className="widget-empty">No recent activity.</p>
      ) : (
        <ul className="recent-activity-list">
          {items.map((item) => (
            <li key={item.id}>
              <span className="recent-activity-dot" />
              <div className="recent-activity-body">
                <span className="recent-activity-text">{item.text}</span>
                <span className="recent-activity-time">{formatRelativeTime(item.timestamp)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
