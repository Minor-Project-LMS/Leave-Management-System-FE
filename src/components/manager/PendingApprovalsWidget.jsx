import { useNavigate, useLocation } from 'react-router-dom';
import StatusBadge from '../dashboard/StatusBadge';
import { getAvatarColor } from '../../utils/avatarColor';
import './PendingApprovalsWidget.css';

const getInitials = (name = '') =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const PendingApprovalsWidget = ({ approvals = [], isHR = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-detect if user is on an HR route if prop isn't passed explicitly
  const isHRPortal = isHR || location.pathname.startsWith('/hr');

  // Dynamic configuration based on HR vs Manager context
  const title = isHRPortal ? 'Delegation Pending Approvals ' : 'Pending Approvals';
  const ctaText = isHRPortal ? 'Go to Delegation' : 'Go to Approval Inbox';
  const targetPath = isHRPortal ? '/hr/delegation' : '/manager/approval-inbox';

  return (
    <div className="pending-approvals">
      <div className="widget-header">
        <h3>{title}</h3>
        <button className="widget-view-all" onClick={() => navigate(targetPath)}>
          View All
        </button>
      </div>

      {approvals.length === 0 ? (
        <p className="widget-empty">No pending approvals.</p>
      ) : (
        <ul className="pending-approvals-list">
          {approvals.map((req) => {
            const color = getAvatarColor(req.name);
            return (
              <li key={req.id} className="pending-approvals-row">
                <div
                  className="pending-approvals-avatar"
                  style={{
                    background: req.avatarUrl ? 'transparent' : color.bg,
                    color: req.avatarUrl ? 'transparent' : color.fg
                  }}
                >
                  {req.avatarUrl ? (
                    <img
                      src={req.avatarUrl}
                      alt={req.name}
                      className="pending-approvals-avatar-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = color.bg;
                        e.target.parentElement.style.color = color.fg;
                        e.target.parentElement.textContent = getInitials(req.name);
                      }}
                    />
                  ) : (
                    getInitials(req.name)
                  )}
                </div>
                <div className="pending-approvals-info">
                  <span className="pending-approvals-name">{req.name}</span>
                  <span className="pending-approvals-meta">
                    {req.type} · {req.dateRange}
                  </span>
                </div>
                <StatusBadge status="Pending" />
              </li>
            );
          })}
        </ul>
      )}

      <button className="pending-approvals-cta" onClick={() => navigate(targetPath)}>
        {ctaText}
      </button>
    </div>
  );
};

export default PendingApprovalsWidget;