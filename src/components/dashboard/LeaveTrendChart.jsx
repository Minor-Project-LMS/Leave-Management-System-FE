import { useMemo, useState } from 'react';
import './LeaveTrendChart.css';

const WIDTH = 560;
const HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 28, left: 28 };

const LeaveTrendChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const { points, maxValue, path } = useMemo(() => {
    if (!data.length) return { points: [], maxValue: 0, path: '' };

    const max = Math.max(...data.map((d) => d.days), 1);
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const step = innerW / (data.length - 1 || 1);

    const pts = data.map((d, i) => {
      const x = PADDING.left + step * i;
      const y = PADDING.top + innerH - (d.days / max) * innerH;
      return { x, y, ...d };
    });

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PADDING.top + innerH} L ${pts[0].x} ${PADDING.top + innerH} Z`;

    return { points: pts, maxValue: max, path: linePath, areaPath };
  }, [data]);

  if (!data.length) {
    return <div className="chart-empty">No leave usage data yet.</div>;
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="trend-chart-svg">
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * t;
          return (
            <line
              key={t}
              x1={PADDING.left}
              y1={y}
              x2={WIDTH - PADDING.right}
              y2={y}
              className="trend-chart-grid"
            />
          );
        })}

        <path
          d={`${path} L ${points[points.length - 1].x} ${HEIGHT - PADDING.bottom} L ${points[0].x} ${HEIGHT - PADDING.bottom} Z`}
          className="trend-chart-area"
        />
        <path d={path} className="trend-chart-line" />

        {points.map((p, i) => (
          <g key={p.month}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 5 : 3.5}
              className="trend-chart-dot"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <text x={p.x} y={HEIGHT - 8} textAnchor="middle" className="trend-chart-axis-label">
              {p.month}
            </text>
          </g>
        ))}

        {hovered && (
          <g>
            <line
              x1={hovered.x}
              y1={PADDING.top}
              x2={hovered.x}
              y2={HEIGHT - PADDING.bottom}
              className="trend-chart-hover-line"
            />
          </g>
        )}
      </svg>

      {hovered && (
        <div
          className="trend-chart-tooltip"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
        >
          <strong>{hovered.days}d</strong> {hovered.month}
        </div>
      )}

      <div className="trend-chart-max">Peak: {maxValue}d</div>
    </div>
  );
};

export default LeaveTrendChart;
