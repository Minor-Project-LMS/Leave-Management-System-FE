import { BarChartIcon } from '../icons/Icons';
import './TopActionsWidget.css';

const ACTION_COLORS = {
  CREATE: '#22c55e',
  UPDATE: '#3b82f6',
  APPROVE: '#10b981',
  LOGIN: '#8b5cf6',
  DELETE: '#ef4444',
  OTHER: '#94a3b8',
};

const TopActionsWidget = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="top-actions-widget loading">
        <div className="widget-header">
          <h3>Top Actions</h3>
        </div>
        <div className="top-actions-skeleton">
          <div className="top-actions-chart-skeleton" />
          <div className="top-actions-legend-skeleton">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="top-actions-legend-item-skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="top-actions-widget">
        <div className="widget-header">
          <h3>Top Actions</h3>
        </div>
        <div className="widget-empty">
          <BarChartIcon width={32} height={32} />
          <p>No action data available</p>
        </div>
      </div>
    );
  }

  // Calculate the donut chart segments
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let cumulativePercentage = 0;

  const segments = data.map((item) => {
    const percentage = (item.count / total) * 100;
    const segment = {
      ...item,
      percentage,
      startAngle: cumulativePercentage,
      endAngle: cumulativePercentage + percentage,
    };
    cumulativePercentage += percentage;
    return segment;
  });

  // Create SVG path for donut segment
  const createDonutSegment = (startAngle, endAngle, color) => {
  if (endAngle - startAngle >= 99.9) {
    return { isFullCircle: true, color };
  }

  const radius = 40;
  const center = 50;
  const startRad = (startAngle / 100) * 2 * Math.PI - Math.PI / 2;
  const endRad = (endAngle / 100) * 2 * Math.PI - Math.PI / 2;

  const x1 = center + radius * Math.cos(startRad);
  const y1 = center + radius * Math.sin(startRad);
  const x2 = center + radius * Math.cos(endRad);
  const y2 = center + radius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle > 50 ? 1 : 0;
  const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

  return { path, color, isFullCircle: false };
};

  return (
    <div className="top-actions-widget">
      <div className="widget-header">
        <h3>Top Actions</h3>
      </div>

      <div className="top-actions-content">
        {/* Donut Chart */}
        <div className="top-actions-chart">
          <svg viewBox="0 0 100 100" className="donut-chart">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
            />
            
            {/* Segments */}
            {segments.map((segment, index) => {
              const { path, color } = createDonutSegment(
                segment.startAngle,
                segment.endAngle,
                ACTION_COLORS[segment.action] || ACTION_COLORS.OTHER
              );
              return (
                <path
                  key={index}
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="12"
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Center text */}
            <text
              x="50"
              y="45"
              textAnchor="middle"
              className="donut-chart-total"
            >
              {total.toLocaleString()}
            </text>
            <text
              x="50"
              y="58"
              textAnchor="middle"
              className="donut-chart-label"
            >
              Total
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="top-actions-legend">
          {segments.map((segment, index) => (
            <div key={index} className="top-actions-legend-item">
              <div
                className="legend-color"
                style={{
                  backgroundColor: ACTION_COLORS[segment.action] || ACTION_COLORS.OTHER,
                }}
              />
              <div className="legend-info">
                <span className="legend-action">{segment.action}</span>
                <span className="legend-count">{segment.count.toLocaleString()}</span>
              </div>
              <span className="legend-percentage">{segment.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopActionsWidget;