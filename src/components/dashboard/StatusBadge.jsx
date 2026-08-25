import './StatusBadge.css';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
};

const StatusBadge = ({ status }) => (
  <span className={`status-badge ${STATUS_CLASS[status] || 'status-default'}`}>{status}</span>
);

export default StatusBadge;
