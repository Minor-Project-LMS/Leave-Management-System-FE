import { PlusCircleIcon, FileTextIcon, ListIcon, HistoryIcon } from '../icons/Icons';
import './PolicyQuickActions.css';

const PolicyQuickActions = ({ onCreate, onTemplates, onApprovalWorkflow, onHistory }) => {
  const ACTIONS = [
    { label: 'Create New Policy', icon: PlusCircleIcon, tone: 'blue', onClick: onCreate },
    { label: 'Policy Templates', icon: FileTextIcon, tone: 'green', onClick: onTemplates },
    { label: 'Policy Approval Workflow', icon: ListIcon, tone: 'purple', onClick: onApprovalWorkflow },
    { label: 'Policy History', icon: HistoryIcon, tone: 'amber', onClick: onHistory },
  ];

  return (
    <div className="policy-quick-actions">
      <div className="widget-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="policy-quick-actions-list">
        {ACTIONS.map(({ label, icon: Icon, tone, onClick }) => (
          <button key={label} className={`policy-quick-action-btn tone-${tone}`} onClick={onClick}>
            <span className="policy-quick-action-icon">
              <Icon width={17} height={17} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PolicyQuickActions;
