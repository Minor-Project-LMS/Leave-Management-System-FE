import { useNavigate } from 'react-router-dom';
import { PlusCircleIcon, CoffeeIcon, FileTextIcon, BookIcon } from '../icons/Icons';
import './QuickActions.css';

const ACTIONS = [
  { label: 'Apply Leave', sublabel: 'Request time off', icon: PlusCircleIcon, path: '/apply-leave', tone: 'blue' },
  { label: 'My Requests', sublabel: 'Track your requests', icon: FileTextIcon, path: '/my-requests', tone: 'purple' },
  { label: 'Leave Ledger', sublabel: 'View leave balance', icon: BookIcon, path: '/leave-ledger', tone: 'amber' },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <div className="widget-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="dash-quick-actions-grid">
        {ACTIONS.map(({ label, sublabel, icon: Icon, path, tone }) => (
          <button key={label} className={`dash-quick-action-btn tone-${tone}`} onClick={() => navigate(path)}>
            <span className="dash-quick-action-icon">
              <Icon />
            </span>
            <span className="dash-quick-action-text">
              <span className="dash-quick-action-label">{label}</span>
              <span className="dash-quick-action-sublabel">{sublabel}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
