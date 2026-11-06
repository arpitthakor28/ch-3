import React from 'react';

export interface DataPoint {
  x: number | string;
  y: number | null;
}

export interface DataSeries {
  id: string;
  label: string;
  color: string;
  markerShape: 'circle' | 'diamond' | 'square' | 'triangle';
  lineDash?: string;
  data: (number | null)[];
}

interface GraphProps {
  title?: string;
  xLabels: string[];
  yMin?: number;
  yMax: number;
  yStep: number;
  yUnit?: string;
  series: DataSeries[];
  ghostSeries?: { label: string; xIndex: number; y: number }[];
  className?: string;
}

export const Graph: React.FC<GraphProps> = ({
  title,
  xLabels,
  yMin = 0,
  yMax,
  yStep,
  yUnit = 'cm',
  series,
  ghostSeries = [],
  className = '',
}) => {
  const width = 460;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax + 0.001; val += yStep) {
    yTicks.push(Number(val.toFixed(1)));
  }

  const getX = (index: number) => {
    if (xLabels.length <= 1) return padding.left;
    return padding.left + (index / (xLabels.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const renderMarker = (shape: string, cx: number, cy: number, color: string, label: string) => {
    switch (shape) {
      case 'diamond':
        return (
          <polygon
            points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`}
            fill={color}
            stroke="#ffffff"
            strokeWidth="1.5"
            aria-label={label}
          />
        );
      case 'square':
        return (
          <rect
            x={cx - 4.5}
            y={cy - 4.5}
            width={9}
            height={9}
            fill={color}
            stroke="#ffffff"
            strokeWidth="1.5"
            aria-label={label}
          />
        );
      case 'triangle':
        return (
          <polygon
            points={`${cx},${cy - 5} ${cx + 5},${cy + 4} ${cx - 5},${cy + 4}`}
            fill={color}
            stroke="#ffffff"
            strokeWidth="1.5"
            aria-label={label}
          />
        );
      case 'circle':
      default:
        return (
          <circle
            cx={cx}
            cy={cy}
            r="4.5"
            fill={color}
            stroke="#ffffff"
            strokeWidth="1.5"
            aria-label={label}
          />
        );
    }
  };

  return (
    <div className={`vls-graph-container ${className}`} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
      {title && (
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text)' }}>
          {title}
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label={title || 'Measurement Line Graph'}
      >
        {/* Y Grid and Ticks */}
        {yTicks.map((tick) => {
          const yPos = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={yPos}
                x2={width - padding.right}
                y2={yPos}
                stroke="var(--border)"
                strokeDasharray="2,3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={yPos + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text)"
                opacity="0.75"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {xLabels.map((lbl, i) => {
          const xPos = getX(i);
          return (
            <g key={lbl}>
              <line
                x1={xPos}
                y1={padding.top + plotHeight}
                x2={xPos}
                y2={padding.top + plotHeight + 5}
                stroke="var(--text)"
                strokeWidth="1"
              />
              <text
                x={xPos}
                y={padding.top + plotHeight + 18}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text)"
                fontWeight="500"
              >
                {lbl}
              </text>
            </g>
          );
        })}

        {/* Axis lines */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="var(--text)"
          strokeWidth="1.5"
        />
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={width - padding.right}
          y2={padding.top + plotHeight}
          stroke="var(--text)"
          strokeWidth="1.5"
        />

        {/* Ghost Series (e.g., Jar B would-have-been Day 4 without cut, AC-M01-6 / PRD 6) */}
        {ghostSeries.map((ghost, idx) => {
          const xPos = getX(ghost.xIndex);
          const yPos = getY(ghost.y);
          return (
            <g key={idx} opacity="0.45">
              <circle cx={xPos} cy={yPos} r="5" fill="none" stroke="var(--secondary)" strokeDasharray="2,2" strokeWidth="2" />
              <text x={xPos} y={yPos - 8} textAnchor="middle" fontSize="9" fill="var(--secondary)" fontStyle="italic">
                {ghost.label} ({ghost.y} {yUnit})
              </text>
            </g>
          );
        })}

        {/* Series Lines and Data points */}
        {series.map((s) => {
          const pointsWithCoords: { x: number; y: number; val: number; index: number }[] = [];
          s.data.forEach((val, idx) => {
            if (val !== null && val !== undefined) {
              pointsWithCoords.push({
                x: getX(idx),
                y: getY(val),
                val,
                index: idx,
              });
            }
          });

          if (pointsWithCoords.length === 0) return null;

          const pathD = pointsWithCoords.reduce(
            (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
            ''
          );

          // Direct line label at the last recorded point (AC-M01-6 readable without color)
          const lastPt = pointsWithCoords[pointsWithCoords.length - 1];

          return (
            <g key={s.id} className="graph-series">
              <path
                d={pathD}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeDasharray={s.lineDash || 'none'}
              />
              {pointsWithCoords.map((pt) => (
                <g key={pt.index}>
                  {renderMarker(
                    s.markerShape,
                    pt.x,
                    pt.y,
                    s.color,
                    `${s.label} Day ${pt.index + 1}: ${pt.val} ${yUnit}`
                  )}
                </g>
              ))}
              {lastPt && (
                <text
                  x={lastPt.x + 8}
                  y={lastPt.y + 4}
                  fontSize="10"
                  fontWeight="700"
                  fill={s.color}
                >
                  {s.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Y Axis Unit */}
        <text
          x={padding.left - 5}
          y={padding.top - 8}
          textAnchor="end"
          fontSize="10"
          fill="var(--text)"
          opacity="0.8"
        >
          {yUnit}
        </text>
      </svg>

      {/* Accessible legend below with direct shapes and labels */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.8rem', justifyContent: 'center' }}>
        {series.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: s.color,
                borderRadius: s.markerShape === 'circle' ? '50%' : s.markerShape === 'diamond' ? '2px' : '0',
                transform: s.markerShape === 'diamond' ? 'rotate(45deg)' : 'none',
              }}
            />
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>
              {s.label} ({s.markerShape}, {s.lineDash ? 'dashed' : 'solid'})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
