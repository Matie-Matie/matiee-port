import { motion } from 'framer-motion';
import { cn } from '../lib/cn';
import { spring } from '../lib/motion';

export function Toggle({
  checked,
  onChange,
  label,
  className,
  onDark = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ease-matie',
        checked ? 'bg-brand-500' : onDark ? 'bg-white/25' : 'bg-ink/15',
        className,
      )}
    >
      <motion.span
        layout
        transition={spring.snappy}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)]"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}
