import { useMemo, useState } from 'react';
import './ReportsDistributionChart.css';

const SIZE = 180;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// data: [{ label, value, color }]
// NOTE: there's no org-wide leave-distribution-by-type endpoint in the spec
// (only a per-employee one under /dashboard/leave-distribution) — same gap
// already flagged on the HR Dashboard page. Mock-only until that exists.
const ReportsDistributionChart = ({ data = [], total }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const sum = total ?? data.reduce((s, d) => s + d.value, 0);

  const segments = useMemo(() => {
    let offset = 0;
    return data.map((d) => {
      const fraction = sum > 0 ? d.value / sum : 0;
      const length = fraction * CIRCUMFERENCE;
      const segment = { ...d, fraction, length, offset };
      offset += length;
      return segment;
    });
  }, [data, sum]);

  if (!data.length || sum === 0) {
    return <p className="widget-empty">No leave distribution data yet.</p>;
  }

  const active = hoverIndex != null ? segments[hoverIndex] : null;

  return (
    <div className="reports-donut-chart">
      <div className="reports-donut-svg-wrap">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="reports-donut-svg">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--bg-light)" strokeWidth={STROKE} />
          {segments.map((seg, i) => (
            <circle
              key={seg.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={hoverIndex === i ? STROKE + 3 : STROKE}
              strokeDasharray={`${seg.length} ${CIRCUMFERENCE - seg.length}`}
              strokeDashoffset={-seg.offset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              className="reports-donut-segment"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>
        <div className="reports-donut-center">
          <span className="reports-donut-center-value">{active ? active.value : sum.toLocaleString()}</span>
          <span className="reports-donut-center-label">{active ? active.label : 'Total'}</span>
        </div>
      </div>

      <ul className="reports-donut-legend">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={hoverIndex === i ? 'active' : ''}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <span className="reports-donut-legend-dot" style={{ background: seg.color }} />
            <span className="reports-donut-legend-label">{seg.label}</span>
            <span className="reports-donut-legend-value">
              {seg.value} ({Math.round(seg.fraction * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsDistributionChart;
