import { useMemo, useState } from 'react';
import './ReportsCategoryTrendChart.css';

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 };

// Rounds the y-axis ceiling up to a multiple of 4 (minimum 4) so the middle
// gridline always lands on a whole number, and small real-world values
// aren't squashed against the bottom of a 0-10 axis.
const niceMax = (max) => (max <= 4 ? 4 : Math.ceil(max / 4) * 4);

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// data: [{ category, color, points: [{ month, days }] }]
// One line per leave type that has leave in the period, straight from
// GET /reports/leave-trend-by-type — so custom leave types HR adds show up
// here too, instead of the four that used to be hardcoded.
const ReportsCategoryTrendChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const model = useMemo(() => {
    const series = (Array.isArray(data) ? data : []).filter(
      (s) => Array.isArray(s?.points) && s.points.length > 0
    );
    if (!series.length) return null;

    const months = series[0].points.map((p) => p.month);
    const max = Math.max(1, ...series.flatMap((s) => s.points.map((p) => Number(p.days) || 0)));
    const axisMax = niceMax(max);

    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const step = innerW / (months.length - 1 || 1);
    const xAt = (i) => PADDING.left + step * i;
    const yAt = (v) => PADDING.top + innerH - ((Number(v) || 0) / axisMax) * innerH;

    const lines = series.map((s) => ({
      category: s.category,
      color: s.color,
      points: s.points.map((p, i) => ({ x: xAt(i), y: yAt(p.days), days: Number(p.days) || 0 })),
      path: s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p.days)}`).join(' '),
    }));

    return { months, lines, axisMax, xAt, step, innerH };
  }, [data]);

  if (!model) {
    return <div className="chart-empty">No leave trend data yet.</div>;
  }

  const { months, lines, axisMax, xAt, step, innerH } = model;
  const yTicks = [0, axisMax / 2, axisMax];
  const hoverX = hoverIndex != null ? xAt(hoverIndex) : null;

  return (
    <div className="category-trend-chart">
      <div className="category-trend-legend">
        {lines.map((l) => (
          <span key={l.category} className="category-trend-legend-item">
            <span className="category-trend-dot" style={{ background: l.color }} /> {l.category}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="category-trend-svg">
        {yTicks.map((tick) => {
          const y = PADDING.top + innerH - (tick / axisMax) * innerH;
          return (
            <g key={tick}>
              <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} className="category-trend-grid" />
              <text x={4} y={y + 4} className="category-trend-axis-label">
                {fmt(tick)}
              </text>
            </g>
          );
        })}

        {lines.map((l) => (
          <path key={l.category} d={l.path} className="category-trend-line" style={{ stroke: l.color }} />
        ))}

        {hoverX != null && (
          <line
            x1={hoverX}
            y1={PADDING.top}
            x2={hoverX}
            y2={HEIGHT - PADDING.bottom}
            className="category-trend-hover-line"
          />
        )}

        {lines.map((l) =>
          l.points.map((p, i) => (
            <circle
              key={`${l.category}-${months[i]}`}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 4.5 : 3}
              className="category-trend-dot-marker"
              style={{ stroke: l.color }}
            />
          ))
        )}

        {months.map((month, i) => (
          <text key={month} x={xAt(i)} y={HEIGHT - 8} textAnchor="middle" className="category-trend-axis-label">
            {month}
          </text>
        ))}

        {/* One hover column per month, so hovering anywhere near a month
            shows that month's numbers rather than needing to hit a dot. */}
        {months.map((month, i) => (
          <rect
            key={`hit-${month}`}
            x={xAt(i) - step / 2}
            y={PADDING.top}
            width={step}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>

      {hoverIndex != null && (
        <div className="category-trend-tooltip" style={{ left: `${(hoverX / WIDTH) * 100}%`, top: '8px' }}>
          <strong>{months[hoverIndex]}</strong>:{' '}
          {lines.map((l, idx) => (
            <span key={l.category}>
              {idx > 0 ? ' · ' : ''}
              {l.category} {fmt(l.points[hoverIndex].days)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsCategoryTrendChart;
