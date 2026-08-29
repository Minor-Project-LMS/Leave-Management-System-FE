import './StatusBadge.css';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  Cancelled: 'status-cancelled',
  Withdrawn: 'status-withdrawn',
  Requested: 'status-requested',
};

const StatusBadge = ({ status }) => (
  <span className={`status-badge ${STATUS_CLASS[status] || 'status-default'}`}>{status}</span>
);

export default StatusBadge;
