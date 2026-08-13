import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-50">
      {/* ── Mobile Menu Toggle ── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-navy-900/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-[260px] h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div onClick={() => setMobileOpen(false)}>
                <Sidebar />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ── */}
      <div className="flex gap-4 md:gap-6 max-w-[1440px] mx-auto md:py-6 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block sticky top-6 self-start max-h-[calc(100vh-48px)]">
          <Sidebar />
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 min-w-0 md:pr-6 pr-3 pt-3 md:pt-0">
          <TopNavbar />

          <main className="bg-white rounded-[24px] md:rounded-[32px] shadow-card p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
