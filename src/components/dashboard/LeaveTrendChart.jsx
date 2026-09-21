import { useMemo, useState } from 'react';
import './LeaveTrendChart.css';

const WIDTH = 560;
const HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 28, left: 28 };
const DEFAULT_COLOR = '#2563eb';

// Accepts either the new multi-series shape ([{ category, color, points: [{month, days}] }])
// or a legacy flat shape ([{ month, days }]), normalizing the latter into a
// single unnamed series so older/mocked data still renders.
const normalizeSeries = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  if (data[0]?.points) {
    return data.filter((s) => Array.isArray(s.points) && s.points.length > 0);
  }
  return [{ category: null, color: DEFAULT_COLOR, points: data }];
};

const LeaveTrendChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const series = useMemo(() => normalizeSeries(data), [data]);
  const monthCount = series[0]?.points.length ?? 0;

  const { computedSeries, months } = useMemo(() => {
    if (!series.length || !monthCount) return { computedSeries: [], months: [] };

    const allDays = series.flatMap((s) => s.points.map((p) => p.days ?? 0));
    const max = Math.max(...allDays, 1);
    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;
    const step = innerW / (monthCount - 1 || 1);

    const withCoords = series.map((s) => {
      const pts = s.points.map((p, i) => {
        const x = PADDING.left + step * i;
        const y = PADDING.top + innerH - ((p.days ?? 0) / max) * innerH;
        return { ...p, x, y };
      });
      const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      return { ...s, points: pts, path };
    });

    return { computedSeries: withCoords, months: series[0].points.map((p) => p.month) };
  }, [series, monthCount]);

  if (!series.length || !monthCount) {
    return <div className="chart-empty">No leave usage data yet.</div>;
  }

  const innerW = WIDTH - PADDING.left - PADDING.right;
  const step = innerW / (monthCount - 1 || 1);
  const hasMultipleSeries = computedSeries.length > 1 || computedSeries[0]?.category;

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

          {computedSeries.map((s) => (
              <path
                  key={s.category ?? 'default'}
                  d={s.path}
                  className="trend-chart-line"
                  stroke={s.color || DEFAULT_COLOR}
              />
          ))}

          {computedSeries.map((s) =>
              s.points.map((p, i) => (
                  <circle
                      key={`${s.category ?? 'default'}-${p.month}`}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIndex === i ? 5 : 3.5}
                      className="trend-chart-dot"
                      stroke={s.color || DEFAULT_COLOR}
                  />
              ))
          )}

          {months.map((month, i) => (
              <rect
                  key={`hit-${month}`}
                  x={PADDING.left + step * i - step / 2}
                  y={0}
                  width={step}
                  height={HEIGHT - PADDING.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
              />
          ))}

          {months.map((month, i) => (
              <text
                  key={month}
                  x={PADDING.left + step * i}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="trend-chart-axis-label"
              >
                {month}
              </text>
          ))}

          {hoverIndex != null && (
              <line
                  x1={PADDING.left + step * hoverIndex}
                  y1={PADDING.top}
                  x2={PADDING.left + step * hoverIndex}
                  y2={HEIGHT - PADDING.bottom}
                  className="trend-chart-hover-line"
              />
          )}
        </svg>

        {hoverIndex != null && (
            <div
                className="trend-chart-tooltip"
                style={{ left: `${((PADDING.left + step * hoverIndex) / WIDTH) * 100}%`, top: '4px' }}
            >
              <strong>{months[hoverIndex]}</strong>
              {computedSeries.map((s) => (
                  <div key={s.category ?? 'default'} className="trend-chart-tooltip-row">
                    {s.category && (
                        <span className="trend-chart-tooltip-dot" style={{ background: s.color || DEFAULT_COLOR }} />
                    )}
                    {s.category ? `${s.category}: ` : ''}
                    {s.points[hoverIndex].days}d
                  </div>
              ))}
            </div>
        )}

        {hasMultipleSeries && (
            <ul className="trend-chart-legend">
              {computedSeries.map((s) => (
                  <li key={s.category ?? 'default'}>
                    <span className="trend-chart-legend-dot" style={{ background: s.color || DEFAULT_COLOR }} />
                    {s.category}
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
};

export default LeaveTrendChart;