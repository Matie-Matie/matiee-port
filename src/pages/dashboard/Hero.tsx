import { useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Money } from '../../ui/Money';
import { R } from '../../routes';
import { EASE } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface HeroProps {
  revenue: number;
  outstanding: number;
  downpayments: number;
  savings: number;
  portfolio: number;
}

export function Hero({ revenue, outstanding, downpayments, savings, portfolio }: HeroProps) {
  const glow = useRef<HTMLDivElement>(null);
  const billed = revenue + outstanding;
  const share = billed > 0 ? Math.round((revenue / billed) * 100) : 0;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = glow.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${e.clientX - r.left}px`);
    el.style.setProperty('--gy', `${e.clientY - r.top}px`);
  }

  const stats = [
    { label: 'Outstanding', value: outstanding },
    { label: 'Downpayments', value: downpayments },
    { label: 'Outside savings', value: savings },
    { label: 'Total portfolio', value: portfolio },
  ];

  return (
    <Card bezel tone="brand" pad="none" onPointerMove={onMove}>
      <div ref={glow} className="relative h-full p-6 md:p-8">
        {/* pointer glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: 'radial-gradient(520px circle at var(--gx, 78%) var(--gy, 8%), rgb(130 203 165 / 0.22), transparent 60%)' }}
        />
        {/* concentric vault rings */}
        <svg aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] text-white opacity-[0.09]" viewBox="0 0 400 400" fill="none">
          {[60, 100, 140, 180, 220].map((r, i) => (
            <motion.circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray={i % 2 ? '2 8' : undefined}
              animate={{ rotate: i % 2 ? 360 : -360 }}
              transition={{ duration: 90 + i * 30, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '200px', originY: '200px' }}
            />
          ))}
        </svg>

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-white/70">Revenue collected</span>
            <Link
              to={R.money}
              className="group flex items-center gap-1.5 rounded-full bg-white/10 py-1 pl-3 pr-1 text-xs font-medium text-white ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/15"
            >
              Money Hub
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-matie group-hover:-translate-y-px group-hover:translate-x-0.5">
                <ArrowUpRight size={13} strokeWidth={1.75} />
              </span>
            </Link>
          </div>

          <p className="mt-4 text-[clamp(2.6rem,5.4vw,4.25rem)] font-semibold leading-none tracking-[-0.05em]">
            <Money value={revenue} animate />
          </p>

          <div className="mt-6">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/15" role="img" aria-label={`${share}% of billed amount collected`}>
              <motion.div
                className="h-full origin-left rounded-full bg-brand-300"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.25 }}
                style={{ width: `${share}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white/65">
              <span>{billed > 0 ? `${share}% of billed work collected` : 'Nothing billed yet'}</span>
              <span className="tabular-nums">
                <Money value={billed} /> billed
              </span>
            </div>
          </div>

          <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-5 pt-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={cn('min-w-0', i > 0 && 'md:border-l md:border-white/10 md:pl-4')}>
                <dt className="truncate text-[11.5px] text-white/60">{s.label}</dt>
                <dd className="mt-1 truncate text-lg font-semibold tracking-tight md:text-xl">
                  <Money value={s.value} compact={s.value >= 100000} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Card>
  );
}
