import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';

/**
 * Anchored menu. Render inside a `relative` wrapper that also contains the trigger.
 * Closes on outside pointer-down and Escape.
 */
export function Popover({
  open,
  onClose,
  align = 'right',
  className,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
  className?: string;
  children: ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      const el = ref.current;
      if (el && !el.contains(e.target as Node) && !el.parentElement?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label={label}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.28, ease: EASE }}
          style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
          className={cn(
            'absolute top-full z-[60] mt-2 overflow-hidden rounded-[20px] bg-paper shadow-pop ring-1 ring-ink/[0.06]',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
