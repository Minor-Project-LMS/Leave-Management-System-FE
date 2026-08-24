import LeaveTypeBadge from './LeaveTypeBadge';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import { PaperclipIcon, DownloadIcon, InfoIcon } from '../icons/Icons';
import './RequestDetailPanel.css';

const formatDate = (iso, withTime = false) => {
  if (!iso) return '—';
  const opts = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' };
  return new Date(iso).toLocaleString('en-US', opts);
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

const RequestDetailPanel = ({ detail, loading }) => {
  if (loading) {
    return (
      <div className="request-detail-panel">
        <p className="widget-empty">Loading request details...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="request-detail-panel">
        <p className="widget-empty">Select a request to view details.</p>
      </div>
    );
  }

  const color = getAvatarColor(detail.employeeName);
  const employeeCode = detail.employee?.employeeCode || `EMP-${String(detail.userId).padStart(4, '0')}`;

  return (
    <div className="request-detail-panel">
      <div className="widget-header">
        <h3>Request Details</h3>
      </div>

      <div className="request-detail-employee">
        <span className="request-detail-avatar" style={{ background: color.bg, color: color.fg }}>
          {getInitials(detail.employeeName)}
        </span>
        <div>
          <span className="request-detail-name">{detail.employeeName}</span>
          <span className="request-detail-team">{detail.departmentName} · {employeeCode}</span>
        </div>
      </div>

      <dl className="request-detail-fields">
        <div>
          <dt>Leave Type</dt>
          <dd>
            <LeaveTypeBadge categoryCode={detail.categoryCode} categoryName={detail.categoryName} />
          </dd>
        </div>
        <div>
          <dt>Dates</dt>
          <dd>
            {detail.startDate === detail.endDate
              ? formatDate(detail.startDate)
              : `${formatDate(detail.startDate)} – ${formatDate(detail.endDate)}`}
          </dd>
        </div>
        <div>
          <dt>Total Days</dt>
          <dd>{detail.totalDays}</dd>
        </div>
        <div>
          <dt>Reason</dt>
          <dd>{detail.reason}</dd>
        </div>
        <div>
          <dt>Applied On</dt>
          <dd>{formatDate(detail.appliedAt, true)}</dd>
        </div>
        <div>
          <dt>Reporting Manager</dt>
          <dd>{detail.currentApproverName || '—'}</dd>
        </div>
      </dl>

      {detail.attachments?.length > 0 && (
        <div className="request-detail-section">
          <h4>Attachments</h4>
          <ul className="request-detail-attachments">
            {detail.attachments.map((att) => (
              <li key={att.id}>
                <PaperclipIcon width={14} height={14} />
                <span className="request-detail-attachment-name">{att.fileName}</span>
                <span className="request-detail-attachment-size">{formatFileSize(att.sizeBytes)}</span>
                <a href={att.downloadUrl} target="_blank" rel="noreferrer" className="request-detail-download">
                  <DownloadIcon width={14} height={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.approvals?.length > 0 && (
        <div className="request-detail-section">
          <h4>Approval History</h4>
          <ul className="request-detail-timeline">
            {detail.approvals.map((a) => (
              <li key={a.id}>
                <span className="request-detail-timeline-dot" />
                <div>
                  <span className="request-detail-timeline-label">
                    {a.decision === 'REQUESTED' || !a.decision
                      ? 'Requested'
                      : a.decision === 'APPROVED'
                      ? 'Approved'
                      : 'Rejected'}
                    {a.approverName ? ` · ${a.approverName}` : ''}
                  </span>
                  <span className="request-detail-timeline-time">{formatDate(a.decidedAt, true)}</span>
                  {a.comments && <span className="request-detail-timeline-comment">"{a.comments}"</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="request-detail-note">
        <InfoIcon width={16} height={16} />
        <p>Please review the request details before approving or rejecting.</p>
      </div>
    </div>
  );
};

export default RequestDetailPanel;
