import { useNavigate } from 'react-router-dom';
import StatusBadge from '../dashboard/StatusBadge';
import './PendingApprovalsWidget.css';

const getInitials = (name = '') =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const PendingApprovalsWidget = ({ approvals = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="pending-approvals">
      <div className="widget-header">
        <h3>Pending Approvals</h3>
        <button className="widget-view-all" onClick={() => navigate('/manager/approval-inbox')}>
          View All
        </button>
      </div>

      {approvals.length === 0 ? (
        <p className="widget-empty">No pending approvals.</p>
      ) : (
        <ul className="pending-approvals-list">
          {approvals.map((req) => (
            <li key={req.id} className="pending-approvals-row">
              <div className="pending-approvals-avatar">{getInitials(req.name)}</div>
              <div className="pending-approvals-info">
                <span className="pending-approvals-name">{req.name}</span>
                <span className="pending-approvals-meta">
                  {req.type} · {req.dateRange}
                </span>
              </div>
              <StatusBadge status="Pending" />
            </li>
          ))}
        </ul>
      )}

      <button className="pending-approvals-cta" onClick={() => navigate('/manager/approval-inbox')}>
        Go to Approval Inbox
      </button>
    </div>
  );
};

export default PendingApprovalsWidget;
