import { useMemo, useState } from 'react';
import './HRLeaveTrendChart.css';

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 };

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const HRLeaveTrendChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const normalizedData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((item) => ({
        month: item?.month || '',
        requests: toFiniteNumber(item?.requests),
        approved: toFiniteNumber(item?.approved),
      })),
    [data]
  );

  const { requestsPath, approvedPath, points, maxValue, yTicks } = useMemo(() => {
    if (!normalizedData.length) return { requestsPath: '', approvedPath: '', points: [], maxValue: 0, yTicks: [] };

    const max = Math.max(
      ...normalizedData.map((item) => Math.max(item.requests, item.approved)),
      1
    );
    const axisMax = Math.max(10, Math.ceil(max / 10) * 10);
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const step = innerW / (normalizedData.length - 1 || 1);
    const toY = (value) => PADDING.top + innerH - (value / axisMax) * innerH;

    const pts = normalizedData.map((item, index) => ({
      ...item,
      x: PADDING.left + step * index,
      yRequests: toY(item.requests),
      yApproved: toY(item.approved),
    }));

    const buildPath = (key) =>
      pts.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point[key]}`).join(' ');

    return {
      requestsPath: buildPath('yRequests'),
      approvedPath: buildPath('yApproved'),
      points: pts,
      maxValue: axisMax,
      yTicks: [0, axisMax / 2, axisMax],
    };
  }, [normalizedData]);

  if (!normalizedData.length) {
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
                {Number.isInteger(tick) ? tick : tick.toFixed(1)}
              </text>
            </g>
          );
        })}

        <path d={requestsPath} className="hr-trend-line line-requests" fill="none" />
        <path d={approvedPath} className="hr-trend-line line-approved" fill="none" />

        {points.map((point, index) => (
          <g key={`${point.month}-${index}`}>
            <circle
              cx={point.x}
              cy={point.yRequests}
              r={hoverIndex === index ? 5 : 3.5}
              className="hr-trend-dot-marker dot-requests"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <circle
              cx={point.x}
              cy={point.yApproved}
              r={hoverIndex === index ? 5 : 3.5}
              className="hr-trend-dot-marker dot-approved"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            />
            <text x={point.x} y={HEIGHT - 8} textAnchor="middle" className="hr-trend-axis-label">
              {point.month}
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
          <strong>{hovered.month}</strong>: {hovered.requests} requests · {hovered.approved} approved
        </div>
      )}
    </div>
  );
};

export default HRLeaveTrendChart;
