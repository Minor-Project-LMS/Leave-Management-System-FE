import { PlusCircleIcon, ListIcon, CalendarIcon } from '../icons/Icons';
import './DelegationQuickActions.css';

const DelegationQuickActions = ({ onCreate, onViewMine, onOpenCalendar }) => {
  const ACTIONS = [
    { label: 'Create Delegation', icon: PlusCircleIcon, tone: 'blue', onClick: onCreate },
    { label: 'My Delegations', icon: ListIcon, tone: 'green', onClick: onViewMine },
    { label: 'Delegation Calendar', icon: CalendarIcon, tone: 'purple', onClick: onOpenCalendar },
  ];

  return (
    <div className="delegation-quick-actions">
      <div className="widget-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="delegation-quick-actions-list">
        {ACTIONS.map(({ label, icon: Icon, tone, onClick }) => (
          <button key={label} className={`delegation-quick-action-btn tone-${tone}`} onClick={onClick}>
            <span className="delegation-quick-action-icon">
              <Icon width={17} height={17} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DelegationQuickActions;
