import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, FolderKanban, LayoutDashboard, LineChart, PiggyBank, Plus, Users, Wallet } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Bar } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { BrandMark } from '../app/Brand';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';
import { peso } from '../lib/format';

/** Double-bezel browser frame. Everything inside is illustrative sample data. */
export function MockWindow({ url = 'matie port / dashboard', children, className }: { url?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[34px] bg-ink/[0.045] p-2 ring-1 ring-ink/[0.07] shadow-[0_60px_120px_-50px_rgb(15_26_20/0.45)]', className)}>
      <div className="overflow-hidden rounded-[28px] bg-canvas ring-1 ring-ink/[0.08]">
        <div className="flex items-center gap-3 border-b border-ink/[0.07] bg-paper px-4 py-3">
          <span className="flex gap-1.5" aria-hidden>
            <i className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <i className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <i className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          </span>
          <span className="mx-auto max-w-[260px] flex-1 truncate rounded-full bg-ink/[0.05] px-4 py-1 text-center text-[11px] text-mute">{url}</span>
          <span className="w-10" aria-hidden />
        </div>
        {children}
      </div>
    </div>
  );
}

const RAIL = [LayoutDashboard, Users, FolderKanban, Wallet, PiggyBank, LineChart];
const BARS = [
  [62, 18],
  [88, 14],
  [48, 16],
  [76, 12],
  [40, 11],
  [58, 9],
];

