import { useState, useRef, useEffect } from 'react';
import StatusBadge from '../dashboard/StatusBadge';
import Pagination from '../common/Pagination';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import { MoreVerticalIcon, EyeIcon, CalendarIcon, BookIcon } from '../icons/Icons';
import './TeamMembersTable.css';

const STATUS_DISPLAY = {
  AVAILABLE: 'Available',
  ON_LEAVE: 'On Leave',
  HALF_DAY: 'Half Day',
};

const RowActionsMenu = ({ member, onViewProfile }) => {
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
    <div className="team-members-actions-wrap" ref={ref}>
      <button className="team-members-actions-btn" onClick={() => setOpen((v) => !v)} aria-label="More actions">
        <MoreVerticalIcon width={16} height={16} />
      </button>
      {open && (
        <div className="team-members-actions-menu">
          <button onClick={() => { onViewProfile?.(member); setOpen(false); }}>
            <EyeIcon width={14} height={14} /> View Profile
          </button>
          <button onClick={() => setOpen(false)}>
            <BookIcon width={14} height={14} /> Leave Ledger
          </button>
          <button onClick={() => setOpen(false)}>
            <CalendarIcon width={14} height={14} /> Assign Quota
          </button>
        </div>
      )}
    </div>
  );
};

const TeamMembersTable = ({ members = [], page, totalPages, totalCount, onPageChange, onViewProfile }) => {
  if (members.length === 0) {
    return <p className="widget-empty">No team members match your filters.</p>;
  }

  const start = totalCount === 0 ? 0 : (page - 1) * members.length + 1;
  const end = (page - 1) * members.length + members.length;

  return (
    <div className="team-members-table-wrap">
      <table className="team-members-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const color = getAvatarColor(m.fullName);
            return (
              <tr key={m.id}>
                <td>
                  <div className="team-members-name-cell">
                    <span className="team-members-avatar" style={{ background: color.bg, color: color.fg }}>
                      {getInitials(m.fullName)}
                    </span>
                    <span className="team-members-name">{m.fullName}</span>
                  </div>
                </td>
                <td className="team-members-muted">{m.employeeCode}</td>
                <td className="team-members-muted">{m.departmentName}</td>
                <td className="team-members-muted">{m.designation}</td>
                <td className="team-members-muted">{m.email}</td>
                <td className="team-members-muted">{m.phone}</td>
                <td>
                  <StatusBadge status={STATUS_DISPLAY[m.status] || m.status} showDot />
                </td>
                <td>
                  <RowActionsMenu member={m} onViewProfile={onViewProfile} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="team-members-table-footer">
        <span className="team-members-table-count">
          Showing {start} to {end} of {totalCount} members
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default TeamMembersTable;
