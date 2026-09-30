import { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, FolderCheck } from 'lucide-react';
import gsap from 'gsap';
import { Button, LinkButton } from '../ui/Button';
import { Eyebrow } from '../ui/Badge';
import { R } from '../routes';
import { scrollToId } from './scroll';

const Hero3D = lazy(() => import('./Hero3D'));

/** Words are masked individually so GSAP can rise them into place. */
function Words({ children, className }: { children: string; className?: string }) {
  return (
    <>
      {children.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span className={`hw inline-block will-change-transform ${className ?? ''}`}>{w}&nbsp;</span>
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.from('.hw', { yPercent: 118, duration: 1.3, ease: 'expo.out', stagger: 0.075, delay: 0.1 });
        gsap.from('.hfade', { opacity: 0, y: 26, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.65 });
        gsap.from('.hchip', { opacity: 0, scale: 0.85, y: 20, duration: 1.1, ease: 'back.out(1.6)', stagger: 0.18, delay: 1.1 });
      },
      root,
    );
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:min-h-[100dvh] lg:pb-10">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 lg:left-[72%]" style={{ background: 'radial-gradient(closest-side, rgb(130 203 165 / 0.42), rgb(244 242 235 / 0) 72%)' }} />

      <div className="relative mx-auto grid grid-cols-1 max-w-[1240px] items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-2">
        <div className="relative z-10 max-w-[680px]">
          <div className="hfade">
            <Eyebrow>Local-first · No account needed</Eyebrow>
          </div>
          <h1 className="mt-6 text-balance text-[clamp(2.6rem,4.6vw,4.1rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-ink">
            <Words>Run your whole</Words>
            <br className="hidden sm:block" />
            <Words>freelance business</Words>
            <br className="hidden sm:block" />
            <Words>from one</Words>
            <span className="inline-block overflow-hidden pb-[0.16em] align-bottom">
              <span className="hw inline-block font-display text-[1.12em] font-normal italic tracking-[-0.03em] text-brand-600 will-change-transform">calm&nbsp;</span>
            </span>
            <Words>vault.</Words>
          </h1>
          <p className="hfade mt-7 max-w-[520px] text-[17px] leading-relaxed text-mute sm:text-lg">
            Clients, projects, payments, attendance, files and savings — together in one fast, private workspace that lives in your browser.
          </p>
          <div className="hfade mt-9 flex flex-wrap items-center gap-3">
            <LinkButton to={R.dashboard} size="lg" trailing>
              Open your vault
            </LinkButton>
            <Button size="lg" variant="secondary" onClick={() => scrollToId('how')}>
              See how it works
            </Button>
          </div>
          <ul className="hfade mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-mute">
            {['No sign-up', 'Data stays on your device', 'One-click backup'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600/10 text-brand-700"><Check size={10} strokeWidth={3} /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-[380px] sm:h-[500px] lg:h-[min(70dvh,660px)]">
          <Suspense fallback={null}>
            <Hero3D className="absolute inset-0" />
          </Suspense>

          <motion.div aria-hidden animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="hchip absolute left-0 top-[16%] hidden sm:block lg:-left-2">
            <div className="flex items-center gap-2.5 rounded-full bg-paper/85 py-2 pl-2 pr-4 text-[12.5px] font-medium text-ink shadow-pop ring-1 ring-ink/[0.06] backdrop-blur-xl">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white"><Check size={14} strokeWidth={2.5} /></span>
              Downpayment received
            </div>
          </motion.div>
          <motion.div aria-hidden animate={{ y: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="hchip absolute bottom-[14%] right-0 hidden sm:block lg:right-2">
            <div className="flex items-center gap-2.5 rounded-full bg-paper/85 py-2 pl-2 pr-4 text-[12.5px] font-medium text-ink shadow-pop ring-1 ring-ink/[0.06] backdrop-blur-xl">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warn-100 text-warn-700"><FolderCheck size={14} strokeWidth={1.75} /></span>
              Project due in 2 days
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
