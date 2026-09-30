import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Grip } from 'lucide-react';
import { EASE, spring } from '../lib/motion';
import { cn } from '../lib/cn';
import { SidebarContent } from './Sidebar';
import { NAV_ITEMS, isActivePath } from './nav';

const TABS = ['dashboard', 'projects', 'money', 'attendance'];

/** Floating bottom tab bar (below lg). */
export function MobileNav({ onMore }: { onMore: () => void }) {
  const { pathname } = useLocation();
  const tabs = TABS.map((k) => NAV_ITEMS.find((n) => n.key === k)!);
  const moreActive = !tabs.some((t) => isActivePath(t.path, pathname));

  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-3 z-30 flex justify-center px-4 lg:hidden">
      <div className="flex w-full max-w-[420px] items-center justify-between rounded-full bg-paper/85 p-1.5 shadow-pop ring-1 ring-ink/[0.07] backdrop-blur-xl">
        {tabs.map((t) => {
          const active = isActivePath(t.path, pathname);
          const Icon = t.icon;
          return (
            <Link key={t.key} to={t.path} aria-current={active ? 'page' : undefined} className="relative flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full">
              {active && <motion.span layoutId="mobile-pill" transition={spring.snappy} className="absolute inset-0 rounded-full bg-brand-50 ring-1 ring-brand-600/10" />}
              <Icon size={18} strokeWidth={1.6} className={cn('relative', active ? 'text-brand-600' : 'text-mute')} />
              <span className={cn('relative text-[10px] font-medium', active ? 'text-brand-800' : 'text-mute')}>{t.short}</span>
            </Link>
          );
        })}
        <button type="button" onClick={onMore} className="relative flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full" aria-label="More pages">
          <Grip size={18} strokeWidth={1.6} className={moreActive ? 'text-brand-600' : 'text-mute'} />
          <span className={cn('text-[10px] font-medium', moreActive ? 'text-brand-800' : 'text-mute')}>More</span>
        </button>
      </div>
    </nav>
  );
}

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[6px]" onClick={onClose} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: '-104%' }}
            animate={{ x: 0 }}
            exit={{ x: '-104%' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute bottom-3 left-3 top-3 w-[min(86vw,300px)] rounded-[28px] bg-canvas p-1.5 shadow-pop"
          >
            <div className="h-full rounded-[22px] bg-paper p-4 shadow-soft ring-1 ring-ink/[0.06]">
              <SidebarContent onNavigate={onClose} />
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
