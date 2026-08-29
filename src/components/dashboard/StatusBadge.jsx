import './StatusBadge.css';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  Available: 'status-available',
  'On Leave': 'status-onleave',
  'Half Day': 'status-halfday',
};

// showDot: renders a small leading dot indicator — used on the Team Members
// table where status reads as a live state (Available/On Leave/Half Day)
// rather than a one-time decision outcome (Pending/Approved/Rejected).
const StatusBadge = ({ status, showDot = false }) => (
  <span className={`status-badge ${STATUS_CLASS[status] || 'status-default'}`}>
    {showDot && <span className="status-badge-dot" />}
    {status}
  </span>
);

export default StatusBadge;
