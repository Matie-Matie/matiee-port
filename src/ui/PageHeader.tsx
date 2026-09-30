import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../lib/motion';
import { Eyebrow } from './Badge';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h1 className="text-[32px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[40px]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-mute">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}
