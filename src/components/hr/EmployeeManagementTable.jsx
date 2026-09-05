import { useState, useRef, useEffect } from 'react';
import StatusBadge from '../dashboard/StatusBadge';
import Pagination from '../common/Pagination';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import { MoreVerticalIcon, EyeIcon, EditIcon, BarChartIcon, XCircleIcon } from '../icons/Icons';
import './EmployeeManagementTable.css';

const STATUS_DISPLAY = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  SEPARATED: 'Inactive',
};

const formatJoinDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const RowActionsMenu = ({ employee, onViewProfile, onEdit, onAssignQuota, onDeactivate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = employee.employmentStatus !== 'SEPARATED';

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="employee-actions-wrap" ref={ref}>
      <button className="employee-actions-btn" onClick={() => setOpen((v) => !v)} aria-label="More actions">
        <MoreVerticalIcon width={16} height={16} />
      </button>
      {open && (
        <div className="employee-actions-menu">
          <button onClick={() => { onViewProfile?.(employee); setOpen(false); }}>
            <EyeIcon width={14} height={14} /> View Profile
          </button>
          <button onClick={() => { onEdit?.(employee); setOpen(false); }}>
            <EditIcon width={14} height={14} /> Edit
          </button>
          <button onClick={() => { onAssignQuota?.(employee); setOpen(false); }}>
            <BarChartIcon width={14} height={14} /> Assign Quota
          </button>
          {isActive && (
            <button className="danger" onClick={() => { onDeactivate?.(employee); setOpen(false); }}>
              <XCircleIcon width={14} height={14} /> Deactivate
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const EmployeeManagementTable = ({
  employees = [],
  page,
  totalPages,
  totalCount,
  onPageChange,
  onViewProfile,
  onEdit,
  onAssignQuota,
  onDeactivate,
}) => {
  if (employees.length === 0) {
    return <p className="widget-empty">No employees match your filters.</p>;
  }

  const start = totalCount === 0 ? 0 : (page - 1) * employees.length + 1;
  const end = (page - 1) * employees.length + employees.length;

  return (
    <div className="employee-table-wrap">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
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
          {employees.map((emp) => {
            const color = getAvatarColor(emp.fullName);
            return (
              <tr key={emp.id}>
                <td>
                  <div className="employee-name-cell">
                    <span className="employee-avatar" style={{ background: color.bg, color: color.fg }}>
                      {getInitials(emp.fullName)}
                    </span>
                    <div className="employee-name-info">
                      <span className="employee-name">{emp.fullName}</span>
                      <span className="employee-joined">Joined {formatJoinDate(emp.dateOfJoining)}</span>
                    </div>
                  </div>
                </td>
                <td className="employee-muted">{emp.employeeCode}</td>
                <td className="employee-muted">{emp.departmentName}</td>
                <td className="employee-muted">{emp.designation}</td>
                <td className="employee-muted">{emp.email}</td>
                <td className="employee-muted">{emp.phone}</td>
                <td>
                  <StatusBadge status={STATUS_DISPLAY[emp.employmentStatus] || emp.employmentStatus} showDot />
                </td>
                <td>
                  <RowActionsMenu
                    employee={emp}
                    onViewProfile={onViewProfile}
                    onEdit={onEdit}
                    onAssignQuota={onAssignQuota}
                    onDeactivate={onDeactivate}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="employee-table-footer">
        <span className="employee-table-count">
          Showing {start} to {end} of {totalCount} employees
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default EmployeeManagementTable;
