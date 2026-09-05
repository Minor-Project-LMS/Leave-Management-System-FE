import { useState, useRef, useEffect } from 'react';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import Pagination from '../common/Pagination';
import { CalendarIcon, MoreVerticalIcon, EditIcon, XCircleIcon } from '../icons/Icons';
import './DelegationTable.css';

const STATUS_META = {
  ACTIVE: { label: 'Active', className: 'delegation-status-active' },
  UPCOMING: { label: 'Upcoming', className: 'delegation-status-upcoming' },
  PAST: { label: 'Past', className: 'delegation-status-past' },
  REVOKED: { label: 'Revoked', className: 'delegation-status-revoked' },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const daysUntil = (iso) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const getCaption = (delegation) => {
  if (delegation.computedStatus === 'ACTIVE') return `Active since ${formatDate(delegation.startDate)}`;
  if (delegation.computedStatus === 'UPCOMING') {
    const n = daysUntil(delegation.startDate);
    return n <= 0 ? 'Starts today' : `Starts in ${n} day${n === 1 ? '' : 's'}`;
  }
  if (delegation.computedStatus === 'REVOKED') return `Revoked · was set to end ${formatDate(delegation.endDate)}`;
  return `Ended ${formatDate(delegation.endDate)}`;
};

const ActionsMenu = ({ delegation, onEdit, onRevoke }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const canRevoke = delegation.computedStatus === 'ACTIVE' || delegation.computedStatus === 'UPCOMING';

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="delegation-actions-wrap" ref={ref}>
      <button className="delegation-actions-btn" onClick={() => setOpen((v) => !v)} aria-label="More actions">
        <MoreVerticalIcon width={16} height={16} />
      </button>
      {open && (
        <div className="delegation-actions-menu">
          <button onClick={() => { onEdit?.(delegation); setOpen(false); }}>
            <EditIcon width={14} height={14} /> Edit
          </button>
          {canRevoke && (
            <button className="danger" onClick={() => { onRevoke?.(delegation); setOpen(false); }}>
              <XCircleIcon width={14} height={14} /> Revoke
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// departments/categories: lookup lists used to resolve the Delegation's
// departmentIds/categoryIds (the API only sends ids) into display chips.
const DelegationTable = ({
  delegations = [],
  departments = [],
  categories = [],
  delegatorName,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onRevoke,
}) => {
  if (delegations.length === 0) {
    return <p className="widget-empty">No delegations in this view.</p>;
  }

  const deptName = (id) =>
    departments.find((d) => d.id === id)?.departmentName || departments.find((d) => d.id === id)?.name;
  const catCode = (id) => categories.find((c) => c.categoryId === id || c.id === id)?.categoryCode;

  return (
    <div className="delegation-table-wrap">
      <table className="delegation-table">
        <thead>
          <tr>
            <th>Delegate To</th>
            <th>Delegated By</th>
            <th>Delegation Period</th>
            <th>Scope</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {delegations.map((d) => {
            const color = getAvatarColor(d.delegateName);
            const status = STATUS_META[d.computedStatus] || STATUS_META.PAST;
            const deptChips = (d.departmentIds || []).map(deptName).filter(Boolean);
            const catChips = (d.categoryIds || []).map(catCode).filter(Boolean);

            return (
              <tr key={d.id}>
                <td>
                  <div className="delegation-person-cell">
                    <span className="delegation-avatar" style={{ background: color.bg, color: color.fg }}>
                      {getInitials(d.delegateName)}
                    </span>
                    <span className="delegation-person-name">{d.delegateName}</span>
                  </div>
                </td>
                <td>
                  <div className="delegation-person-cell">
                    <span className="delegation-person-name">{d.delegatorName || delegatorName}</span>
                  </div>
                </td>
                <td>
                  <div className="delegation-period-cell">
                    <span className="delegation-period-dates">
                      <CalendarIcon width={13} height={13} />
                      {formatDate(d.startDate)} – {formatDate(d.endDate)}
                    </span>
                    <span className="delegation-period-caption">{getCaption(d)}</span>
                  </div>
                </td>
                <td>
                  <div className="delegation-scope-cell">
                    <span className="delegation-scope-row">
                      <span className="delegation-scope-label">Departments:</span>
                      {deptChips.length > 0 ? deptChips.join(', ') : 'All Departments'}
                    </span>
                    <span className="delegation-scope-row">
                      <span className="delegation-scope-label">Leave Types:</span>
                      {catChips.length > 0 ? catChips.join(', ') : 'All Leave Types'}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`delegation-status-pill ${status.className}`}>{status.label}</span>
                </td>
                <td>
                  <ActionsMenu delegation={d} onEdit={onEdit} onRevoke={onRevoke} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="delegation-table-footer">
        <span className="delegation-table-count">
          Showing {delegations.length === 0 ? 0 : (page - 1) * delegations.length + 1} to{' '}
          {(page - 1) * delegations.length + delegations.length} of {totalCount} delegations
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default DelegationTable;
