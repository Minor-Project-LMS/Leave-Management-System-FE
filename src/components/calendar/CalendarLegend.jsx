import './CalendarLegend.css';

const LEGEND_ITEMS = [
  { code: 'CL', label: 'Casual Leave', className: 'legend-dot-blue' },
  { code: 'SL', label: 'Sick Leave', className: 'legend-dot-green' },
  { code: 'EL', label: 'Earned Leave', className: 'legend-dot-amber' },
  { code: 'CO', label: 'Comp-Off', className: 'legend-dot-purple' },
  { code: null, label: 'Weekly Off', className: 'legend-dot-gray' },
  { code: null, label: 'Holiday', className: 'legend-dot-red' },
];

const CalendarLegend = () => (
  <div className="calendar-legend">
    {LEGEND_ITEMS.map((item) => (
      <span key={item.label} className="calendar-legend-item">
        <span className={`calendar-legend-dot ${item.className}`}>{item.code}</span>
        {item.label}
      </span>
    ))}
  </div>
);

export default CalendarLegend;
