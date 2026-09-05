import './StatusBadge.css';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  Available: 'status-available',
  'On Leave': 'status-onleave',
  'Half Day': 'status-halfday',
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
  // Employee Management (employmentStatus) + Leave Policies (status)
  Active: 'status-available',
  Inactive: 'status-rejected',
  Draft: 'status-halfday',
  Archived: 'status-default',
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
