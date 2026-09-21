import { PlusCircleIcon, ListIcon, CalendarIcon } from '../icons/Icons';
import './DelegationQuickActions.css';

const DelegationQuickActions = ({ onCreate, onViewMine, onOpenCalendar }) => {
  const ACTIONS = [
  ];

  return (
    <div className="delegation-quick-actions">
      <div className="widget-header">
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
