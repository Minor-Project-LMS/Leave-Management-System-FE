import './LeaveSummaryList.css';

const CODE_CLASS = {
  CL: 'leave-summary-dot-blue',
  SL: 'leave-summary-dot-green',
  EL: 'leave-summary-dot-amber',
  CO: 'leave-summary-dot-purple',
};

// items: [{ categoryCode, categoryName, totalDays }]
// title/subtitle: header text. showTotal: whether to render a bold "Total Leaves" footer row.
const LeaveSummaryList = ({ items = [], title, subtitle, showTotal = false }) => {
  const total = items.reduce((sum, item) => sum + (item.totalDays || 0), 0);

  return (
    <div className="leave-summary-list">
      {title && (
        <div className="leave-summary-list-header">
          <h3>{title}</h3>
          {subtitle && <span className="leave-summary-list-subtitle">{subtitle}</span>}
        </div>
      )}

      {items.length === 0 ? (
        <p className="widget-empty">No leave data yet.</p>
      ) : (
        <ul className="leave-summary-list-items">
          {items.map((item) => {
            const code = item.categoryCode || (item.categoryName || '').slice(0, 2).toUpperCase();
            return (
              <li key={item.categoryId ?? code} className="leave-summary-list-row">
                <span className="leave-summary-list-label">
                  <span className={`leave-summary-dot ${CODE_CLASS[code] || 'leave-summary-dot-default'}`} />
                  {item.categoryName}
                </span>
                <span className="leave-summary-list-value">{item.totalDays.toFixed(1)} Days</span>
              </li>
            );
          })}
        </ul>
      )}

      {showTotal && items.length > 0 && (
        <div className="leave-summary-list-total">
          <span>Total Leaves</span>
          <span>{total.toFixed(1)} Days</span>
        </div>
      )}
    </div>
  );
};

export default LeaveSummaryList;
