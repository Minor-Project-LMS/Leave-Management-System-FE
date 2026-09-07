import { FilterIcon, DownloadIcon } from '../icons/Icons';
import './ReportsFilterBar.css';

const REPORT_TYPES = ['All', 'Leave Summary', 'Department Wise', 'Employee Leave', 'Pending Requests'];

// Location isn't backed by any endpoint (no /locations exists in the API),
// so this filter is decorative only — it never gets sent to the backend.
const LOCATIONS = ['All', 'Bangalore', 'Mumbai', 'Delhi', 'Remote'];

const ReportsFilterBar = ({
  reportType,
  onReportTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  departmentId,
  onDepartmentChange,
  departments,
  location,
  onLocationChange,
  onExport,
  exporting,
}) => (
  <div className="reports-filter-bar">
    <select className="reports-filter-select" value={reportType} onChange={(e) => onReportTypeChange(e.target.value)}>
      {REPORT_TYPES.map((t) => (
        <option key={t} value={t}>
          Report Type: {t}
        </option>
      ))}
    </select>

    <div className="reports-date-range">
      <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
      <span>–</span>
      <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
    </div>

    <select
      className="reports-filter-select"
      value={departmentId ?? ''}
      onChange={(e) => onDepartmentChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">Department: All</option>
      {departments.map((d) => (
        <option key={d.id} value={d.id}>
          {d.departmentName}
        </option>
      ))}
    </select>

    <select className="reports-filter-select" value={location} onChange={(e) => onLocationChange(e.target.value)}>
      {LOCATIONS.map((l) => (
        <option key={l} value={l}>
          Location: {l}
        </option>
      ))}
    </select>

    <button className="reports-filter-btn">
      <FilterIcon width={15} height={15} />
      Filter
    </button>

    <button className="reports-export-btn" onClick={onExport} disabled={exporting}>
      <DownloadIcon width={16} height={16} />
      {exporting ? 'Generating...' : 'Export Report'}
    </button>
  </div>
);

export default ReportsFilterBar;
