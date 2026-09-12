import './DelegationTabs.css';

const TABS = [
  { key: 'ACTIVE', label: 'Active Delegations' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'PAST', label: 'Past Delegations' },
];

const DelegationTabs = ({ active, counts = {}, onChange }) => (
  <div className="delegation-tabs">
    {TABS.map((tab) => (
      <button
        key={tab.key}
        className={`delegation-tab ${active === tab.key ? 'active' : ''}`}
        onClick={() => onChange(tab.key)}
      >
        {tab.label}
        <span className="delegation-tab-count">{counts[tab.key] ?? 0}</span>
      </button>
    ))}
  </div>
);

export default DelegationTabs;
