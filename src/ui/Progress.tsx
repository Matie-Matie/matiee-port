import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';

type Tone = 'brand' | 'warn' | 'danger' | 'ink' | 'light';

const BAR_TONES: Record<Tone, string> = {
  brand: 'bg-brand-600',
  warn: 'bg-warn-500',
  danger: 'bg-danger-500',
  ink: 'bg-ink',
  light: 'bg-white',
};

/**
 * Horizontal progress — animates via scaleX (GPU-safe). We observe the *track*
 * (not the zero-width bar) so IntersectionObserver reliably fires, then keep
 * tweening whenever `value` changes (e.g. dragging a progress slider).
 */
export function Bar({
  value,
  tone = 'brand',
  height = 8,
  className,
  trackClassName,
  label,
}: {
  value: number;
  tone?: Tone;
  height?: number;
  className?: string;
  trackClassName?: string;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
      style={{ height }}
      className={cn('w-full overflow-hidden rounded-full bg-ink/[0.07]', trackClassName)}
    >
      <motion.div
        className={cn('h-full w-full origin-left rounded-full', BAR_TONES[tone], className)}
        initial={{ scaleX: reduce ? v / 100 : 0 }}
        animate={{ scaleX: reduce || inView ? v / 100 : 0 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
    </div>
  );
}

/** Circular progress ring with centred content. */
export function Ring({
  value,
  size = 120,
  stroke = 10,
  children,
  tone = 'brand',
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: 'brand' | 'light';
  children?: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = size / 2;
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke} stroke={tone === 'light' ? 'rgb(255 255 255 / 0.18)' : 'rgb(15 26 20 / 0.08)'} />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={tone === 'light' ? '#ffffff' : '#1c6f45'}
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: v / 100 }}
          animate={reduce ? { pathLength: v / 100 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: EASE }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>}
    </div>
  );
}
