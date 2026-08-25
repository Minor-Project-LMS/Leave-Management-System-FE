import { TrendUpIcon, TrendDownIcon } from '../icons/Icons';
import './StatCard.css';

// variant: 'compact' (default, used by Employee/Manager dashboards — icon
// beside text) or 'detailed' (HR dashboard — icon+trend badge row on top,
// label/value/sublabel below). Both share the same props otherwise.
// trend: optional { value: number, direction: 'up' | 'down', tone: 'positive' | 'warning' | 'neutral' }
// sublabelTone: optional 'default' | 'positive' | 'warning' | 'neutral'
const StatCard = ({
  icon: Icon,
  iconClass = '',
  label,
  value,
  sublabel,
  trend,
  sublabelTone = 'default',
  variant = 'compact',
}) => {
  const TrendIcon = trend?.direction === 'down' ? TrendDownIcon : TrendUpIcon;

  if (variant === 'detailed') {
    return (
      <div className="stat-card stat-card-detailed">
        <div className="stat-card-top">
          <div className={`stat-card-icon ${iconClass}`}>
            <Icon />
          </div>
          {trend && (
            <span className={`stat-card-trend tone-${trend.tone || 'positive'}`}>
              <TrendIcon width={12} height={12} />
              {trend.value}%
            </span>
          )}
        </div>
        <div className="stat-card-body">
          <span className="stat-card-label stat-card-label-caps">{label}</span>
          <span className="stat-card-value">{value}</span>
          {sublabel && <span className={`stat-card-sublabel tone-${sublabelTone}`}>{sublabel}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${iconClass}`}>
        <Icon />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value}</span>
        {sublabel && <span className={`stat-card-sublabel tone-${sublabelTone}`}>{sublabel}</span>}
      </div>
    </div>
  );
};

export default StatCard;
