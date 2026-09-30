import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, FileText, FolderKanban, LineChart, PiggyBank, ShieldCheck, StickyNote, CalendarCheck, FolderLock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Eyebrow, Badge } from '../ui/Badge';
import { Bar } from '../ui/Progress';
import { Toggle } from '../ui/Toggle';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Reveal } from '../ui/Reveal';
import { EASE, fadeUp, stagger } from '../lib/motion';
import { cn } from '../lib/cn';
import { peso, maskAmount } from '../lib/format';

function FCard({ className, icon: Icon, title, body, hint, children }: { className?: string; icon: typeof FolderKanban; title: string; body: string; hint?: string; children: ReactNode }) {
  return (
    <motion.div variants={fadeUp} className={cn('min-w-0 [&>*]:h-full', className)}>
      <Card bezel spotlight pad="lg" coreClassName="flex flex-col">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={17} strokeWidth={1.6} /></span>
          {hint && <span className="rounded-full bg-ink/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">{hint}</span>}
        </div>
        <h3 className="mt-5 text-[22px] font-semibold leading-tight tracking-[-0.035em] text-ink">{title}</h3>
        <p className="mt-2 max-w-[440px] text-[14.5px] leading-relaxed text-mute">{body}</p>
        <div className="mt-6 flex-1">{children}</div>
      </Card>
    </motion.div>
  );
}

/* ── demos ─────────────────────────────────────────────────── */

