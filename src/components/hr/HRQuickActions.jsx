import { useNavigate } from 'react-router-dom';
import { BarChartIcon, BookIcon, HistoryIcon, UsersIcon } from '../icons/Icons';
import './HRQuickActions.css';

const ACTIONS = [
  { label: 'Generate Leave Report', icon: BarChartIcon, action: 'export', highlighted: true },
  { label: 'Manage Leave Policies', icon: BookIcon, path: '/hr/leave-policies' },
  { label: 'View Audit Trail', icon: HistoryIcon, path: '/hr/audit-trail' },
  { label: 'Manage Employees', icon: UsersIcon, path: '/hr/employees' },
];

const HRQuickActions = ({ onExportReport, exporting }) => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.action === 'export') {
      onExportReport?.();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="hr-quick-actions">
      <div className="widget-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="hr-quick-actions-list">
        {ACTIONS.map((item) => (
          <button
            key={item.label}
            className={`hr-quick-action-btn ${item.highlighted ? 'highlighted' : ''}`}
            onClick={() => handleClick(item)}
            disabled={item.action === 'export' && exporting}
          >
            <item.icon width={16} height={16} />
            <span>{item.action === 'export' && exporting ? 'Generating report...' : item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HRQuickActions;
