import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Eyebrow } from '../ui/Badge';
import { Reveal } from '../ui/Reveal';
import { MockDashboard, MockWindow } from './mocks';

const TICKER = ['Clients', 'Projects', 'Payments', 'Attendance', 'Salary', 'Files & contracts', 'Knowledge', 'Savings goals', 'Cash flow', 'Insights'];

export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-ink/[0.07] bg-paper/50 py-5" aria-hidden>
      <div className="flex w-max gap-10 whitespace-nowrap" style={{ animation: 'marquee 46s linear infinite' }}>
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-[28px] text-ink/70">
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent" />
    </div>
  );
}

export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.9, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 70, 0]);

  return (
    <section id="showcase" className="px-4 py-24 sm:px-8 md:py-36">
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto mb-14 max-w-[720px] text-center">
          <Reveal><Eyebrow>The dashboard</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 text-balance text-[clamp(2.2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">
              The whole business, <span className="font-display italic text-brand-600">at a glance.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-mute">
              Revenue collected, what's still outstanding, deadlines, cash flow and savings — one screen, every morning.
            </p>
          </Reveal>
        </div>

        <div ref={ref} style={{ perspective: 1800 }}>
          <motion.div style={{ rotateX, scale, y, transformOrigin: '50% 0%' }}>
            <MockWindow>
              <MockDashboard />
            </MockWindow>
          </motion.div>
        </div>
        <p className="mt-6 text-center text-xs text-mute">Illustration with sample data.</p>
      </div>
    </section>
  );
}
