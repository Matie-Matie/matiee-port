import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Pill options as a radio group (single-select). */
export function Chips<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T | '';
  onChange: (v: T) => void;
  options: readonly { value: T; label: ReactNode }[];
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-[background-color,color,box-shadow,transform] duration-300 ease-matie active:scale-95',
              on ? 'bg-brand-600 text-white shadow-brand' : 'bg-ink/[0.05] text-ink-2 hover:bg-ink/[0.09]',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
