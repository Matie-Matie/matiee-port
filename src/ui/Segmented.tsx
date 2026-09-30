import { useId, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';
import { spring } from '../lib/motion';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

/** Pill segmented control with a sliding indicator (shared-layout animation). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}) {
  const id = useId();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-ink/[0.05] p-1 hide-scrollbar', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative shrink-0 rounded-full font-medium transition-colors duration-300',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-[13px]',
              active ? 'text-ink' : 'text-mute hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring.snappy}
                className="absolute inset-0 rounded-full bg-paper shadow-[0_1px_2px_rgb(15_26_20/0.08),0_0_0_1px_rgb(15_26_20/0.05)]"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.label}
              {typeof o.count === 'number' && (
                <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', active ? 'bg-brand-600/10 text-brand-700' : 'bg-ink/[0.06] text-mute')}>
                  {o.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
