import { useState, useRef, useEffect } from 'react';
import Pagination from '../common/Pagination';
import StatusBadge from '../dashboard/StatusBadge';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import { EyeIcon, MoreVerticalIcon } from '../icons/Icons';
import './AuditTrailTable.css';

const ACTION_COLORS = {
  CREATE: { bg: '#dcfce7', text: '#166534' },
  UPDATE: { bg: '#dbeafe', text: '#1e40af' },
  APPROVE: { bg: '#dcfce7', text: '#166534' },
  REJECT: { bg: '#fee2e2', text: '#991b1b' },
  CANCEL: { bg: '#fef3c7', text: '#92400e' },
  DELEGATE: { bg: '#e0e7ff', text: '#3730a3' },
  DELETE: { bg: '#fee2e2', text: '#991b1b' },
  LOGIN: { bg: '#f3e8ff', text: '#6b21a8' },
  EXPORT: { bg: '#e0f2fe', text: '#075985' },
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatEntityName = (entityType) => {
  if (!entityType) return '';
  return entityType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const ActionBadge = ({ action }) => {
  const colors = ACTION_COLORS[action] || { bg: '#f1f5f9', text: '#64748b' };
  return (
    <span 
      className="audit-action-badge"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {action}
    </span>
  );
};

const RowActionsMenu = ({ entry, onViewDiff }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="audit-actions-wrap" ref={ref}>
      <button 
        className="audit-actions-btn" 
        onClick={() => setOpen((v) => !v)} 
        aria-label="More actions"
      >
        <MoreVerticalIcon width={16} height={16} />
      </button>
      {open && (
        <div className="audit-actions-menu">
          <button onClick={() => { onViewDiff?.(entry); setOpen(false); }}>
            <EyeIcon width={14} height={14} /> View Diff
          </button>
        </div>
      )}
    </div>
  );
};

const AuditTrailTable = ({
  entries = [],
  loading = false,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  onViewDiff,
}) => {
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  const handlePageSizeChange = (newSize) => {
    setInternalPageSize(newSize);
    onPageSizeChange?.(newSize);
  };

  if (loading && entries.length === 0) {
    return (
      <div className="audit-table-loading">
        <div className="audit-table-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="audit-skeleton-row">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="audit-skeleton-cell" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="audit-table-empty">
        <div className="audit-empty-icon">📋</div>
        <h3>No audit entries found</h3>
        <p>Try adjusting your filters or date range to see results.</p>
      </div>
    );
  }

  const start = totalCount === 0 ? 0 : (page - 1) * internalPageSize + 1;
  const end = (page - 1) * internalPageSize + entries.length;

  return (
    <div className="audit-table-wrap">
      <table className="audit-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Module</th>
            <th>Description</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const color = getAvatarColor(entry.performedByName || '');
            return (
              <tr key={entry.id || entry.auditId || `audit-row-${entry.performedAt}-${index}`}>
                <td className="audit-date-cell">
                  {formatDate(entry.performedAt)}
                </td>
                <td>
                  <div className="audit-user-cell">
                    <span 
                      className="audit-avatar" 
                      style={{ background: color.bg, color: color.fg }}
                    >
                      {getInitials(entry.performedByName || '')}
                    </span>
                    <div className="audit-user-info">
                      <span className="audit-user-name">{entry.performedByName}</span>
                      <span className="audit-user-code">{entry.employeeCode || `ID: ${entry.performedBy}`}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <ActionBadge action={entry.action} />
                </td>
                <td className="audit-module-cell">
                  {entry.module || formatEntityName(entry.entityType)}
                </td>
                <td className="audit-description-cell">
                  <div className="audit-description-text">
                    {entry.description}
                  </div>
                  <div className="audit-entity-id">
                    ID: {entry.entityId}
                  </div>
                </td>
                <td className="audit-ip-cell">
                  {entry.ipAddress || '—'}
                </td>
                <td>
                  <StatusBadge 
                    status={entry.status === 'SUCCESS' ? 'Success' : 'Failed'} 
                    showDot 
                  />
                </td>
                <td>
                  <RowActionsMenu 
                    entry={entry} 
                    onViewDiff={onViewDiff} 
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="audit-table-footer">
        <div className="audit-table-info">
          <span className="audit-table-count">
            Showing {start} to {end} of {totalCount} entries
          </span>
          <select
            className="audit-page-size-select"
            value={internalPageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      </div>
    </div>
  );
};

export default AuditTrailTable;