import { UserIcon, BarChartIcon, UploadIcon, DownloadIcon } from '../icons/Icons';
import './TeamMembersQuickActions.css';

const ACTIONS = [
  { label: 'Export Member List', icon: DownloadIcon, tone: 'amber' },
];

const TeamMembersQuickActions = ({ onAction, exporting }) => (
  <div className="team-members-quick-actions">
    <div className="widget-header">
      <h3>Quick Actions</h3>
    </div>
    <div className="team-members-quick-actions-list">
      {ACTIONS.map(({ label, icon: Icon, tone }) => {
        const isExportBusy = label === 'Export Member List' && exporting;
        return (
          <button
            key={label}
            className={`team-members-quick-action-btn tone-${tone}`}
            onClick={() => onAction?.(label)}
            disabled={isExportBusy}
          >
            <span className="team-members-quick-action-icon">
              <Icon width={17} height={17} />
            </span>
            <span>{isExportBusy ? 'Exporting...' : label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default TeamMembersQuickActions;
