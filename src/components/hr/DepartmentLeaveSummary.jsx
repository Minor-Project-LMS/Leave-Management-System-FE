import { Link } from 'react-router-dom';
import './DepartmentLeaveSummary.css';

const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#0d9488', '#ef4444'];

// departments: [{ departmentName, totalLeaveDays }] — from GET /reports/department-summary
const DepartmentLeaveSummary = ({ departments = [] }) => {
  const total = departments.reduce((sum, d) => sum + (d.totalLeaveDays || 0), 0);
  const max = Math.max(1, ...departments.map((d) => d.totalLeaveDays || 0));

  return (
    <div className="dept-leave-summary">
      <div className="widget-header">
        <h3>Department Wise Leave Summary</h3>
      </div>

      {departments.length === 0 ? (
        <p className="widget-empty">No department data yet.</p>
      ) : (
        <ul className="dept-leave-summary-list">
          {departments.map((d, i) => {
            const pct = total > 0 ? Math.round(((d.totalLeaveDays || 0) / total) * 100) : 0;
            return (
              <li key={d.departmentName}>
                <div className="dept-leave-summary-row">
                  <span>{d.departmentName}</span>
                  <span className="dept-leave-summary-value">{pct}%</span>
                </div>
                <div className="dept-leave-summary-track">
                  <div
                    className="dept-leave-summary-bar"
                    style={{
                      width: `${((d.totalLeaveDays || 0) / max) * 100}%`,
                      background: PALETTE[i % PALETTE.length],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link to="/hr/employees" className="dept-leave-summary-link">
        View Full Department Report →
      </Link>
    </div>
  );
};

export default DepartmentLeaveSummary;
