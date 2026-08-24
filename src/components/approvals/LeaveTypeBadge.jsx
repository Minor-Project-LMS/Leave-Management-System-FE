import './LeaveTypeBadge.css';

const TYPE_STYLES = {
  CL: 'leave-type-blue',
  SL: 'leave-type-green',
  EL: 'leave-type-amber',
  CO: 'leave-type-purple',
};

// categoryCode: 'CL' | 'SL' | 'EL' | 'CO' (falls back to first letters of categoryName)
const LeaveTypeBadge = ({ categoryCode, categoryName }) => {
  const code = categoryCode || (categoryName || '').slice(0, 2).toUpperCase();
  const styleClass = TYPE_STYLES[code] || 'leave-type-default';

  return (
    <span className="leave-type-badge">
      <span className={`leave-type-dot ${styleClass}`}>{code}</span>
      <span className="leave-type-name">{categoryName}</span>
    </span>
  );
};

export default LeaveTypeBadge;
