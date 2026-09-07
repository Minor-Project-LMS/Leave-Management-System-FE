import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import './TopEmployeesList.css';

// employees: [{ userId, fullName, departmentName, totalDaysTaken }]
const TopEmployeesList = ({ employees = [] }) => {
  const max = Math.max(1, ...employees.map((e) => e.totalDaysTaken || 0));

  if (employees.length === 0) {
    return <p className="widget-empty">No leave data yet.</p>;
  }

  return (
    <ul className="top-employees-list">
      {employees.map((emp) => {
        const color = getAvatarColor(emp.fullName);
        return (
          <li key={emp.userId} className="top-employees-row">
            <span className="top-employees-avatar" style={{ background: color.bg, color: color.fg }}>
              {getInitials(emp.fullName)}
            </span>
            <div className="top-employees-info">
              <span className="top-employees-name">{emp.fullName}</span>
              <span className="top-employees-dept">{emp.departmentName}</span>
            </div>
            <div className="top-employees-bar-col">
              <div className="top-employees-track">
                <div
                  className="top-employees-bar"
                  style={{ width: `${((emp.totalDaysTaken || 0) / max) * 100}%` }}
                />
              </div>
              <span className="top-employees-value">{emp.totalDaysTaken}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TopEmployeesList;
