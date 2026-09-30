import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useMatieeStore } from '../store/matieeStore';
import { projectFinance } from '../lib/finance';
import { daysUntil, greeting } from '../lib/format';
import { OWNER } from '../config';
import { fadeUp, stagger } from '../lib/motion';
import { Hero } from './dashboard/Hero';
import { Pulse } from './dashboard/Pulse';
import { CashFlow } from './dashboard/CashFlow';
import { Deadlines } from './dashboard/Deadlines';
import { AttendanceCard } from './dashboard/AttendanceCard';
import { ClientsCard } from './dashboard/ClientsCard';
import { SavingsCard } from './dashboard/SavingsCard';
import { GetStarted } from './dashboard/GetStarted';
import { QuickAdd } from './dashboard/QuickAdd';

function Cell({ span, children }: { span: string; children: ReactNode }) {
  return (
    <motion.div variants={fadeUp} className={`${span} min-w-0 [&>*]:h-full`}>
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  const projects = useMatieeStore((s) => s.projects);
  const accounts = useMatieeStore((s) => s.accounts);

  const fin = useMemo(() => projectFinance(projects), [projects]);
  const accountsTotal = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);
  // Same definition as before: every project fee + everything sitting in accounts.
  const portfolio = fin.pipelineValue + accountsTotal;

  const summary = useMemo(() => {
    if (projects.length === 0) return 'Your vault is ready. Start with a client, then add their first project.';
    const active = projects.filter((p) => p.status === 'in-progress').length;
    const overdue = projects.filter((p) => p.status !== 'completed' && (daysUntil(p.deadline) ?? 1) < 0).length;
    const soon = projects.filter((p) => {
      const d = daysUntil(p.deadline);
      return p.status !== 'completed' && d !== null && d >= 0 && d <= 7;
    }).length;
    const bits = [`${active} project${active === 1 ? '' : 's'} in progress`];
    if (overdue) bits.push(`${overdue} overdue`);
    if (soon) bits.push(`${soon} due this week`);
    return bits.join(' · ');
  }, [projects]);

  const now = new Date();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-[clamp(2rem,4.2vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
            {greeting(now)},{' '}
            <span className="font-display text-[1.08em] font-normal italic tracking-[-0.03em] text-brand-600">{OWNER.firstName}</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-mute">{summary}</p>
        </div>
        <QuickAdd />
      </motion.div>

      <GetStarted />

      <motion.div variants={stagger(0.07, 0.1)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-12">
        <Cell span="md:col-span-2 xl:col-span-8">
          <Hero revenue={fin.totalRevenue} outstanding={fin.outstanding} downpayments={fin.downpaymentsCollected} savings={accountsTotal} portfolio={portfolio} />
        </Cell>
        <Cell span="md:col-span-2 xl:col-span-4">
          <Pulse projects={projects} />
        </Cell>
        <Cell span="md:col-span-2 xl:col-span-7">
          <CashFlow />
        </Cell>
        <Cell span="md:col-span-2 xl:col-span-5">
          <Deadlines />
        </Cell>
        <Cell span="xl:col-span-4">
          <AttendanceCard />
        </Cell>
        <Cell span="xl:col-span-4">
          <ClientsCard />
        </Cell>
        <Cell span="md:col-span-2 xl:col-span-4">
          <SavingsCard totalSaved={fin.totalRevenue + accountsTotal} />
        </Cell>
      </motion.div>
    </div>
  );
}
