import { useMemo, useState } from 'react';
import './PolicyOverviewChart.css';

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// data: [{ label, value, color }] — counts, not leave-days (that's what
// separates this from the shared LeaveDistributionChart, which hardcodes a
// "days"/"d" unit that would mislabel policy counts).
const PolicyOverviewChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const segments = useMemo(() => {
    let offset = 0;
    return data.map((d) => {
      const fraction = total > 0 ? d.value / total : 0;
      const length = fraction * CIRCUMFERENCE;
      const segment = { ...d, fraction, length, offset };
      offset += length;
      return segment;
    });
  }, [data, total]);

  if (!data.length || total === 0) {
    return <p className="widget-empty">No policy data yet.</p>;
  }

  const activeSegment = hoverIndex != null ? segments[hoverIndex] : null;

  return (
    <div className="policy-donut-chart">
      <div className="policy-donut-svg-wrap">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="policy-donut-svg">
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
              strokeLinecap="butt"
              className="policy-donut-segment"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>
        <div className="policy-donut-center">
          <span className="policy-donut-center-value">{activeSegment ? activeSegment.value : total}</span>
          <span className="policy-donut-center-label">{activeSegment ? activeSegment.label : 'Policies'}</span>
        </div>
      </div>

      <ul className="policy-donut-legend">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={hoverIndex === i ? 'active' : ''}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <span className="policy-donut-legend-dot" style={{ background: seg.color }} />
            <span className="policy-donut-legend-label">{seg.label}</span>
            <span className="policy-donut-legend-value">
              {seg.value} ({total > 0 ? Math.round(seg.fraction * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PolicyOverviewChart;
