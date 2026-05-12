import { useState } from 'react';
import { phases } from '../data/phases';

const VW = 1100;
const VH = 420;
const PAD_X = 60;
const PAD_Y_TOP = 48;
const PAD_Y_BOT = 118;
const USABLE_W = VW - PAD_X * 2;
const USABLE_H = VH - PAD_Y_TOP - PAD_Y_BOT;
const LABEL_Y  = VH - PAD_Y_BOT + 22;
const BOTTOM_Y = PAD_Y_TOP + USABLE_H;

// Heat gradient stops aligned to 11 evenly-spaced phase positions (0%–100%)
const HEAT_STOPS = [
  { offset: '0%',   color: '#3B8BD4' },
  { offset: '10%',  color: '#3B8BD4' },
  { offset: '20%',  color: '#1D9E75' },
  { offset: '30%',  color: '#8BC34A' },
  { offset: '40%',  color: '#F9CB42' },
  { offset: '50%',  color: '#EF9F27' },
  { offset: '60%',  color: '#E24B4A' },
  { offset: '70%',  color: '#EF9F27' },
  { offset: '80%',  color: '#F9CB42' },
  { offset: '90%',  color: '#1D9E75' },
  { offset: '100%', color: '#3B8BD4' },
];

function getPoints() {
  return phases.map((phase, i) => ({
    x: PAD_X + (i / (phases.length - 1)) * USABLE_W,
    y: PAD_Y_TOP + (1 - phase.energyPct / 100) * USABLE_H,
    phase,
  }));
}

function buildLinePath(pts) {
  const d = [`M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`);
  }
  return d.join(' ');
}

function buildAreaPath(pts) {
  return `${buildLinePath(pts)} L ${pts[pts.length - 1].x},${BOTTOM_Y} L ${pts[0].x},${BOTTOM_Y} Z`;
}

export default function StoryArc({ selectedPhase, onSelectPhase }) {
  const [hoveredId, setHoveredId] = useState(null);
  const points   = getPoints();
  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points);

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full"
      style={{ display: 'block', maxHeight: 420 }}
      aria-label="Genea demo story arc"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          {HEAT_STOPS.map(({ offset, color }) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          {HEAT_STOPS.map(({ offset, color }) => (
            <stop key={offset} offset={offset} stopColor={color} stopOpacity="0.07" />
          ))}
        </linearGradient>
        <filter id="glowLg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowSm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = PAD_Y_TOP + (1 - pct / 100) * USABLE_H;
        return (
          <line key={pct} x1={PAD_X} y1={y} x2={VW - PAD_X} y2={y}
            stroke="#ffffff" strokeOpacity={pct === 100 ? 0.07 : 0.035} strokeWidth="1" />
        );
      })}

      {/* Y-axis labels */}
      {[{ label: 'PEAK', pct: 100 }, { label: 'HIGH', pct: 75 }, { label: 'MID', pct: 50 }, { label: 'LOW', pct: 25 }]
        .map(({ label, pct }) => (
          <text key={label}
            x={PAD_X - 7} y={PAD_Y_TOP + (1 - pct / 100) * USABLE_H + 3.5}
            textAnchor="end" fontSize="8" fill="#777" opacity="0.5"
            fontFamily="system-ui" letterSpacing="0.08em"
          >{label}</text>
        ))}

      {/* Axis label */}
      <text x={PAD_X - 34} y={PAD_Y_TOP + USABLE_H / 2}
        textAnchor="middle" fontSize="8" fill="#555" opacity="0.4"
        fontFamily="system-ui" letterSpacing="0.1em"
        transform={`rotate(-90, ${PAD_X - 34}, ${PAD_Y_TOP + USABLE_H / 2})`}
      >↑ ENERGY</text>

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Glow behind arc */}
      <path d={linePath} fill="none" stroke="url(#lineGrad)"
        strokeWidth="10" strokeOpacity="0.2" filter="url(#glowLg)" />

      {/* Main arc */}
      <path d={linePath} fill="none" stroke="url(#lineGrad)"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Nodes + labels */}
      {points.map(({ x, y, phase }) => {
        const isPeak     = phase.id === 'p6';
        const isSelected = selectedPhase?.id === phase.id;
        const isHovered  = hoveredId === phase.id;
        const nodeColor  = phase.nodeColor;
        const nodeR      = isPeak ? 11 : 7;
        const slideCount = phase.slides?.length ?? 0;

        const shortTitle = phase.title.length > 12
          ? phase.title.slice(0, 11) + '…'
          : phase.title;

        const tooltipLabel = slideCount > 0
          ? `${slideCount} slide${slideCount !== 1 ? 's' : ''}`
          : 'No slides yet';

        return (
          <g key={phase.id}
            onClick={() => onSelectPhase(phase)}
            onMouseEnter={() => setHoveredId(phase.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Dashed connector to label */}
            <line x1={x} y1={y + nodeR + 2} x2={x} y2={LABEL_Y - 9}
              stroke={nodeColor} strokeWidth="1" strokeOpacity="0.15" strokeDasharray="2 3" />

            {/* Hover / selected halo */}
            {(isHovered || isSelected) && (
              <circle cx={x} cy={y} r={nodeR + 7} fill={nodeColor} fillOpacity="0.12" />
            )}

            {/* Glow for peak / selected */}
            {(isPeak || isSelected) && (
              <circle cx={x} cy={y} r={nodeR} fill={nodeColor} filter="url(#glowSm)" opacity="0.55" />
            )}

            {/* Main circle */}
            <circle cx={x} cy={y} r={nodeR}
              fill={isSelected ? nodeColor : '#080810'}
              stroke={nodeColor} strokeWidth={isPeak ? 2.5 : 2}
            />

            {/* Inner dot when not selected */}
            {!isSelected && (
              <circle cx={x} cy={y} r={nodeR * 0.38} fill={nodeColor} opacity="0.7" />
            )}

            {/* Phase label */}
            <text x={x} y={LABEL_Y}
              textAnchor="middle" fontSize="8.5" fill={nodeColor}
              fontFamily="system-ui" fontWeight="700" letterSpacing="0.06em"
            >{phase.label.toUpperCase()}</text>

            {/* Title */}
            <text x={x} y={LABEL_Y + 14}
              textAnchor="middle" fontSize="9.5"
              fill={isSelected ? '#e2e8f0' : '#475569'} fontFamily="system-ui"
            >{shortTitle}</text>

            {/* Hover tooltip */}
            {isHovered && (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={x - 44} y={y - nodeR - 28}
                  width={88} height={20} rx={4}
                  fill="#13131f" stroke={nodeColor} strokeWidth="1" strokeOpacity="0.65"
                />
                <text x={x} y={y - nodeR - 14}
                  textAnchor="middle" fontSize="9.5"
                  fill={nodeColor} fontFamily="system-ui" fontWeight="600"
                >{tooltipLabel}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
