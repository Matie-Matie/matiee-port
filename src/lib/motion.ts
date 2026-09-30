import type { Transition, Variants } from 'framer-motion';

/** Signature Matie easing. */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_HEAVY = [0.32, 0.72, 0, 1] as const;

export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } satisfies Transition,
  snappy: { type: 'spring', stiffness: 420, damping: 34 } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 380, damping: 22 } satisfies Transition,
};

/** Card entrance — opacity + transform only (cheap on big surfaces). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Heavier entrance with a hint of blur — for small text/hero elements. */
export const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
};

export const stagger = (gap = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Deterministic hash → index, for stable per-name colours. */
export function hashIndex(str: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}
