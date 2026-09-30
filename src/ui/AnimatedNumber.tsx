import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { EASE } from '../lib/motion';

const defaultFormat = (n: number) => Math.round(n).toLocaleString('en-US');

/** Counts up to `value` the first time it scrolls into view, then tweens on change. */
export function AnimatedNumber({
  value,
  format = defaultFormat,
  duration = 1.2,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, format);

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [value, inView, reduce, duration, mv]);

  return (
    <motion.span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {text}
    </motion.span>
  );
}
