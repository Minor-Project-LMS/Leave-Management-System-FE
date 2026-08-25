import { useMemo, useState } from 'react';
import './HRLeaveTrendChart.css';

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 };

// data: [{ month, requests, approved }]
const HRLeaveTrendChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const { requestsPath, approvedPath, points, maxValue, yTicks } = useMemo(() => {
    if (!data.length) return { points: [], maxValue: 0, yTicks: [] };

    const max = Math.max(...data.map((d) => Math.max(d.requests, d.approved)), 1);
    // Round the axis max up to a friendly multiple of 30 (60, 30, 0 like the reference design)
    const axisMax = Math.max(30, Math.ceil(max / 30) * 30);
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const step = innerW / (data.length - 1 || 1);

    const toY = (v) => PADDING.top + innerH - (v / axisMax) * innerH;

    const pts = data.map((d, i) => ({
      x: PADDING.left + step * i,
      yRequests: toY(d.requests),
      yApproved: toY(d.approved),
      ...d,
    }));

    const buildPath = (key) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p[key]}`).join(' ');

    return {
      requestsPath: buildPath('yRequests'),
      approvedPath: buildPath('yApproved'),
      points: pts,
      maxValue: axisMax,
      yTicks: [0, axisMax / 2, axisMax],
    };
  }, [data]);

  if (!data.length) {
    return <div className="chart-empty">No leave trend data yet.</div>;
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  return (
    <div className="hr-trend-chart">
      <div className="hr-trend-chart-legend">
        <span className="hr-trend-legend-item">
          <span className="hr-trend-dot dot-requests" /> Requests
        </span>
        <span className="hr-trend-legend-item">
          <span className="hr-trend-dot dot-approved" /> Approved
        </span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="hr-trend-chart-svg">
        {yTicks.map((tick) => {
          const innerH = HEIGHT - PADDING.top - PADDING.bottom;
          const y = PADDING.top + innerH - (tick / maxValue) * innerH;
          return (
            <g key={tick}>
              <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} className="hr-trend-grid" />
              <text x={4} y={y + 4} className="hr-trend-axis-label">
                {tick}
              </text>
            </g>
          );
        })}

        <path d={requestsPath} className="hr-trend-line line-requests" />
        <path d={approvedPath} className="hr-trend-line line-approved" />

        {points.map((p, i) => (
          <g key={p.month}>
            <circle
              cx={p.x}
              cy={p.yRequests}
              r={hoverIndex === i ? 5 : 3.5}
              className="hr-trend-dot-marker dot-requests"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <circle
              cx={p.x}
              cy={p.yApproved}
              r={hoverIndex === i ? 5 : 3.5}
              className="hr-trend-dot-marker dot-approved"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <text x={p.x} y={HEIGHT - 8} textAnchor="middle" className="hr-trend-axis-label">
              {p.month}
            </text>
          </g>
        ))}

        {hovered && (
          <line
            x1={hovered.x}
            y1={PADDING.top}
            x2={hovered.x}
            y2={HEIGHT - PADDING.bottom}
            className="hr-trend-hover-line"
          />
        )}
      </svg>

      {hovered && (
        <div
          className="hr-trend-chart-tooltip"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.yRequests / HEIGHT) * 100}%` }}
        >
          <strong>{hovered.requests}</strong> requests · <strong>{hovered.approved}</strong> approved
        </div>
      )}
    </div>
  );
};

export default HRLeaveTrendChart;
