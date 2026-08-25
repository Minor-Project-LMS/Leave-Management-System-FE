import { useState } from 'react';
import { XIcon } from '../icons/Icons';
import './RejectReasonModal.css';

const RejectReasonModal = ({ request, onCancel, onConfirm, submitting }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!comment.trim()) {
      setError('A reason is required to reject a request.');
      return;
    }
    onConfirm(comment.trim());
  };

  return (
    <div className="reject-modal-backdrop" onClick={onCancel}>
      <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reject-modal-header">
          <h3>Reject Request</h3>
          <button onClick={onCancel} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        <p className="reject-modal-subtitle">
          Rejecting <strong>{request?.employeeName}</strong>'s {request?.categoryName?.toLowerCase()} request
          for {request?.totalDays} day{request?.totalDays === 1 ? '' : 's'}. Please provide a reason.
        </p>

        <textarea
          className="reject-modal-textarea"
          placeholder="Reason for rejection..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (error) setError('');
          }}
          rows={4}
          maxLength={2000}
          autoFocus
        />
        {error && <span className="reject-modal-error">{error}</span>}

        <div className="reject-modal-actions">
          <button className="reject-modal-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="reject-modal-confirm" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Rejecting...' : 'Reject Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReasonModal;
