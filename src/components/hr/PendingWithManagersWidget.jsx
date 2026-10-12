import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import { getEmployeeName } from '../../utils/employee';
import './PendingWithManagersWidget.css';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '—';

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '';

// Pending requests still sitting with a manager. HR notifies the manager
// first (the step before escalation); urgent ones — leave starting within
// the SLA urgent window — are the ones that will actually escalate.
const PendingWithManagersWidget = ({ requests = [], urgentWindowDays, onNotify, loading, error }) => (
  <div className="pending-managers">
    <div className="widget-header">
      <div>
        <h3>Pending with Managers</h3>
        <p className="hr-panel-subtitle">
          Notify the manager before a request escalates
          {urgentWindowDays != null ? ` · urgent = starts within ${urgentWindowDays} day(s)` : ''}
        </p>
      </div>
    </div>

    {error && <p className="pending-managers-error">{error}</p>}

    {loading ? (
      <p className="widget-empty">Loading pending requests...</p>
    ) : requests.length === 0 ? (
      <p className="widget-empty">No requests waiting on managers.</p>
    ) : (
      <ul className="pending-managers-list">
        {requests.map((req) => {
          const name = getEmployeeName(req);
          const color = getAvatarColor(name);
          return (
            <li
              key={req.id}
              className={`pending-managers-row${req.urgent ? ' is-urgent' : ''}`}
            >
              <span className="pending-managers-avatar" style={{ background: color.bg, color: color.fg }}>
                {getInitials(name)}
              </span>
              <div className="pending-managers-info">
                <span className="pending-managers-name">
                  {name || '—'}
                  {req.urgent && <span className="pending-managers-chip urgent">URGENT</span>}
                  {req.hrNotified && (
                    <span
                      className="pending-managers-chip notified"
                      title={req.hrNotificationMessage || undefined}
                    >
                      NOTIFIED {formatDateTime(req.hrNotifiedAt)}
                    </span>
                  )}
                </span>
                <span className="pending-managers-meta">
                  {req.categoryName} · {formatDate(req.startDate)} – {formatDate(req.endDate)} · with{' '}
                  {req.currentApproverName || 'unassigned'}
                </span>
              </div>
              <button
                type="button"
                className="pending-managers-btn"
                onClick={() => onNotify(req)}
                disabled={!req.currentApproverId}
                title={req.currentApproverId ? undefined : 'This request has no current approver'}
              >
                {req.hrNotified ? 'Re-notify' : 'Notify'}
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default PendingWithManagersWidget;
