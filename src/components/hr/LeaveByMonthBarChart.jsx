import { useMemo, useState } from 'react';
import './LeaveByMonthBarChart.css';

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 28, left: 32 };

// data: [{ month, days }] — matches LeaveTrendPoint from GET /reports/leave-trend
const LeaveByMonthBarChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const { bars, maxValue, yTicks } = useMemo(() => {
    if (!data.length) return { bars: [], maxValue: 0, yTicks: [] };

    const max = Math.max(...data.map((d) => d.days || 0), 1);
    const axisMax = Math.max(20, Math.ceil(max / 20) * 20);
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const slot = innerW / data.length;
    const barWidth = Math.min(28, slot * 0.55);

    const toY = (v) => PADDING.top + innerH - (v / axisMax) * innerH;

    const items = data.map((d, i) => {
      const x = PADDING.left + slot * i + (slot - barWidth) / 2;
      const y = toY(d.days || 0);
      return { x, y, width: barWidth, height: PADDING.top + innerH - y, month: d.month, days: d.days };
    });

    return { bars: items, maxValue: axisMax, yTicks: [0, axisMax / 2, axisMax] };
  }, [data]);

  if (!data.length) {
    return <div className="chart-empty">No monthly leave data yet.</div>;
  }

  const innerH = HEIGHT - PADDING.top - PADDING.bottom;

  return (
    <div className="month-bar-chart">
      <div className="month-bar-legend">
        <span className="month-bar-legend-item">
          <span className="month-bar-dot" /> Total Leaves
        </span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="month-bar-svg">
        {yTicks.map((tick) => {
          const y = PADDING.top + innerH - (tick / maxValue) * innerH;
          return (
            <g key={tick}>
              <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} className="month-bar-grid" />
              <text x={4} y={y + 4} className="month-bar-axis-label">
                {tick}
              </text>
            </g>
          );
        })}

        {bars.map((b, i) => (
          <g key={b.month}>
            <rect
              x={b.x}
              y={b.y}
              width={b.width}
              height={b.height}
              rx={3}
              className={`month-bar-rect ${hoverIndex === i ? 'active' : ''}`}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <text x={b.x + b.width / 2} y={HEIGHT - 8} textAnchor="middle" className="month-bar-axis-label">
              {b.month}
            </text>
          </g>
        ))}
      </svg>

      {hoverIndex != null && (
        <div
          className="month-bar-tooltip"
          style={{ left: `${((bars[hoverIndex].x + bars[hoverIndex].width / 2) / WIDTH) * 100}%` }}
        >
          <strong>{bars[hoverIndex].month}</strong>: {bars[hoverIndex].days} days
        </div>
      )}
    </div>
  );
};

export default LeaveByMonthBarChart;
