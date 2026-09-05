import { PlusCircleIcon, UploadIcon, EditIcon, ShieldIcon, FileTextIcon } from '../icons/Icons';
import './EmployeeQuickActions.css';

const EmployeeQuickActions = ({ onAddEmployee, onImport, onBulkUpdate, onManageRoles, onDocuments }) => {
  const ACTIONS = [
    { label: 'Add New Employee', icon: PlusCircleIcon, tone: 'blue', onClick: onAddEmployee },
    { label: 'Import Employees', icon: UploadIcon, tone: 'green', onClick: onImport },
    { label: 'Bulk Update', icon: EditIcon, tone: 'purple', onClick: onBulkUpdate },
    { label: 'Manage Roles & Access', icon: ShieldIcon, tone: 'amber', onClick: onManageRoles },
    { label: 'Employee Documents', icon: FileTextIcon, tone: 'teal', onClick: onDocuments },
  ];

  return (
    <div className="employee-quick-actions">
      <div className="widget-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="employee-quick-actions-list">
        {ACTIONS.map(({ label, icon: Icon, tone, onClick }) => (
          <button key={label} className={`employee-quick-action-btn tone-${tone}`} onClick={onClick}>
            <span className="employee-quick-action-icon">
              <Icon width={17} height={17} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmployeeQuickActions;
