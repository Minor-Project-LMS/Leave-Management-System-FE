import { UserIcon, BarChartIcon, UploadIcon, DownloadIcon } from '../icons/Icons';
import './TeamMembersQuickActions.css';

const ACTIONS = [
  { label: 'Invite New Member', icon: UserIcon, tone: 'blue' },
  { label: 'Assign Leave Quota', icon: BarChartIcon, tone: 'green' },
  { label: 'Bulk Upload', icon: UploadIcon, tone: 'purple' },
  { label: 'Export Member List', icon: DownloadIcon, tone: 'amber' },
];

const TeamMembersQuickActions = ({ onAction }) => (
  <div className="team-members-quick-actions">
    <div className="widget-header">
      <h3>Quick Actions</h3>
    </div>
    <div className="team-members-quick-actions-list">
      {ACTIONS.map(({ label, icon: Icon, tone }) => (
        <button
          key={label}
          className={`team-members-quick-action-btn tone-${tone}`}
          onClick={() => onAction?.(label)}
        >
          <span className="team-members-quick-action-icon">
            <Icon width={17} height={17} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default TeamMembersQuickActions;
