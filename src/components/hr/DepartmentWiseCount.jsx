import { Link } from 'react-router-dom';
import './DepartmentWiseCount.css';

const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#0d9488', '#ef4444'];

// departments: [{ departmentName, totalEmployees }]
const DepartmentWiseCount = ({ departments = [], reportPath = '/hr/reports' }) => {
  const max = Math.max(1, ...departments.map((d) => d.totalEmployees || 0));

  return (
    <div className="department-wise-count">
      <div className="widget-header">
        <h3>Department Wise Count</h3>
      </div>

      {departments.length === 0 ? (
        <p className="widget-empty">No department data yet.</p>
      ) : (
        <ul className="department-wise-count-list">
          {departments.map((d, i) => (
            <li key={d.departmentName}>
              <div className="department-wise-count-row">
                <span>{d.departmentName}</span>
                <span className="department-wise-count-value">{d.totalEmployees}</span>
              </div>
              <div className="department-wise-count-track">
                <div
                  className="department-wise-count-bar"
                  style={{
                    width: `${((d.totalEmployees || 0) / max) * 100}%`,
                    background: PALETTE[i % PALETTE.length],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to={reportPath} className="department-wise-count-link">
        View Department Report →
      </Link>
    </div>
  );
};

export default DepartmentWiseCount;
