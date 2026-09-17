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
    <button className="reports-export-btn" onClick={onExport} disabled={exporting}>
      <DownloadIcon width={16} height={16} />
      {exporting ? 'Generating...' : 'Export Report'}
    </button>
  </div>
);

export default ReportsFilterBar;
