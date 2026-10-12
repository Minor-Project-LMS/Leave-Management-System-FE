import { useState } from 'react';
import { XIcon } from '../icons/Icons';
import { getEmployeeName } from '../../utils/employee';
import '../approvals/RejectReasonModal.css';
import './NotifyManagerModal.css';

// HR -> manager nudge (POST /approvals/{id}/notify-manager). The message is
// optional — the backend sends a default reminder when it's left blank.
const NotifyManagerModal = ({ request, onCancel, onConfirm, submitting, error }) => {
  const [message, setMessage] = useState('');
  const employeeName = getEmployeeName(request) || 'this employee';

  return (
    <div className="reject-modal-backdrop" onClick={onCancel}>
      <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reject-modal-header">
          <h3>{request?.hrNotified ? 'Re-notify Manager' : 'Notify Manager'}</h3>
          <button onClick={onCancel} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        <p className="reject-modal-subtitle">
          Remind <strong>{request?.currentApproverName || 'the approver'}</strong> about {employeeName}'s{' '}
          {request?.categoryName?.toLowerCase() || 'leave'} request starting {request?.startDate}. It will pop up on
          their dashboard and be pinned to the top of their Approval Inbox. If they still don't act within the
          grace period, it escalates to HR.
        </p>

        <textarea
          className="reject-modal-textarea notify-modal-textarea"
          placeholder="Optional message (leave blank to send the default reminder)..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={500}
          autoFocus
        />
        <span className="notify-modal-count">{message.length}/500</span>
        {error && <span className="reject-modal-error">{error}</span>}

        <div className="reject-modal-actions">
          <button className="reject-modal-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="notify-modal-confirm" onClick={() => onConfirm(message)} disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotifyManagerModal;
