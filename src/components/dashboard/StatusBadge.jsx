import './StatusBadge.css';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  Cancelled: 'status-cancelled',
  Withdrawn: 'status-withdrawn',
  Requested: 'status-requested',
  Expired: 'status-expired',
  PENDING: 'status-pending',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
  CANCELLED: 'status-cancelled',
  WITHDRAWN: 'status-withdrawn',
  REQUESTED: 'status-requested',
  EXPIRED: 'status-expired',
};

const StatusBadge = ({ status }) => (
  <span className={`status-badge ${STATUS_CLASS[status] || 'status-default'}`}>{status}</span>
);

export default StatusBadge;
