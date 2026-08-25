import { CalendarIcon, HistoryIcon, HourglassIcon, ClockIcon, UsersIcon } from '../icons/Icons';
import './LeavePolicyCard.css';

const APPLICABLE_LABEL = {
  ALL_EMPLOYEES: 'All Employees',
  MALE: 'Male Employees',
  FEMALE: 'Female Employees',
  DEPARTMENT_SPECIFIC: 'Specific Departments',
};

const LeavePolicyCard = ({ categoryName, policy, loading }) => {
  if (loading) {
    return (
      <div className="leave-policy-card">
        <p className="widget-empty">Loading policy...</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="leave-policy-card">
        <p className="widget-empty">Select a leave type to see its policy.</p>
      </div>
    );
  }

  const rows = [
    { icon: CalendarIcon, label: 'Annual Quota', value: `${policy.annualQuota} Days` },
    { icon: HistoryIcon, label: 'Carry Forward', value: `${policy.maxCarryForward ?? 0} Days` },
    { icon: HourglassIcon, label: 'Maximum Continuous Days', value: `${policy.maxConsecutiveDays ?? '—'} Days` },
    { icon: ClockIcon, label: 'Notice Period', value: `${policy.minNoticeDays ?? 0} Day${policy.minNoticeDays === 1 ? '' : 's'}` },
    { icon: UsersIcon, label: 'Applicable For', value: APPLICABLE_LABEL[policy.applicableTo] || 'All Employees' },
  ];

  return (
    <div className="leave-policy-card">
      <div className="widget-header">
        <h3>Leave Policy for {categoryName}</h3>
      </div>
      <ul className="leave-policy-list">
        {rows.map((row) => (
          <li key={row.label}>
            <span className="leave-policy-icon">
              <row.icon width={15} height={15} />
            </span>
            <span className="leave-policy-label">{row.label}</span>
            <span className="leave-policy-value">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeavePolicyCard;
