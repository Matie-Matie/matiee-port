import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandMark } from '../app/Brand';
import { LinkButton } from '../ui/Button';
import { APP_NAME } from '../config';
import { R } from '../routes';
import { EASE } from '../lib/motion';
import { scrollToId } from './scroll';

const LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how', label: 'How it works' },
  { id: 'privacy', label: 'Privacy' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollToId(id), open ? 350 : 0);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4 sm:top-5">
        <nav
          aria-label="Main"
          className={`flex w-full max-w-[720px] items-center gap-1 rounded-full p-1.5 pl-2.5 ring-1 backdrop-blur-xl transition-[background-color,box-shadow] duration-500 ease-matie ${scrolled ? 'bg-paper/85 shadow-pop ring-ink/[0.08]' : 'bg-paper/60 shadow-soft ring-ink/[0.06]'}`}
        >
          <Link to={R.welcome} className="flex items-center gap-2.5 rounded-full pr-3" aria-label={`${APP_NAME} home`}>
            <BrandMark size={34} />
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-ink">{APP_NAME}</span>
          </Link>
          <ul className="ml-auto hidden items-center md:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => go(l.id)} className="rounded-full px-4 py-2 text-[13px] font-medium text-mute transition-colors duration-300 hover:bg-ink/[0.05] hover:text-ink">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="ml-auto md:ml-2">
            <LinkButton to={R.dashboard} size="sm" trailing className="!h-10">
              Open vault
            </LinkButton>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="relative ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/[0.05] md:hidden"
          >
            <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 0 : -3.5 }} transition={{ duration: 0.4, ease: EASE }} className="absolute h-[1.5px] w-[18px] rounded bg-ink" />
            <motion.span animate={{ rotate: open ? -45 : 0, y: open ? 0 : 3.5 }} transition={{ duration: 0.4, ease: EASE }} className="absolute h-[1.5px] w-[18px] rounded bg-ink" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-center bg-canvas/90 px-8 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ul className="space-y-2">
              {LINKS.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <motion.button
                    type="button"
                    onClick={() => go(l.id)}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.08 + i * 0.07 }}
                    className="block py-1 font-display text-[clamp(2.6rem,12vw,3.6rem)] leading-tight text-ink"
                  >
                    {l.label}
                  </motion.button>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.4 }} className="mt-10">
              <LinkButton to={R.dashboard} size="lg" trailing>
                Open your vault
              </LinkButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
