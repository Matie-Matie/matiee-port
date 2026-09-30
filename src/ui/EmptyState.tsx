import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn('flex flex-col items-center justify-center text-center', compact ? 'py-8' : 'py-16', className)}
    >
      <div className="mb-4 rounded-[20px] bg-ink/[0.04] p-1.5 ring-1 ring-ink/[0.05]">
        <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-paper text-brand-600 shadow-soft">
          <Icon size={22} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm leading-relaxed text-mute">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
