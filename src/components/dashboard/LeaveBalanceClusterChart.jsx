import { useMemo, useState } from 'react';
import './LeaveBalanceClusterChart.css';

const W = 720;
const H = 300;
const PAD = { top: 22, right: 12, bottom: 30, left: 34 };
const MAX_BAR_W = 68;
const USED_COLOR = '#dc2626'; // red
const REMAINING_COLOR = '#86efac'; // light green
const MIN_ZONE = 18; // smallest hoverable height for the lower part
const MIN_LABEL_H = 16; // segments shorter than this get no in-bar number

const normalizeName = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// Rounds the y-axis ceiling up to a multiple of 4 (minimum 4) so the four
// gridline intervals always land on whole numbers.
const niceMax = (max) => (max <= 4 ? 4 : Math.ceil(max / 4) * 4);

// trend:  [{ category, color, points: [{ month, days }] }] — days used per
//         month for each leave type (same data as the Leave Usage Trend).
// ledger: [{ categoryName, used, availableBalance }] — this year's balances.
//
// One chart, one bar per leave type. Each bar is split in two: the upper
// part (red) is what's been used, the lower part (green) is what's still
// remaining. Hovering the red part shows the used days; hovering the green
// part shows the remaining days.
const LeaveBalanceClusterChart = ({ trend = [], ledger = [] }) => {
  const [hover, setHover] = useState(null); // { index, part: 'used' | 'remaining' }

  const model = useMemo(() => {
    const types = (Array.isArray(trend) ? trend : []).filter(
      (s) => Array.isArray(s?.points) && s.points.length > 0
    );
    if (!types.length) return null;

    const ledgerRows = Array.isArray(ledger) ? ledger : [];
    const ledgerByName = new Map(ledgerRows.map((l) => [normalizeName(l.categoryName), l]));

    const rows = types.map((s) => {
      const entry = ledgerByName.get(normalizeName(s.category));
      const usedFromTrend = s.points.reduce((sum, p) => sum + toNumber(p.days), 0);
      return {
        name: s.category,
        color: s.color,
        used: entry ? toNumber(entry.used) : usedFromTrend,
        remaining: entry ? toNumber(entry.availableBalance ?? entry.closingBalance) : 0,
        hasBalance: Boolean(entry),
      };
    });

    return { rows, remainingKnown: rows.some((r) => r.hasBalance) };
  }, [trend, ledger]);

  if (!model) {
    return (
      <div className="balance-chart">
        <div className="balance-chart-header">
          <h3>Leave Used vs Remaining</h3>
        </div>
        <div className="chart-empty">No leave data yet.</div>
      </div>
    );
  }

  const { rows, remainingKnown } = model;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const band = innerW / rows.length;
  const barW = Math.min(band * 0.5, MAX_BAR_W);
  const baseY = PAD.top + innerH;
  const max = niceMax(Math.max(0, ...rows.map((r) => r.used + r.remaining)));
  const heightOf = (v) => (v / max) * innerH;

  const bars = rows.map((r, i) => {
    const x = PAD.left + band * i + (band - barW) / 2;
    const remH = heightOf(r.remaining);
    const usedH = heightOf(r.used);
    const remTop = baseY - remH; // where the lower part ends and the upper part begins
    const usedTop = remTop - usedH;
    // Hover zones split each column at the used/remaining boundary, so the
    // upper part always shows "used" and the lower part "remaining" — even
    // when one of them is zero or too thin to point at.
    const splitY = Math.min(remTop, baseY - MIN_ZONE);
    return { ...r, i, x, remH, usedH, remTop, usedTop, splitY };
  });

  const active = hover ? bars[hover.index] : null;
  let tooltip = null;
  if (active) {
    const isUsed = hover.part === 'used';
    const value = isUsed ? active.used : active.remaining;
    const anchorY = isUsed
      ? active.usedH > 0
        ? active.usedTop + active.usedH / 2
        : active.splitY - 14
      : active.remH > 0
        ? active.remTop + active.remH / 2
        : baseY - 10;
    const placeLeft = active.i === rows.length - 1;
    tooltip = {
      color: isUsed ? USED_COLOR : REMAINING_COLOR,
      name: active.name,
      label: isUsed ? 'Used' : 'Remaining',
      value,
      left: ((placeLeft ? active.x - 10 : active.x + barW + 10) / W) * 100,
      top: (Math.min(Math.max(anchorY, 24), H - 44) / H) * 100,
      transform: placeLeft ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
    };
  }

  return (
    <div className="balance-chart">
      <div className="balance-chart-header">
        <h3>Leave Used vs Remaining</h3>
        <ul className="balance-chart-legend">
          <li>
            <span className="balance-chart-swatch used" />
            Used
          </li>
          <li>
            <span className="balance-chart-swatch remaining" />
            Remaining
          </li>
        </ul>
      </div>

      <div className="balance-chart-body">
        <svg viewBox={`0 0 ${W} ${H}`} className="balance-chart-svg">
          <defs>
            {bars.map((b) => (
              <clipPath id={`balance-bar-clip-${b.i}`} key={b.name}>
                <rect x={b.x} y={b.usedTop} width={barW} height={Math.max(baseY - b.usedTop, 0)} rx={6} />
              </clipPath>
            ))}
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD.top + innerH * t;
            return (
              <g key={t}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} className="balance-chart-grid" />
                <text x={PAD.left - 6} y={y + 3} textAnchor="end" className="balance-chart-axis-label">
                  {fmt(max * (1 - t))}
                </text>
              </g>
            );
          })}

          {hover != null && (
            <rect
              x={PAD.left + band * hover.index}
              y={PAD.top}
              width={band}
              height={innerH}
              className="balance-chart-hover-band"
            />
          )}

          {bars.map((b) => (
            <g key={b.name}>
              {b.usedH + b.remH > 0 && (
                <g clipPath={`url(#balance-bar-clip-${b.i})`}>
                  <rect x={b.x} y={b.remTop} width={barW} height={b.remH} fill={REMAINING_COLOR} />
                  <rect x={b.x} y={b.usedTop} width={barW} height={b.usedH} fill={USED_COLOR} />
                  {hover?.index === b.i && (
                    <rect
                      x={b.x}
                      y={hover.part === 'used' ? b.usedTop : b.remTop}
                      width={barW}
                      height={hover.part === 'used' ? b.usedH : b.remH}
                      className="balance-chart-hover-part"
                    />
                  )}
                </g>
              )}

              {b.usedH >= MIN_LABEL_H && (
                <text x={b.x + barW / 2} y={b.usedTop + b.usedH / 2 + 4} textAnchor="middle" className="balance-chart-value on-solid">
                  {fmt(b.used)}
                </text>
              )}
              {b.remH >= MIN_LABEL_H && (
                <text x={b.x + barW / 2} y={b.remTop + b.remH / 2 + 4} textAnchor="middle" className="balance-chart-value">
                  {fmt(b.remaining)}
                </text>
              )}
            </g>
          ))}

          {bars.map((b) => (
            <text
              key={`label-${b.name}`}
              x={PAD.left + band * b.i + band / 2}
              y={H - 10}
              textAnchor="middle"
              className="balance-chart-axis-label"
            >
              {b.name}
            </text>
          ))}

          {/* Hover zones: upper part -> used, lower part -> remaining */}
          {bars.map((b) => (
            <g key={`zones-${b.name}`}>
              <rect
                x={PAD.left + band * b.i}
                y={PAD.top - 12}
                width={band}
                height={b.splitY - (PAD.top - 12)}
                fill="transparent"
                onMouseEnter={() => setHover({ index: b.i, part: 'used' })}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={PAD.left + band * b.i}
                y={b.splitY}
                width={band}
                height={baseY - b.splitY}
                fill="transparent"
                onMouseEnter={() => setHover({ index: b.i, part: 'remaining' })}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          ))}
        </svg>

        {tooltip && (
          <div
            className="balance-chart-tooltip"
            style={{ left: `${tooltip.left}%`, top: `${tooltip.top}%`, transform: tooltip.transform }}
          >
            <strong>{tooltip.name}</strong>
            <div className="balance-chart-tooltip-row">
              <span className="balance-chart-tooltip-dot" style={{ background: tooltip.color }} />
              {tooltip.label}: {fmt(tooltip.value)} {tooltip.value === 1 ? 'day' : 'days'}
            </div>
          </div>
        )}
      </div>

      {!remainingKnown && (
        <p className="balance-chart-note">Remaining balance isn&apos;t available right now, so only used days are shown.</p>
      )}
    </div>
  );
};

export default LeaveBalanceClusterChart;
