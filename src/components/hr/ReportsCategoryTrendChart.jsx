import { useMemo, useState } from 'react';
import './ReportsCategoryTrendChart.css';

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 };

const SERIES = [
  { key: 'casual', label: 'Casual Leave (CL)', className: 'line-casual' },
  { key: 'sick', label: 'Sick Leave (SL)', className: 'line-sick' },
  { key: 'earned', label: 'Earned Leave (EL)', className: 'line-earned' },
  { key: 'compOff', label: 'Comp-Off (CO)', className: 'line-compoff' },
];

// data: [{ month, casual, sick, earned, compOff }]
// NOTE: there is no backend endpoint that breaks leave-trend down by
// category (the real /reports/leave-trend only returns a single aggregate
// { month, days } — see LeaveByMonthBarChart for the real-data version of
// this same time period). This chart is mock-only until such an endpoint
// exists.
const ReportsCategoryTrendChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const { paths, points, maxValue, yTicks } = useMemo(() => {
    if (!data.length) return { paths: {}, points: [], maxValue: 0, yTicks: [] };

    const max = Math.max(...data.flatMap((d) => SERIES.map((s) => d[s.key] || 0)), 1);
    const axisMax = Math.max(10, Math.ceil(max / 10) * 10);
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const step = innerW / (data.length - 1 || 1);
    const toY = (v) => PADDING.top + innerH - (v / axisMax) * innerH;

    const pts = data.map((d, i) => {
      const point = { x: PADDING.left + step * i, month: d.month };
      SERIES.forEach((s) => {
        point[s.key] = toY(d[s.key] || 0);
      });
      return point;
    });

    const seriesPaths = {};
    SERIES.forEach((s) => {
      seriesPaths[s.key] = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p[s.key]}`).join(' ');
    });

    return { paths: seriesPaths, points: pts, maxValue: axisMax, yTicks: [0, axisMax / 2, axisMax] };
  }, [data]);

  if (!data.length) {
    return <div className="chart-empty">No leave trend data yet.</div>;
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null;
  const hoveredPoint = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="category-trend-chart">
      <div className="category-trend-legend">
        {SERIES.map((s) => (
          <span key={s.key} className="category-trend-legend-item">
            <span className={`category-trend-dot ${s.className}`} /> {s.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="category-trend-svg">
        {yTicks.map((tick) => {
          const innerH = HEIGHT - PADDING.top - PADDING.bottom;
          const y = PADDING.top + innerH - (tick / maxValue) * innerH;
          return (
            <g key={tick}>
              <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} className="category-trend-grid" />
              <text x={4} y={y + 4} className="category-trend-axis-label">
                {tick}
              </text>
            </g>
          );
        })}

        {SERIES.map((s) => (
          <path key={s.key} d={paths[s.key]} className={`category-trend-line ${s.className}`} />
        ))}

        {points.map((p, i) => (
          <g key={p.month}>
            {SERIES.map((s) => (
              <circle
                key={s.key}
                cx={p.x}
                cy={p[s.key]}
                r={hoverIndex === i ? 4.5 : 3}
                className={`category-trend-dot-marker ${s.className}`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            ))}
            <text x={p.x} y={HEIGHT - 8} textAnchor="middle" className="category-trend-axis-label">
              {p.month}
            </text>
          </g>
        ))}

        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={PADDING.top}
            x2={hoveredPoint.x}
            y2={HEIGHT - PADDING.bottom}
            className="category-trend-hover-line"
          />
        )}
      </svg>

      {hovered && hoveredPoint && (
        <div className="category-trend-tooltip" style={{ left: `${(hoveredPoint.x / WIDTH) * 100}%`, top: '8px' }}>
          <strong>{hovered.month}</strong>: CL {hovered.casual} · SL {hovered.sick} · EL {hovered.earned} · CO{' '}
          {hovered.compOff}
        </div>
      )}
    </div>
  );
};

export default ReportsCategoryTrendChart;
