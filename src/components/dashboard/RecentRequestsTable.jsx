import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import './RecentRequestsTable.css';

const RecentRequestsTable = ({ requests = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="recent-requests">
      <div className="widget-header">
        <h3>My Recent Requests</h3>
        <button className="widget-view-all" onClick={() => navigate('/my-requests')}>
          View All
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="widget-empty">No requests yet.</p>
      ) : (
        <ul className="recent-requests-list">
          {requests.map((req) => (
            <li key={req.id} className="recent-requests-row">
              <div className="recent-requests-info">
                <span className="recent-requests-id">{req.id}</span>
                <span className="recent-requests-type">{req.type}</span>
                <span className="recent-requests-dates">{req.dateRange}</span>
              </div>
              <StatusBadge status={req.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentRequestsTable;
