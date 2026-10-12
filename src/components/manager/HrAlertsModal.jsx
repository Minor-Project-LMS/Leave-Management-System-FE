import { XIcon, AlertCircleIcon, HourglassIcon } from '../icons/Icons';
import { getEmployeeName } from '../../utils/employee';
import './HrAlertsModal.css';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Manager dashboard popup. Shows the pending requests HR has flagged
// (GET /approvals/hr-alerts) when there are any — those escalate to HR if
// not acted on — otherwise a reminder of the manager's pending approvals
// (GET /manager/approvals/pending).
const HrAlertsModal = ({ alerts = [], pendingApprovals = [], pendingCount = 0, onClose, onReview }) => {
  const isHr = alerts.length > 0;
  const total = isHr ? alerts.length : Math.max(pendingCount, pendingApprovals.length);

  return (
    <div className="hr-alerts-backdrop" onClick={onClose}>
      <div className="hr-alerts-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="hr-alerts-header">
          <div className={`hr-alerts-title${isHr ? '' : ' is-pending'}`}>
            {isHr ? <AlertCircleIcon width={20} height={20} /> : <HourglassIcon width={20} height={20} />}
            <h3>{isHr ? 'HR needs your action' : 'Pending approvals'}</h3>
          </div>
          <button onClick={onClose} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        <p className="hr-alerts-subtitle">
          {isHr ? (
            <>
              HR has flagged {plural(total, 'pending leave request')} waiting on you. Please approve or reject{' '}
              {total === 1 ? 'it' : 'them'} — otherwise {total === 1 ? 'it' : 'they'} will be escalated to HR.
            </>
          ) : total > 0 ? (
            <>You have {plural(total, 'leave request')} waiting for your approval.</>
          ) : (
            <>You're all caught up — no leave requests are waiting for your approval.</>
          )}
        </p>

        {isHr ? (
          <ul className="hr-alerts-list">
            {alerts.map((a) => (
              <li key={a.id} className="hr-alerts-item">
                <div className="hr-alerts-item-head">
                  <span className="hr-alerts-name">{getEmployeeName(a) || '—'}</span>
                  {a.urgent && <span className="hr-alerts-chip">URGENT</span>}
                </div>
                <span className="hr-alerts-meta">
                  {a.categoryName} · {formatDate(a.startDate)}
                  {a.endDate && a.endDate !== a.startDate ? ` – ${formatDate(a.endDate)}` : ''} · {a.totalDays} day
                  {Number(a.totalDays) === 1 ? '' : 's'}
                </span>
                {a.hrNotificationMessage && <p className="hr-alerts-message">“{a.hrNotificationMessage}”</p>}
                <span className="hr-alerts-from">
                  Flagged by {a.hrNotifiedByName || 'HR'}
                  {a.hrNotifiedAt ? ` · ${formatDateTime(a.hrNotifiedAt)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          pendingApprovals.length > 0 && (
            <ul className="hr-alerts-list">
              {pendingApprovals.map((p) => (
                <li key={p.id} className="hr-alerts-item is-pending">
                  <div className="hr-alerts-item-head">
                    <span className="hr-alerts-name">{p.name || '—'}</span>
                  </div>
                  <span className="hr-alerts-meta">
                    {p.type} · {p.dateRange}
                    {p.days != null ? ` · ${p.days} day${Number(p.days) === 1 ? '' : 's'}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )
        )}

        <div className="hr-alerts-actions">
          <button className="hr-alerts-later" onClick={onClose}>
            {total > 0 ? 'Remind me later' : 'Close'}
          </button>
          {total > 0 && (
            <button className="hr-alerts-review" onClick={onReview}>
              Review in Approval Inbox
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrAlertsModal;
