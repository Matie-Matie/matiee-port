import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleAlert, Info } from 'lucide-react';
import { dismissToast, getToasts, subscribeToasts } from './toast';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';

export function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-8" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.button
            key={t.id}
            layout
            type="button"
            onClick={() => dismissToast(t.id)}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink py-2 pl-2 pr-4 text-[13px] font-medium text-white shadow-pop"
          >
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', t.tone === 'success' ? 'bg-brand-500' : t.tone === 'danger' ? 'bg-danger-500' : 'bg-white/15')}>
              {t.tone === 'success' ? <Check size={13} strokeWidth={2.25} /> : t.tone === 'danger' ? <CircleAlert size={13} strokeWidth={2} /> : <Info size={13} strokeWidth={2} />}
            </span>
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
