import './DepartmentSummaryTable.css';

const DepartmentSummaryTable = ({ rows = [] }) => (
  <div className="dept-summary">
    <div className="widget-header">
      <div>
        <h3>Department-wise Leave Summary</h3>
        <p className="dept-summary-subtitle">Current month · all locations</p>
      </div>
    </div>

    {rows.length === 0 ? (
      <p className="widget-empty">No department data yet.</p>
    ) : (
      <div className="dept-summary-table-wrap">
        <table className="dept-summary-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Employees</th>
              <th>Leave Days</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.departmentName}>
                <td className="dept-summary-name">{r.departmentName}</td>
                <td>{r.totalEmployees}</td>
                <td>{r.totalLeaveDays}</td>
                <td>{r.utilizationPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default DepartmentSummaryTable;
