import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import StatusBadge from '../dashboard/StatusBadge';
import LeaveBalanceSummary from '../leave/LeaveBalanceSummary';
import { XIcon, EditIcon } from '../icons/Icons';
import './EmployeeFormModal.css';
import './EmployeeProfileModal.css';

const STATUS_DISPLAY = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  SEPARATED: 'Inactive',
};

const CATEGORY_CODE_BY_ID = { 1: 'CL', 2: 'SL', 3: 'EL', 4: 'CO' };

const currentYear = new Date().getFullYear();
const LEDGER_YEARS = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Read-only counterpart to EmployeeFormModal — shows everything HR would
// want at a glance for a single employee (View Profile action), with a
// shortcut straight into edit mode so HR doesn't have to close and reopen
// the actions menu.
const EmployeeProfileModal = ({
  employee,
  loading,
  error,
  onClose,
  onEdit,
  leaveLedger = [],
  leaveLedgerLoading,
  leaveLedgerError,
  leaveYear = currentYear,
  onLeaveYearChange,
}) => {
  const color = getAvatarColor(employee?.fullName || '');
  const totalUsed = leaveLedger.reduce((sum, row) => sum + (row.used || 0), 0);
  const totalAvailable = leaveLedger.reduce((sum, row) => sum + (row.availableBalance || 0), 0);

  return (
    <div className="employee-modal-backdrop" onClick={onClose}>
      <div className="employee-modal employee-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Employee Profile</h3>
          <button onClick={onClose} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        {error && <div className="employee-modal-error">{error}</div>}

        {loading ? (
          <p className="widget-empty">Loading profile...</p>
        ) : employee ? (
          <>
            <div className="employee-profile-hero">
              <span
                className="employee-profile-avatar"
                style={{
                  background: employee.avatarUrl ? 'transparent' : color.bg,
                  color: employee.avatarUrl ? 'transparent' : color.fg,
                }}
              >
                {employee.avatarUrl ? (
                  <img src={employee.avatarUrl} alt={employee.fullName} />
                ) : (
                  getInitials(employee.fullName)
                )}
              </span>
              <div className="employee-profile-hero-info">
                <span className="employee-profile-name">{employee.fullName}</span>
                <span className="employee-profile-designation">
                  {employee.designation || '—'} {employee.employeeCode ? `· ${employee.employeeCode}` : ''}
                </span>
                <StatusBadge
                  status={STATUS_DISPLAY[employee.employmentStatus] || employee.employmentStatus}
                  showDot
                />
              </div>
            </div>

            <div className="employee-modal-grid">
              <div className="form-field">
                <label>Email Address</label>
                <input type="text" value={employee.email || ''} readOnly />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input type="text" value={employee.phone || ''} readOnly />
              </div>
              <div className="form-field">
                <label>Role</label>
                <input type="text" value={employee.role ? employee.role.replace('_', ' ') : ''} readOnly />
              </div>
              <div className="form-field">
                <label>Department</label>
                <input type="text" value={employee.departmentName || ''} readOnly />
              </div>
              <div className="form-field">
                <label>Reporting Manager</label>
                <input type="text" value={employee.reportsToName || '—'} readOnly />
              </div>
              <div className="form-field">
                <label>Date of Joining</label>
                <input type="text" value={formatDate(employee.dateOfJoining)} readOnly />
              </div>
              <div className="form-field">
                <label>Work Location</label>
                <input type="text" value={employee.workLocation || ''} readOnly />
              </div>
              <div className="form-field">
                <label>Employment Type</label>
                <input type="text" value={employee.employmentType || ''} readOnly />
              </div>
            </div>

            <div className="employee-profile-leave-section">
              <div className="employee-profile-leave-header">
                <h4>Leave Taken &amp; Balance</h4>
                <select
                  className="employee-profile-year-select"
                  value={leaveYear}
                  onChange={(e) => onLeaveYearChange?.(Number(e.target.value))}
                >
                  {LEDGER_YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              {leaveLedgerError && (
                <div className="employee-modal-error">{leaveLedgerError}</div>
              )}

              {leaveLedgerLoading ? (
                <p className="widget-empty">Loading leave balance...</p>
              ) : leaveLedger.length === 0 ? (
                <p className="widget-empty">No leave ledger entries for {leaveYear}.</p>
              ) : (
                <>
                  <div className="employee-profile-leave-totals">
                    <div className="employee-profile-leave-stat">
                      <span className="employee-profile-leave-stat-value">{totalUsed}</span>
                      <span className="employee-profile-leave-stat-label">Days taken in {leaveYear}</span>
                    </div>
                    <div className="employee-profile-leave-stat">
                      <span className="employee-profile-leave-stat-value">{totalAvailable}</span>
                      <span className="employee-profile-leave-stat-label">Days remaining</span>
                    </div>
                  </div>
                  <LeaveBalanceSummary ledger={leaveLedger} categoryCodeById={CATEGORY_CODE_BY_ID} />
                </>
              )}
            </div>
          </>
        ) : (
          <p className="widget-empty">Employee not found.</p>
        )}

        <div className="employee-modal-actions">
          <button className="employee-modal-cancel" onClick={onClose}>
            Close
          </button>
          {employee && (
            <button
              className="employee-modal-confirm"
              onClick={() => {
                onEdit?.(employee);
                onClose?.();
              }}
            >
              <EditIcon width={14} height={14} /> Edit Employee
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
