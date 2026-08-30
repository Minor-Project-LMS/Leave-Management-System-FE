import './AccountInfoCard.css';

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const STATUS_TONE = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'inactive',
  TERMINATED: 'inactive',
};

const formatStatus = (status) => {
  if (!status) return 'Active';
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
};

const AccountInfoCard = ({ profile }) => (
  <div className="account-info-card">
    <div className="widget-header">
      <h3>Account Information</h3>
    </div>

    <dl className="account-info-list">
      <div className="account-info-row">
        <dt>Username</dt>
        <dd>{profile.username}</dd>
      </div>
      <div className="account-info-row">
        <dt>Account Created</dt>
        <dd>{formatDateTime(profile.createdAt)}</dd>
      </div>
      <div className="account-info-row">
        <dt>Last Login</dt>
        <dd>{formatDateTime(profile.lastLoginAt)}</dd>
      </div>
      <div className="account-info-row">
        <dt>Account Status</dt>
        <dd>
          <span className={`account-info-status ${STATUS_TONE[profile.employmentStatus] || 'active'}`}>
            {formatStatus(profile.employmentStatus)}
          </span>
        </dd>
      </div>
    </dl>
  </div>
);

export default AccountInfoCard;
