import { FileTextIcon, BuildingIcon, UsersIcon, TrendUpIcon, HourglassIcon, EditIcon, ChevronRightSmallIcon } from '../icons/Icons';
import './QuickReportsList.css';

const REPORTS = [
  { key: 'LEAVE_SUMMARY', label: 'Leave Summary Report', icon: FileTextIcon },
  { key: 'DEPARTMENT_WISE', label: 'Department Wise Report', icon: BuildingIcon },
  { key: 'EMPLOYEE_LEAVE', label: 'Employee Leave Report', icon: UsersIcon },
  { key: 'LEAVE_TREND', label: 'Leave Trend Analysis', icon: TrendUpIcon },
  { key: 'PENDING_REQUESTS', label: 'Pending Requests Report', icon: HourglassIcon },
  { key: 'CUSTOM', label: 'Custom Report', icon: EditIcon },
];

// Each shortcut runs the same export flow as the main "Export Report"
// button, just pre-selecting a reportType — there's no separate endpoint
// per report, POST /reports/export takes a reportType field either way.
const QuickReportsList = ({ onSelect, exportingType }) => (
  <div className="quick-reports-card">
    <div className="widget-header">
      <h3>Quick Reports</h3>
    </div>
    <div className="quick-reports-list">
      {REPORTS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className="quick-reports-item"
          onClick={() => onSelect(key)}
          disabled={exportingType === key}
        >
          <span className="quick-reports-item-left">
            <Icon width={15} height={15} />
            {exportingType === key ? 'Generating...' : label}
          </span>
          <ChevronRightSmallIcon width={14} height={14} />
        </button>
      ))}
    </div>
  </div>
);

export default QuickReportsList;