function ProjectsDemo() {
  const [p, setP] = useState([80, 55, 30]);
  const rows = [['Prescription Processing', 'Dela Cruz Pharmacy'], ['Loan Platform', 'Reyes Lending'], ['Sale & Inventory', 'Santos General']];
  return (
    <div>
      <ul className="space-y-2">
        {rows.map(([name, client], i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setP((a) => a.map((v, j) => (j === i ? (v >= 100 ? 0 : Math.min(100, v + 10)) : v)))}
              className="flex w-full items-center gap-4 rounded-2xl bg-paper-2 p-3.5 text-left ring-1 ring-ink/[0.06] transition-[background-color,transform,box-shadow] duration-300 ease-matie hover:-translate-y-0.5 hover:bg-paper hover:shadow-soft active:scale-[0.99]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-ink">{name}</span>
                <span className="block truncate text-[11.5px] text-mute">{client}</span>
                <span className="mt-2.5 block"><Bar value={p[i]} height={6} label={`${name} progress`} /></span>
              </span>
              <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">{p[i]}%</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-mute">Try it — tap a project to move it forward.</p>
    </div>
  );
}

const MON = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
function AttendanceDemo() {
  const [on, setOn] = useState<boolean[]>(() => Array.from({ length: 14 }, (_, i) => i % 7 < 5 && i !== 3));
  const days = on.filter(Boolean).length;
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {MON.map((d, i) => <span key={i} className="pb-1 text-center text-[10px] font-semibold text-mute">{d}</span>)}
        {on.map((v, i) => {
          const weekend = i % 7 >= 5;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={v}
              aria-label={`Day ${i + 1}: ${v ? 'worked' : 'not worked'}`}
              onClick={() => setOn((a) => a.map((x, j) => (j === i ? !x : x)))}
              className={cn(
                'aspect-square rounded-xl text-[11px] font-medium transition-[transform,background-color,color] duration-300 ease-matie active:scale-90',
                v ? 'bg-brand-600 text-white shadow-[0_6px_14px_-6px_rgb(28_111_69/0.7)]' : weekend ? 'bg-ink/[0.06] text-mute' : 'bg-paper-2 text-ink ring-1 ring-inset ring-ink/[0.06] hover:bg-brand-50',
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-end justify-between rounded-2xl bg-brand-700 px-4 py-3 text-white">
        <span className="text-xs text-white/70">Expected salary<br /><span className="text-[10px] text-white/50">{days} days × ₱500</span></span>
        <span className="text-2xl font-semibold tracking-[-0.04em]"><AnimatedNumber value={days * 500} format={peso} duration={0.6} /></span>
      </div>
    </div>
  );
}

const CF: [string, number, number][] = [['May', 62, 18], ['Jun', 88, 14], ['Jul', 48, 16], ['Aug', 76, 12], ['Sep', 40, 11], ['Oct', 58, 9]];
function MoneyDemo() {
  const [h, setH] = useState(5);
  const [m, inc, exp] = CF[h];
  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div><p className="text-xs text-mute">{m} net</p><p className="text-[26px] font-semibold leading-none tracking-[-0.04em] text-ink">{peso((inc - exp) * 350)}</p></div>
        <div className="flex gap-4 text-[11px] text-mute"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand-600" />Income</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-clay-500/80" />Expenses</span></div>
      </div>
      <div className="grid h-[132px] grid-cols-6 gap-2" onMouseLeave={() => setH(5)}>
        {CF.map(([label, a, b], i) => (
          <button key={label} type="button" onMouseEnter={() => setH(i)} onFocus={() => setH(i)} aria-label={`${label} income and expenses`} className="flex flex-col rounded-2xl outline-offset-2">
            <span className={cn('relative flex-1 rounded-2xl transition-colors duration-300', h === i && 'bg-brand-50')}>
              <span className="absolute inset-x-1.5 bottom-0 top-2 flex items-end justify-center gap-1">
                <motion.i initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 }} className="w-2.5 origin-bottom rounded-t bg-brand-600" style={{ height: `${a}%` }} />
                <motion.i initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 + 0.06 }} className="w-2.5 origin-bottom rounded-t bg-clay-500/70" style={{ height: `${b * 2}%` }} />
              </span>
            </span>
            <span className={cn('mt-1.5 text-center text-[10.5px] font-medium', h === i ? 'text-brand-700' : 'text-mute')}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PrivacyDemo() {
  const [hide, setHide] = useState(false);
  const Row = ({ label, value, masked }: { label: string; value: string; masked: string }) => (
    <div className="flex items-center justify-between rounded-2xl bg-paper-2 px-4 py-3 ring-1 ring-ink/[0.06]">
      <span className="text-[13px] text-mute">{label}</span>
      <motion.span key={String(hide)} initial={{ filter: 'blur(7px)', opacity: 0.4 }} animate={{ filter: 'blur(0px)', opacity: 1 }} transition={{ duration: 0.5, ease: EASE }} className="text-[15px] font-semibold tabular-nums tracking-tight text-ink">
        {hide ? masked : value}
      </motion.span>
    </div>
  );
  return (
    <div>
      <div className="space-y-2">
        <Row label="Revenue collected" value="₱113,500" masked={maskAmount('₱113,500')} />
        <Row label="Client" value="Dela Cruz Pharmacy" masked="D••••••" />
        <Row label="Outstanding" value="₱282,000" masked={maskAmount('₱282,000')} />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-white">
        <span className="flex items-center gap-2 text-[13px] font-medium">{hide ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />} Privacy mode</span>
        <Toggle label="Privacy mode" checked={hide} onChange={setHide} onDark />
      </div>
      <p className="mt-3 text-xs text-mute">Working in a café? Hide every amount and name in one tap.</p>
    </div>
  );
}

function SavingsDemo() {
  const price = 62990;
  const [saved, setSaved] = useState(38000);
  const pct = Math.min(100, (saved / price) * 100);
  const can = saved >= price;
  return (
    <div>
      <div className="flex items-center justify-between text-[13px]"><span className="font-medium text-ink">MacBook Air</span><span className="font-semibold tabular-nums text-ink">{peso(price)}</span></div>
      <div className="mt-3"><Bar value={pct} height={8} tone={can ? 'brand' : 'warn'} label="Saved towards MacBook Air" /></div>
      <p className={cn('mt-2 text-xs', can ? 'font-medium text-brand-700' : 'text-mute')}>{can ? 'You can buy this now' : `${peso(price - saved)} to go`}</p>
      <label htmlFor="sv" className="mt-5 block text-xs font-medium text-ink-2">Saved so far: <span className="tabular-nums">{peso(saved)}</span></label>
      <input id="sv" type="range" min={0} max={80000} step={1000} value={saved} onChange={(e) => setSaved(Number(e.target.value))} className="range mt-2" style={{ ['--v' as string]: `${(saved / 80000) * 100}%` }} />
    </div>
  );
}

function FilesDemo() {
  const files = [
    { n: 'Contract.pdf', t: 'Contract', tone: 'brand' as const, r: -7, x: -6 },
    { n: 'Receipt.png', t: 'Receipt', tone: 'warn' as const, r: 0, x: 0 },
    { n: 'Certificate.pdf', t: 'Certificate', tone: 'ink' as const, r: 6, x: 6 },
  ];
  return (
    <div className="group relative h-[150px]">
      {files.map((f, i) => (
        <div
          key={f.n}
          className="absolute inset-x-3 flex items-center gap-3 rounded-2xl bg-paper p-3.5 shadow-soft ring-1 ring-ink/[0.07] transition-transform duration-700 ease-matie"
          style={{ top: i * 26, transform: `rotate(${f.r}deg) translateX(${f.x}px)`, zIndex: i }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><FileText size={16} strokeWidth={1.6} /></span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{f.n}</span>
          <Badge tone={f.tone}>{f.t}</Badge>
        </div>
      ))}
    </div>
  );
}

function NotesDemo() {
  return (
    <div className="space-y-2">
      {[['Client onboarding checklist', 'Playbook', true], ['Design rules', 'Design', false], ['Employment terms', 'Terms', false]].map(([t, c, pin], i) => (
        <div key={t as string} className="rounded-2xl bg-paper-2 p-3.5 ring-1 ring-ink/[0.06] transition-[transform,background-color] duration-500 ease-matie hover:-translate-y-0.5 hover:bg-paper" style={{ marginLeft: i * 10 }}>
          <div className="flex items-center gap-2">
            <Badge tone="brand">{c as string}</Badge>
            {pin && <Badge tone="warn">Pinned</Badge>}
          </div>
          <p className="mt-2 text-[13.5px] font-medium text-ink">{t as string}</p>
        </div>
      ))}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="px-4 py-24 sm:px-8 md:py-36">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 max-w-[720px]">
          <Reveal><Eyebrow>Features</Eyebrow></Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 text-balance text-[clamp(2.2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">
              Everything a solo business needs, <span className="font-display italic text-brand-600">nothing it doesn't.</span>
            </h2>
          </Reveal>
        </div>

        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }} className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
          <FCard className="lg:col-span-7" icon={FolderKanban} hint="Clients & projects" title="Every client and project, always current" body="Fees, deadlines, downpayments and progress for each job — with overdue work flagged before it bites.">
            <ProjectsDemo />
          </FCard>
          <FCard className="lg:col-span-5" icon={CalendarCheck} hint="Attendance" title="Work days become salary" body="Mark the days you worked. Your expected salary updates as you go.">
            <AttendanceDemo />
          </FCard>
          <FCard className="lg:col-span-5" icon={LineChart} hint="Money Hub" title="See profit, not just income" body="Log income and expenses, then watch monthly cash flow take shape.">
            <MoneyDemo />
          </FCard>
          <FCard className="lg:col-span-7" icon={ShieldCheck} hint="Privacy mode" title="Hide everything with one tap" body="Every amount and client name can be masked instantly — handy when someone's looking over your shoulder.">
            <PrivacyDemo />
          </FCard>
          <FCard className="lg:col-span-4" icon={PiggyBank} hint="Savings goals" title="Know when you can buy it" body="Star a wishlist item and track how close you are.">
            <SavingsDemo />
          </FCard>
          <FCard className="lg:col-span-4" icon={FolderLock} hint="Files & contracts" title="Your paper trail, organised" body="Contracts, receipts and certificates — searchable and a click away.">
            <FilesDemo />
          </FCard>
          <FCard className="lg:col-span-4" icon={StickyNote} hint="Knowledge vault" title="Write it down once" body="Terms, playbooks and lessons, pinned and tagged.">
            <NotesDemo />
          </FCard>
        </motion.div>
      </div>
    </section>
  );
}
