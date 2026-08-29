import './TeamOverviewList.css';

// items: [{ icon: Component, label, value, tone }]
const TeamOverviewList = ({ title = 'Team Overview', items = [] }) => (
  <div className="team-overview-list">
    <div className="widget-header">
      <h3>{title}</h3>
    </div>
    <ul>
      {items.map(({ icon: Icon, label, value, tone = 'blue' }) => (
        <li key={label} className="team-overview-list-row">
          <span className="team-overview-list-left">
            <span className={`team-overview-list-icon tone-${tone}`}>
              <Icon width={16} height={16} />
            </span>
            {label}
          </span>
          <span className="team-overview-list-value">{value}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default TeamOverviewList;
