import { useMemo, useState } from 'react';
import './LeaveDistributionChart.css';

const SIZE = 180;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LeaveDistributionChart = ({ data = [] }) => {
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
    return <div className="chart-empty">No leave distribution data yet.</div>;
  }

  const activeSegment = hoverIndex != null ? segments[hoverIndex] : null;

  return (
    <div className="donut-chart">
      <div className="donut-chart-svg-wrap">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="donut-chart-svg">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--bg-light)"
            strokeWidth={STROKE}
          />
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
              className="donut-chart-segment"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>
        <div className="donut-chart-center">
          <span className="donut-chart-center-value">{activeSegment ? activeSegment.value : total}</span>
          <span className="donut-chart-center-label">{activeSegment ? activeSegment.label : 'Total Days'}</span>
        </div>
      </div>

      <ul className="donut-chart-legend">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={hoverIndex === i ? 'active' : ''}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <span className="donut-chart-legend-dot" style={{ background: seg.color }} />
            <span className="donut-chart-legend-label">{seg.label}</span>
            <span className="donut-chart-legend-value">{seg.value}d</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaveDistributionChart;
