import './StatCard.css';

const StatCard = ({ icon: Icon, iconClass = '', label, value, sublabel }) => (
  <div className="stat-card">
    <div className={`stat-card-icon ${iconClass}`}>
      <Icon />
    </div>
    <div className="stat-card-body">
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
      {sublabel && <span className="stat-card-sublabel">{sublabel}</span>}
    </div>
  </div>
);

export default StatCard;
