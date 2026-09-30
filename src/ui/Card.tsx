import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';

type Tone = 'paper' | 'brand' | 'ink' | 'sand' | 'quiet';
type Pad = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  /** Double-bezel: an outer machined tray around the inner core. */
  bezel?: boolean;
  /** Cursor-following green glow on hover. */
  spotlight?: boolean;
  tone?: Tone;
  pad?: Pad;
  /** Extra classes for the inner core when `bezel` is on. */
  coreClassName?: string;
}

const TONES: Record<Tone, string> = {
  paper: 'bg-paper text-ink shadow-soft ring-1 ring-ink/[0.06]',
  quiet: 'bg-paper-2 text-ink ring-1 ring-ink/[0.06]',
  sand: 'bg-sand-100 text-ink ring-1 ring-ink/[0.06]',
  brand:
    'bg-brand-700 text-white ring-1 ring-brand-900/40 shadow-[0_1px_0_rgb(255_255_255/0.14)_inset,0_24px_48px_-20px_rgb(10_54_32/0.65)]',
  ink: 'bg-ink text-white ring-1 ring-white/5 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_24px_48px_-20px_rgb(15_26_20/0.6)]',
};

const PADS: Record<Pad, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
};

export function Card({
  bezel = false,
  spotlight = false,
  tone = 'paper',
  pad = 'md',
  className,
  coreClassName,
  children,
  ...rest
}: CardProps) {
  const coreRef = useRef<HTMLDivElement>(null);

  const onMove = spotlight
    ? (e: PointerEvent<HTMLDivElement>) => {
        const el = coreRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    : undefined;

  if (bezel) {
    return (
      <div
        className={cn('rounded-[28px] bg-ink/[0.035] p-1.5 ring-1 ring-ink/[0.06]', className)}
        onPointerMove={onMove}
        {...rest}
      >
        <div
          ref={coreRef}
          className={cn(
            'relative h-full overflow-hidden rounded-[22px]',
            TONES[tone],
            PADS[pad],
            spotlight && tone === 'paper' && 'spotlight',
            coreClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={coreRef}
      onPointerMove={onMove}
      className={cn(
        'relative overflow-hidden rounded-[22px]',
        TONES[tone],
        PADS[pad],
        spotlight && tone === 'paper' && 'spotlight',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Small section title used inside cards. */
export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold tracking-tight text-inherit">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-mute">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