export function MockDashboard() {
  return (
    <div className="flex select-none" aria-hidden>
      <div className="hidden w-[60px] shrink-0 flex-col items-center gap-2 border-r border-ink/[0.06] bg-paper py-4 sm:flex">
        <BrandMark size={30} />
        <span className="my-1 h-px w-6 bg-ink/10" />
        {RAIL.map((Icon, i) => (
          <span key={i} className={cn('flex h-9 w-9 items-center justify-center rounded-xl', i === 0 ? 'bg-brand-50 text-brand-600' : 'text-faint')}>
            <Icon size={16} strokeWidth={1.6} />
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-700">Sample workspace</p>
            <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.04em] text-ink md:text-[28px]">
              Good evening, <span className="font-display italic text-brand-600">there</span>
            </p>
          </div>
          <span className="hidden rounded-full bg-brand-600 px-4 py-2 text-[11px] font-medium text-white shadow-brand sm:block">Quick add +</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr]">
          <div className="relative overflow-hidden rounded-[20px] bg-brand-700 p-5 text-white ring-1 ring-brand-900/40">
            <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 rounded-full border border-white/10" />
            <p className="text-[11px] text-white/70">Revenue collected</p>
            <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.05em] md:text-[42px]">
              <AnimatedNumber value={113500} format={peso} duration={1.8} />
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 0.29 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.3 }} className="h-full origin-left rounded-full bg-brand-300" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[10px] text-white/60">
              {[['Outstanding', '₱282K'], ['Downpayments', '₱104K'], ['Savings', '₱56.7K']].map(([l, v]) => (
                <div key={l}>
                  <p>{l}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-white">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] bg-paper p-4 shadow-soft ring-1 ring-ink/[0.06]">
            <p className="text-[12px] font-semibold text-ink">Cash flow</p>
            <div className="mt-3 flex h-[92px] items-end gap-2">
              {BARS.map(([a, b], i) => (
                <div key={i} className="flex flex-1 items-end justify-center gap-0.5">
                  <motion.i initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.06 }} className="w-2 origin-bottom rounded-t bg-brand-600" style={{ height: `${a}%` }} />
                  <motion.i initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.26 + i * 0.06 }} className="w-2 origin-bottom rounded-t bg-clay-500/70" style={{ height: `${b * 2}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-mute">
              {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ['Loan Management Platform', 55, '2 days', 'warn'],
            ['Sale & Inventory System', 30, '6 days', 'neutral'],
            ['Attendance Tracker', 12, '3 weeks', 'neutral'],
          ].map(([name, pct, due, tone]) => (
            <div key={name as string} className="rounded-[18px] bg-paper p-3.5 shadow-soft ring-1 ring-ink/[0.06]">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[11.5px] font-medium text-ink">{name}</p>
                <Badge tone={tone as 'warn' | 'neutral'}>{due}</Badge>
              </div>
              <div className="mt-3">
                <Bar value={pct as number} height={5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── "How it works" stage panels ─────────────────────────────── */

export function MockClientForm() {
  return (
    <div className="p-6 md:p-8" aria-hidden>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Step 1</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">New client</p>
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">DC</span>
          <span className="text-xs text-mute">Photo optional — resized to stay light</span>
        </div>
        <Field label="Client name" value="Dela Cruz Pharmacy" caret />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact" value="facebook.com/delacruz" />
          <Field label="Email" value="admin@delacruz.ph" />
        </div>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-medium text-white shadow-brand">
        <Plus size={14} strokeWidth={2} /> Add client
      </span>
    </div>
  );
}

function Field({ label, value, caret }: { label: string; value: string; caret?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-ink-2">{label}</p>
      <div className={cn('rounded-2xl bg-paper-2 px-4 py-2.5 text-[13px] text-ink ring-1', caret ? 'ring-2 ring-brand-500/70' : 'ring-ink/10')}>
        {value}
        {caret && <i className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-brand-600" />}
      </div>
    </div>
  );
}

export function MockProject() {
  return (
    <div className="p-6 md:p-8" aria-hidden>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Step 2</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold tracking-[-0.03em] text-ink">Prescription Processing System</p>
          <p className="mt-0.5 text-xs text-mute">Dela Cruz Pharmacy</p>
        </div>
        <Badge tone="brand" dot>In progress</Badge>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs"><span className="text-mute">Progress</span><span className="font-semibold text-ink">70%</span></div>
        <Bar value={70} height={8} />
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink/[0.07] pt-5">
        {[['Fee', '₱85,000'], ['Paid', '₱45,000'], ['Remaining', '₱40,000']].map(([k, v], i) => (
          <div key={k}><dt className="text-[11px] text-mute">{k}</dt><dd className={cn('mt-0.5 text-[15px] font-semibold tracking-tight', i === 1 ? 'text-brand-700' : i === 2 ? 'text-warn-700' : 'text-ink')}>{v}</dd></div>
        ))}
      </dl>
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50/70 px-3.5 py-2.5 ring-1 ring-brand-600/15">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white"><Check size={13} strokeWidth={2.5} /></span>
        <span className="flex-1 text-[13px] font-medium text-ink">Downpayment <span className="font-normal text-mute">· ₱25,000</span></span>
        <Badge tone="brand">Received</Badge>
      </div>
    </div>
  );
}

export function MockNumbers() {
  return (
    <div className="p-6 md:p-8" aria-hidden>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Step 3</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">Your real numbers</p>
      <div className="mt-5 rounded-[20px] bg-brand-700 p-5 text-white ring-1 ring-brand-900/40">
        <p className="text-[11px] text-white/70">Revenue collected</p>
        <p className="mt-1.5 text-4xl font-semibold leading-none tracking-[-0.05em]">₱113,500</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[29%] rounded-full bg-brand-300" /></div>
        <p className="mt-2 text-[11px] text-white/65">29% of billed work collected</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-paper-2 p-3.5 ring-1 ring-ink/[0.06]"><p className="text-[11px] text-mute">Expected salary</p><p className="mt-1 text-lg font-semibold tracking-tight text-ink">₱9,500</p></div>
        <div className="rounded-2xl bg-paper-2 p-3.5 ring-1 ring-ink/[0.06]"><p className="text-[11px] text-mute">Net profit</p><p className="mt-1 text-lg font-semibold tracking-tight text-brand-700">₱113,250</p></div>
      </div>
    </div>
  );
}
