import { useNavigate } from 'react-router-dom';
import { InboxIcon, CalendarIcon, UsersIcon, BarChartIcon } from '../icons/Icons';
import './ManagerQuickActions.css';

const ACTIONS = [
  { label: 'Approval Inbox', icon: InboxIcon, path: '/manager/approval-inbox', tone: 'blue' },
  { label: 'Team Calendar', icon: CalendarIcon, path: '/manager/team-calendar', tone: 'green' },
  { label: 'Team Members', icon: UsersIcon, path: '/manager/team-members', tone: 'purple' },
  { label: 'Generate Report', icon: BarChartIcon, path: '/manager/reports', tone: 'amber' },
];

const ManagerQuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="manager-quick-actions">
      <div className="widget-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="manager-quick-actions-list">
        {ACTIONS.map(({ label, icon: Icon, path, tone }) => (
          <button key={label} className={`manager-quick-action-btn tone-${tone}`} onClick={() => navigate(path)}>
            <span className="manager-quick-action-icon">
              <Icon width={17} height={17} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ManagerQuickActions;
