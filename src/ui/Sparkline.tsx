import { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';

/** Smooth monotone-ish path through points (Catmull-Rom → cubic Bézier). */
function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function Sparkline({
  data,
  width = 220,
  height = 64,
  color = '#1c6f45',
  fill = true,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  className?: string;
}) {
  const gid = useId();
  const reduce = useReducedMotion();
  const { line, area, last } = useMemo(() => {
    const series = data.length > 1 ? data : [0, ...(data.length ? data : [0])];
    const max = Math.max(...series, 1);
    const min = Math.min(...series, 0);
    const span = max - min || 1;
    const padY = 6;
    const pts: [number, number][] = series.map((v, i) => [
      (i / (series.length - 1)) * width,
      padY + (1 - (v - min) / span) * (height - padY * 2),
    ]);
    const l = smoothPath(pts);
    return { line: l, area: `${l} L ${width} ${height} L 0 ${height} Z`, last: pts[pts.length - 1] };
  }, [data, width, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-auto w-full', className)} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE }}
      />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill="#fff" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
