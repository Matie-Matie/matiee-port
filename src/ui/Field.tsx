import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

export const inputBase =
  'w-full rounded-2xl bg-paper-2 px-4 text-sm text-ink placeholder:text-faint ring-1 ring-ink/10 ' +
  'transition-[box-shadow,background-color] duration-300 ease-matie hover:ring-ink/20 ' +
  'focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70 disabled:opacity-50';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: (id: string) => ReactNode;
}

/** Label + control + hint. Uses render-prop so the label stays associated. */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-medium text-ink-2">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs text-danger-700">{error}</p>
      ) : hint ? (
        <p className="text-xs text-mute">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentPropsWithRef<'input'>) {
  return <input className={cn(inputBase, 'h-11', className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentPropsWithRef<'textarea'>) {
  return <textarea className={cn(inputBase, 'min-h-[92px] resize-y py-3 leading-relaxed', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentPropsWithRef<'select'>) {
  return (
    <div className="relative">
      <select className={cn(inputBase, 'h-11 cursor-pointer appearance-none pr-10', className)} {...rest}>
        {children}
      </select>
      <ChevronDown size={16} strokeWidth={1.75} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mute" />
    </div>
  );
}

/** ₱-prefixed numeric input. */
export function MoneyInput({ className, ...rest }: ComponentPropsWithRef<'input'>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-mute">₱</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        className={cn(inputBase, 'h-11 pl-8 tabular-nums', className)}
        {...rest}
      />
    </div>
  );
}
