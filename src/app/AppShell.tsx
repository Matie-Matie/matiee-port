import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE } from '../lib/motion';
import { Toaster } from '../ui/Toaster';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileDrawer, MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

export default function AppShell() {
  const [palette, setPalette] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((o) => !o);
      } else if (e.key === '/' && !isTyping(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setPalette(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closePalette = useCallback(() => setPalette(false), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="lg:pl-[280px]">
        <div className="mx-auto w-full max-w-[1240px] px-4 md:px-8">
          <TopBar onSearch={() => setPalette(true)} onMenu={() => setDrawer(true)} />
          <main id="main" className="pb-32 pt-7 lg:pb-20">
            <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
      <MobileNav onMore={() => setDrawer(true)} />
      <MobileDrawer open={drawer} onClose={closeDrawer} />
      <CommandPalette open={palette} onClose={closePalette} />
      <Toaster />
    </div>
  );
}
