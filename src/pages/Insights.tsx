import { useMemo, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, Bar as RBar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarCheck, LineChart as LineIcon, Trophy, TrendingDown, TrendingUp } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { ATTENDANCE_RATE_FACTOR } from '../types';
import { pesoCompact } from '../lib/format';
import { fadeUp, stagger } from '../lib/motion';
import { cn } from '../lib/cn';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardHeader } from '../ui/Card';
import { Bar } from '../ui/Progress';
import { EmptyState } from '../ui/EmptyState';
import { Money } from '../ui/Money';
import { Segmented } from '../ui/Segmented';
import { ChartTooltip } from '../ui/chart';
import { CHART } from '../ui/chartTheme';
import { usePrivacy } from '../lib/usePrivacy';
import PrivateText from '../components/PrivateText';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + x.amount, 0);
type Range = '3' | '6' | '12';

const axisMoney = (v: number | string) => pesoCompact(Number(v)).replace('₱', '');

export default function Insights() {
  const reduce = useReducedMotion();
  const { on: hide, name: pname } = usePrivacy();
  const transactions = useMatieeStore((s) => s.transactions);
  const attendance = useMatieeStore((s) => s.attendance);
  const dailyRate = useMatieeStore((s) => s.dailyRate);
  const projects = useMatieeStore((s) => s.projects);
  const payments = useMatieeStore((s) => s.payments);
  const clients = useMatieeStore((s) => s.clients);
  const [range, setRange] = useState<Range>('6');
  const n = Number(range);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
      return { key: monthKey(d), label: MONTHS[d.getMonth()] };
    });
  }, [n]);

  const cashflow = useMemo(
    () => months.map((m) => {
      const tx = transactions.filter((t) => t.date.slice(0, 7) === m.key);
      return { label: m.label, Income: sum(tx.filter((t) => t.type === 'income')), Expenses: sum(tx.filter((t) => t.type === 'expense')) };
    }),
    [months, transactions],
  );

  const workDays = useMemo(
    () => months.map((m) => ({
      label: m.label,
      Days: attendance.filter((a) => a.date.slice(0, 7) === m.key).reduce((s, a) => s + ATTENDANCE_RATE_FACTOR[a.status], 0),
    })),
    [months, attendance],
  );

  const paymentTrend = useMemo(
    () => months.map((m) => ({ label: m.label, Payments: sum(payments.filter((p) => p.date && p.date.slice(0, 7) === m.key)) })),
    [months, payments],
  );

  const expensePie = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === 'expense').forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [transactions]);

  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => {
      const name = clients.find((c) => c.id === p.clientId)?.name ?? 'Unknown';
      map.set(name, (map.get(name) ?? 0) + p.fee);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [projects, clients]);

  const totalWorked = attendance.reduce((s, a) => s + ATTENDANCE_RATE_FACTOR[a.status], 0);
  const totalEarned = totalWorked * dailyRate;
  const totalIncome = sum(transactions.filter((t) => t.type === 'income'));
  const totalExpense = sum(transactions.filter((t) => t.type === 'expense'));

  const stats: { label: string; icon: typeof TrendingUp; node: ReactNode; sub: ReactNode }[] = [
    { label: 'Work days', icon: CalendarCheck, node: <>{Math.floor(totalWorked)}<span className="ml-1 text-sm font-normal text-mute">days</span></>, sub: <>≈ <Money value={totalEarned} /> earned</> },
    { label: 'Total income', icon: TrendingUp, node: <Money value={totalIncome} animate />, sub: 'All time' },
    { label: 'Total expenses', icon: TrendingDown, node: <Money value={totalExpense} animate />, sub: 'All time' },
    { label: 'Top client', icon: Trophy, node: <span className="block truncate text-[22px]"><PrivateText type="name">{topClients[0]?.name ?? '—'}</PrivateText></span>, sub: topClients[0] ? <><Money value={topClients[0].value} /> in projects</> : 'No projects yet' },
  ];

  const grid = { vertical: false, stroke: CHART.grid } as const;
  const margin = { top: 4, right: 4, left: -8, bottom: 0 };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights"
        title="See the patterns"
        description="Money, work days and clients — over time."
        actions={<Segmented<Range> ariaLabel="Time range" value={range} onChange={setRange} options={[{ value: '3', label: '3 months' }, { value: '6', label: '6 months' }, { value: '12', label: '12 months' }]} />}
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={fadeUp} className="min-w-0 [&>*]:h-full">
              <Card bezel spotlight pad="md">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={17} strokeWidth={1.6} /></span>
                  <p className="text-[13px] text-mute">{s.label}</p>
                </div>
                <p className="truncate text-[26px] font-semibold leading-none tracking-[-0.04em] text-ink">{s.node}</p>
                <p className="mt-2 truncate text-xs text-mute">{s.sub}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard title="Cash flow" description="Income vs expenses" empty={!cashflow.some((d) => d.Income || d.Expenses)} emptyLabel="Log income and expenses to see trends" legend={[['Income', CHART.brand], ['Expenses', CHART.clay]]}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashflow} barGap={4} margin={margin}>
              <CartesianGrid {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tick={!hide} tickFormatter={axisMoney} width={hide ? 8 : 44} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(28 111 69 / 0.06)' }} />
              <RBar dataKey="Income" fill={CHART.brand} radius={[7, 7, 0, 0]} maxBarSize={24} isAnimationActive={!reduce} />
              <RBar dataKey="Expenses" fill={CHART.clay} radius={[7, 7, 0, 0]} maxBarSize={24} isAnimationActive={!reduce} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card bezel pad="md">
          <CardHeader title="Where money goes" description="Expenses by category, all time" />
          {expensePie.length === 0 ? (
            <EmptyState compact icon={LineIcon} title="No expenses yet" description="Log an expense to see the split." />
          ) : (
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative h-[210px] w-[210px] shrink-0" role="img" aria-label="Donut chart of expenses by category">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expensePie} dataKey="value" nameKey="name" innerRadius={66} outerRadius={98} paddingAngle={3} cornerRadius={6} stroke="none" isAnimationActive={!reduce}>
                      {expensePie.map((_, i) => <Cell key={i} fill={CHART.series[i % CHART.series.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] text-mute">Total</span>
                  <span className="text-lg font-semibold tracking-tight text-ink"><Money value={totalExpense} compact /></span>
                </div>
              </div>
              <ul className="w-full min-w-0 flex-1 space-y-2.5">
                {expensePie.slice(0, 6).map((e, i) => (
                  <li key={e.name} className="flex items-center gap-2.5 text-[13px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CHART.series[i % CHART.series.length] }} />
                    <span className="flex-1 truncate text-ink-2">{e.name}</span>
                    <span className="font-semibold text-ink"><Money value={e.value} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <ChartCard title="Work days" description="Full and half days per month" empty={!workDays.some((d) => d.Days > 0)} emptyLabel="Mark your attendance to see the trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={workDays} margin={margin}>
              <defs>
                <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={30} />
              <Tooltip content={<ChartTooltip money={false} />} />
              <Area type="monotone" dataKey="Days" stroke={CHART.brand} strokeWidth={2.5} fill="url(#wd)" dot={{ r: 4, fill: '#fff', stroke: CHART.brand, strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={!reduce} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payments received" description="Logged on client projects" empty={!paymentTrend.some((d) => d.Payments > 0)} emptyLabel="Payments you log on projects will show here">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentTrend} margin={margin}>
              <CartesianGrid {...grid} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tick={!hide} tickFormatter={axisMoney} width={hide ? 8 : 44} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(28 111 69 / 0.06)' }} />
              <RBar dataKey="Payments" fill={CHART.ochre} radius={[7, 7, 0, 0]} maxBarSize={30} isAnimationActive={!reduce} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card bezel pad="md" className="xl:col-span-2">
          <CardHeader title="Top clients" description="By total project value" />
          {topClients.length === 0 ? (
            <EmptyState compact icon={Trophy} title="No rankings yet" description="Add clients and projects to see who matters most." />
          ) : (
            <ol className="space-y-4">
              {topClients.map((c, i) => (
                <li key={c.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[13.5px]">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', i === 0 ? 'bg-warn-100 text-warn-700' : 'bg-ink/[0.06] text-mute')}>{i + 1}</span>
                      <span className="truncate font-medium text-ink"><PrivateText type="name">{c.name}</PrivateText></span>
                    </span>
                    <span className="shrink-0 font-semibold text-ink"><Money value={c.value} /></span>
                  </div>
                  <div className="ml-9"><Bar value={(c.value / (topClients[0]?.value || 1)) * 100} height={6} label={`${pname(c.name)} share of top client`} /></div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, description, empty, emptyLabel, legend, children }: { title: string; description: string; empty: boolean; emptyLabel: string; legend?: [string, string][]; children: ReactNode }) {
  return (
    <Card bezel pad="md">
      <CardHeader
        title={title}
        description={description}
        action={legend && (
          <div className="flex items-center gap-3 text-[11px] font-medium text-mute">
            {legend.map(([l, c]) => <span key={l} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}</span>)}
          </div>
        )}
      />
      {empty ? <EmptyState compact icon={LineIcon} title="Nothing to chart yet" description={emptyLabel} /> : <div className="h-[240px]" role="img" aria-label={`${title} chart`}>{children}</div>}
    </Card>
  );
}
