import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type BadgeTone = 'neutral' | 'brand' | 'warn' | 'danger' | 'ink' | 'sand';

const TONES: Record<BadgeTone, { wrap: string; dot: string }> = {
  neutral: { wrap: 'bg-ink/[0.05] text-ink-2', dot: 'bg-faint' },
  brand: { wrap: 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/10', dot: 'bg-brand-500' },
  warn: { wrap: 'bg-warn-100 text-warn-700', dot: 'bg-warn-500' },
  danger: { wrap: 'bg-danger-100 text-danger-700', dot: 'bg-danger-500' },
  ink: { wrap: 'bg-ink text-white', dot: 'bg-brand-300' },
  sand: { wrap: 'bg-sand-100 text-ink-2', dot: 'bg-sand-300' },
};

export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-none',
        TONES[tone].wrap,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', TONES[tone].dot)} />}
      {children}
    </span>
  );
}

/** Microscopic uppercase eyebrow tag. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-brand-600/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700',
        className,
      )}
    >
      {children}
    </span>
  );
}
