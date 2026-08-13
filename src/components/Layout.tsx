import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/clients', label: 'Clients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
  { path: '/projects', label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
];

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="grain-overlay min-h-screen">
      {/* ── Desktop Nav ── */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className={`
          fixed top-6 left-1/2 -translate-x-1/2 z-40 hidden md:block
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${scrolled
            ? 'bg-white/75 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-soil-200/50'
            : 'bg-white/40 backdrop-blur-lg'}
          rounded-full px-3 py-2
        `}
      >
        <div className="flex items-center gap-1">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 px-3 mr-2">
            <span className="w-6 h-6 rounded-full bg-soil-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">M</span>
            </span>
            <span className="text-sm font-semibold text-soil-900">Matiee Port</span>
          </Link>

          {/* Nav Links */}
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${active
                    ? 'bg-soil-900 text-white'
                    : 'text-soil-600 hover:text-soil-900 hover:bg-warm-100'}
                `}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* ── Mobile Hamburger ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-6 right-6 z-50 md:hidden w-12 h-12 rounded-full bg-white/70 backdrop-blur-2xl shadow-lg shadow-black/5 ring-1 ring-soil-200/50 flex flex-col items-center justify-center gap-1"
        aria-label="Toggle menu"
      >
        <motion.span
          className="block w-5 h-[2px] bg-soil-700 rounded-full"
          animate={mobileOpen ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
        />
        <motion.span
          className="block w-5 h-[2px] bg-soil-700 rounded-full"
          animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
        />
        <motion.span
          className="block w-5 h-[2px] bg-soil-700 rounded-full"
          animate={mobileOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
        />
      </motion.button>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/80 backdrop-blur-2xl md:hidden flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              {NAV_ITEMS.map((item, i) => {
                const active = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={item.path}
                      className={`
                        text-3xl font-medium tracking-tight transition-colors duration-300
                        ${active ? 'text-soil-900' : 'text-soil-400 hover:text-soil-900'}
                      `}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Content ── */}
      <main className="pt-28 md:pt-36 pb-20 px-6 max-w-6xl mx-auto">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 pb-8 text-center">
        <p className="text-[11px] text-soil-400 font-medium tracking-wide">
          Matiee Port — built solo with ☕ for the freelance grind
        </p>
      </footer>
    </div>
  );
}
