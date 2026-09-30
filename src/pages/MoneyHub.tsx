import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownLeft, ArrowUpRight, Banknote, CalendarPlus, CreditCard, HandCoins, Landmark, Pause, Pencil, PiggyBank, Play,
  Plus, Receipt, Repeat, Smartphone, Trash2, TrendingDown, TrendingUp, Wallet, type LucideIcon,
} from 'lucide-react';
import { Bar as RBar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMatieeStore } from '../store/matieeStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type AccountIcon, type TransactionType } from '../types';
import { R } from '../routes';
import { fmtDateLong, pesoCompact, todayStr } from '../lib/format';
import { fadeUp, stagger } from '../lib/motion';
import { cn } from '../lib/cn';
import { PageHeader } from '../ui/PageHeader';
import { Button, IconButton, LinkButton } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { Bar } from '../ui/Progress';
import { Chips } from '../ui/Chips';
import { EmptyState } from '../ui/EmptyState';
import { Field, Input, MoneyInput } from '../ui/Field';
import { Money } from '../ui/Money';
import { Segmented } from '../ui/Segmented';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ChartTooltip } from '../ui/chart';
import { CHART } from '../ui/chartTheme';
import { usePrivacy } from '../lib/usePrivacy';
import { toast } from '../ui/toast';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ACCOUNT_META: Record<AccountIcon, { Icon: LucideIcon; label: string }> = {
  bank: { Icon: Landmark, label: 'Bank' },
  wallet: { Icon: Smartphone, label: 'E-wallet' },
  cash: { Icon: HandCoins, label: 'Cash' },
  card: { Icon: CreditCard, label: 'Card' },
};
const ACCOUNT_TYPES: AccountIcon[] = ['bank', 'wallet', 'cash', 'card'];

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + x.amount, 0);

type Filter = 'all' | TransactionType;

export default function MoneyHub() {
  const reduce = useReducedMotion();
  const { on: hide } = usePrivacy();
  const transactions = useMatieeStore((s) => s.transactions);
  const accounts = useMatieeStore((s) => s.accounts);
  const recurring = useMatieeStore((s) => s.recurring);
  const addTransaction = useMatieeStore((s) => s.addTransaction);
  const deleteTransaction = useMatieeStore((s) => s.deleteTransaction);
  const addAccount = useMatieeStore((s) => s.addAccount);
  const updateAccount = useMatieeStore((s) => s.updateAccount);
  const deleteAccount = useMatieeStore((s) => s.deleteAccount);
  const addRecurring = useMatieeStore((s) => s.addRecurring);
  const updateRecurring = useMatieeStore((s) => s.updateRecurring);
  const deleteRecurring = useMatieeStore((s) => s.deleteRecurring);

  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const [limit, setLimit] = useState(15);

  // transaction dialog
  const [txOpen, setTxOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('income');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDate, setTxDate] = useState(todayStr());
  const [txDesc, setTxDesc] = useState('');
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  // account dialog (add + edit)
  const [accOpen, setAccOpen] = useState(false);
  const [accId, setAccId] = useState<string | null>(null);
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [accIcon, setAccIcon] = useState<AccountIcon>('bank');
  const [accToDelete, setAccToDelete] = useState<string | null>(null);

  // recurring dialog
  const [recOpen, setRecOpen] = useState(false);
  const [recType, setRecType] = useState<TransactionType>('income');
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recCategory, setRecCategory] = useState('');
  const [recToDelete, setRecToDelete] = useState<string | null>(null);

  function openTx(type: TransactionType) {
    setTxType(type);
    setTxAmount('');
    setTxCategory('');
    setTxDesc('');
    setTxDate(todayStr());
    setTxOpen(true);
  }

  // Deep link: /app/money?new=1 (or ?new=expense)
  useEffect(() => {
    const v = params.get('new');
    if (v) {
      openTx(v === 'expense' ? 'expense' : 'income');
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const totals = useMemo(() => {
    const inc = transactions.filter((t) => t.type === 'income');
    const exp = transactions.filter((t) => t.type === 'expense');
    const key = monthKey(new Date());
    const incM = inc.filter((t) => t.date.slice(0, 7) === key);
    const expM = exp.filter((t) => t.date.slice(0, 7) === key);
    return {
      income: sum(inc),
      expense: sum(exp),
      net: sum(inc) - sum(exp),
      incomeMonth: sum(incM),
      expenseMonth: sum(expM),
      netMonth: sum(incM) - sum(expM),
    };
  }, [transactions]);

  const accountsTotal = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);

  const rec = useMemo(() => {
    const active = recurring.filter((r) => r.active);
    const inc = sum(active.filter((r) => r.type === 'income'));
    const bills = sum(active.filter((r) => r.type === 'expense'));
    return { inc, bills, left: inc - bills };
  }, [recurring]);

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = monthKey(d);
      const inMonth = transactions.filter((t) => t.date.slice(0, 7) === key);
      return {
        label: MONTHS[d.getMonth()],
        Income: sum(inMonth.filter((t) => t.type === 'income')),
        Expenses: sum(inMonth.filter((t) => t.type === 'expense')),
      };
    });
  }, [transactions]);

  const list = useMemo(
    () => transactions.filter((t) => filter === 'all' || t.type === filter).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [transactions, filter],
  );

  const breakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === 'expense').forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [transactions]);

  function saveTx() {
    const amt = parseFloat(txAmount);
    if (Number.isNaN(amt) || amt <= 0) return;
    const cat = txCategory || 'Other';
    addTransaction({ type: txType, amount: amt, category: cat, date: txDate, description: txDesc.trim() || cat });
    setTxOpen(false);
    toast(txType === 'income' ? 'Income logged' : 'Expense logged', 'success');
  }

  function openAccount(id?: string) {
    const a = id ? accounts.find((x) => x.id === id) : undefined;
    setAccId(a?.id ?? null);
    setAccName(a?.name ?? '');
    setAccBalance(a ? String(a.balance) : '');
    setAccIcon(a?.icon ?? 'bank');
    setAccOpen(true);
  }

  function saveAccount() {
    const name = accName.trim();
    if (!name) return;
    const balance = parseFloat(accBalance) || 0;
    if (accId) {
      updateAccount(accId, { name, balance, icon: accIcon });
      toast('Account updated', 'success');
    } else {
      addAccount({ name, balance, icon: accIcon });
      toast('Account added', 'success');
    }
    setAccOpen(false);
  }

  function saveRecurring() {
    const title = recTitle.trim();
    const amt = parseFloat(recAmount);
    if (!title || Number.isNaN(amt) || amt <= 0) return;
    addRecurring({ title, amount: amt, type: recType, category: recCategory || (recType === 'income' ? 'Salary' : 'Other'), active: true });
    setRecOpen(false);
    setRecTitle('');
    setRecAmount('');
    setRecCategory('');
    toast('Added to monthly setup', 'success');
  }

  const txCats = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const recCats = recType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const hasChart = chartData.some((d) => d.Income || d.Expenses);

  const kpis = [
    { label: 'Total income', value: totals.income, sub: totals.incomeMonth, icon: TrendingUp, tone: 'paper' as const },
    { label: 'Total expenses', value: totals.expense, sub: totals.expenseMonth, icon: TrendingDown, tone: 'paper' as const },
    { label: 'In accounts', value: accountsTotal, subText: `${accounts.length} account${accounts.length === 1 ? '' : 's'}`, icon: Wallet, tone: 'paper' as const },
    { label: 'Net profit', value: totals.net, sub: totals.netMonth, icon: PiggyBank, tone: 'brand' as const },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Money Hub"
        title="Every peso, accounted for"
        description="Log what comes in and goes out — your profit, always in view."
        actions={
          <>
            <Button size="lg" variant="secondary" leading={<ArrowDownLeft size={16} strokeWidth={1.75} />} onClick={() => openTx('expense')}>Expense</Button>
            <Button size="lg" trailing={<Plus size={16} strokeWidth={2} />} onClick={() => openTx('income')}>Income</Button>
          </>
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          const dark = k.tone === 'brand';
          return (
            <motion.div key={k.label} variants={fadeUp} className="min-w-0 [&>*]:h-full">
              <Card bezel spotlight tone={k.tone} pad="md">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', dark ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-600')}>
                    <Icon size={17} strokeWidth={1.6} />
                  </span>
                  <p className={cn('text-[13px]', dark ? 'text-white/75' : 'text-mute')}>{k.label}</p>
                </div>
                <p className="text-[clamp(1.6rem,2.6vw,2rem)] font-semibold leading-none tracking-[-0.04em]"><Money value={k.value} animate /></p>
                <p className={cn('mt-2 text-xs', dark ? 'text-white/65' : 'text-mute')}>
                  {'subText' in k ? k.subText : <><Money value={k.sub as number} /> this month</>}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <Card bezel pad="md">
        <CardHeader
          title="Accounts & wallets"
          description="Wherever your money lives"
          action={<Button size="sm" variant="soft" leading={<Plus size={14} strokeWidth={2} />} onClick={() => openAccount()}>Add account</Button>}
        />
        {accounts.length === 0 ? (
          <EmptyState compact icon={Landmark} title="No accounts yet" description="Add BPI, GCash, cash — and see your total buying power." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => {
              const { Icon, label } = ACCOUNT_META[a.icon] ?? ACCOUNT_META.bank;
              const pct = accountsTotal > 0 ? (a.balance / accountsTotal) * 100 : 0;
              return (
                <li key={a.id} className="group rounded-[20px] bg-paper-2 p-4 ring-1 ring-ink/[0.06] transition-[box-shadow,transform] duration-500 ease-matie hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={18} strokeWidth={1.6} /></span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{a.name}</p>
                        <p className="text-[11px] text-mute">{label}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 md:opacity-0 md:transition-opacity md:duration-300 md:focus-within:opacity-100 md:group-hover:opacity-100">
                      <IconButton size="sm" tone="soft" label={`Edit ${a.name}`} onClick={() => openAccount(a.id)}><Pencil size={13} strokeWidth={1.75} /></IconButton>
                      <IconButton size="sm" tone="danger" label={`Delete ${a.name}`} onClick={() => setAccToDelete(a.id)}><Trash2 size={13} strokeWidth={1.75} /></IconButton>
                    </div>
                  </div>
                  <p className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-ink"><Money value={a.balance} /></p>
                  <div className="mt-3 flex items-center gap-2">
                    <Bar value={pct} height={5} label={`${a.name} share of total`} />
                    <span className="w-8 text-right text-[11px] tabular-nums text-mute">{pct.toFixed(0)}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card bezel pad="md">
            <CardHeader
              title="Income vs expenses"
              description="Last 6 months"
              action={
                <div className="flex items-center gap-3 text-[11px] font-medium text-mute">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Income</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-clay-500" /> Expenses</span>
                </div>
              }
            />
            {hasChart ? (
              <div className="h-64" role="img" aria-label="Bar chart of monthly income and expenses for the last six months">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={CHART.grid} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={!hide} tickFormatter={(v) => pesoCompact(Number(v)).replace('₱', '')} width={hide ? 8 : 44} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(28 111 69 / 0.06)' }} />
                    <RBar dataKey="Income" fill={CHART.brand} radius={[7, 7, 0, 0]} maxBarSize={26} isAnimationActive={!reduce} />
                    <RBar dataKey="Expenses" fill={CHART.clay} radius={[7, 7, 0, 0]} maxBarSize={26} isAnimationActive={!reduce} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState compact icon={Banknote} title="No transactions yet" description="Log your first income or expense to see the chart." />
            )}
          </Card>

          <Card bezel pad="md">
            <CardHeader
              title="Transactions"
              description={`${list.length} ${filter === 'all' ? 'total' : filter}`}
              action={
                <Segmented<Filter>
                  size="sm"
                  ariaLabel="Filter transactions"
                  value={filter}
                  onChange={(v) => { setFilter(v); setLimit(15); }}
                  options={[{ value: 'all', label: 'All' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expenses' }]}
                />
              }
            />
            {list.length === 0 ? (
              <EmptyState compact icon={Receipt} title={`No ${filter === 'all' ? '' : filter + ' '}transactions yet`} description="Use the buttons above to log one." />
            ) : (
              <>
                <ul className="-mx-2">
                  {list.slice(0, limit).map((t) => (
                    <li key={t.id} className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors duration-300 hover:bg-ink/[0.03]">
                      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.type === 'income' ? 'bg-brand-50 text-brand-600' : 'bg-clay-100 text-clay-600')}>
                        {t.type === 'income' ? <ArrowUpRight size={18} strokeWidth={1.75} /> : <ArrowDownLeft size={18} strokeWidth={1.75} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{t.description}</span>
                        <span className="block truncate text-[11.5px] text-mute">{t.category} · {fmtDateLong(t.date)}</span>
                      </span>
                      <span className={cn('shrink-0 text-sm font-semibold tabular-nums', t.type === 'income' ? 'text-brand-700' : 'text-clay-600')}>
                        {t.type === 'income' ? '+' : '−'}<Money value={t.amount} />
                      </span>
                      <IconButton size="sm" tone="danger" label={`Delete ${t.description}`} className="md:opacity-0 md:transition-opacity md:duration-300 md:focus-visible:opacity-100 md:group-hover:opacity-100" onClick={() => setTxToDelete(t.id)}>
                        <Trash2 size={13} strokeWidth={1.75} />
                      </IconButton>
                    </li>
                  ))}
                </ul>
                {list.length > limit && (
                  <div className="mt-3 flex justify-center">
                    <Button variant="secondary" size="sm" onClick={() => setLimit((l) => l + 15)}>Show more ({list.length - limit})</Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card bezel pad="md">
            <CardHeader
              title="Monthly setup"
              description="Fixed income in, bills out"
              action={<Button size="sm" variant="soft" leading={<Plus size={14} strokeWidth={2} />} onClick={() => { setRecType('income'); setRecCategory(''); setRecOpen(true); }}>Add</Button>}
            />
            {recurring.length === 0 ? (
              <EmptyState compact icon={Repeat} title="Nothing set up" description="e.g. salary, internet bill, rent." />
            ) : (
              <>
                <ul className="-mx-2 space-y-0.5">
                  {recurring.map((r) => (
                    <li key={r.id} className={cn('group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-ink/[0.03]', !r.active && 'opacity-50')}>
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', r.type === 'income' ? 'bg-brand-50 text-brand-600' : 'bg-clay-100 text-clay-600')}>
                        {r.type === 'income' ? <ArrowUpRight size={16} strokeWidth={1.75} /> : <ArrowDownLeft size={16} strokeWidth={1.75} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">{r.title}</span>
                        <span className="block truncate text-[11px] text-mute">{r.type === 'income' ? 'Income' : 'Bill'} · {r.category}{!r.active ? ' · paused' : ''}</span>
                      </span>
                      <span className={cn('shrink-0 text-[13px] font-semibold tabular-nums', r.type === 'income' ? 'text-brand-700' : 'text-clay-600')}>
                        {r.type === 'income' ? '+' : '−'}<Money value={r.amount} />
                      </span>
                      <span className="flex shrink-0 gap-0.5">
                        <IconButton size="sm" tone="soft" label={`Log ${r.title} for this month`} onClick={() => { addTransaction({ type: r.type, amount: r.amount, category: r.category, date: todayStr(), description: r.title }); toast(`${r.title} logged`, 'success'); }}><CalendarPlus size={13} strokeWidth={1.75} /></IconButton>
                        <IconButton size="sm" tone="soft" label={r.active ? `Pause ${r.title}` : `Resume ${r.title}`} onClick={() => updateRecurring(r.id, { active: !r.active })}>{r.active ? <Pause size={13} strokeWidth={1.75} /> : <Play size={13} strokeWidth={1.75} />}</IconButton>
                        <IconButton size="sm" tone="danger" label={`Remove ${r.title}`} onClick={() => setRecToDelete(r.id)}><Trash2 size={13} strokeWidth={1.75} /></IconButton>
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-ink/[0.07] pt-4 text-center">
                  <div className="rounded-2xl bg-brand-50/70 p-2.5"><dt className="text-[10px] font-medium text-mute">Monthly in</dt><dd className="text-[13px] font-semibold text-brand-700"><Money value={rec.inc} compact /></dd></div>
                  <div className="rounded-2xl bg-clay-100/70 p-2.5"><dt className="text-[10px] font-medium text-mute">Bills</dt><dd className="text-[13px] font-semibold text-clay-600"><Money value={rec.bills} compact /></dd></div>
                  <div className="rounded-2xl bg-ink/[0.04] p-2.5"><dt className="text-[10px] font-medium text-mute">Left over</dt><dd className={cn('text-[13px] font-semibold', rec.left >= 0 ? 'text-ink' : 'text-clay-600')}><Money value={rec.left} compact /></dd></div>
                </dl>
              </>
            )}
          </Card>

          <Card bezel pad="md">
            <CardHeader title="Where it goes" description="Top expense categories" />
            {breakdown.length === 0 ? (
              <p className="py-6 text-center text-sm text-mute">No expenses logged yet.</p>
            ) : (
              <ul className="space-y-4">
                {breakdown.map(([cat, amt]) => (
                  <li key={cat}>
                    <div className="mb-1.5 flex items-center justify-between text-[13px]">
                      <span className="text-ink-2">{cat}</span>
                      <span className="font-semibold text-ink"><Money value={amt} /></span>
                    </div>
                    <Bar value={totals.expense > 0 ? (amt / totals.expense) * 100 : 0} height={6} className="!bg-clay-500/80" label={`${cat} share of expenses`} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card bezel tone="sand" pad="md">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2"><PiggyBank size={16} strokeWidth={1.6} className="text-brand-600" /> Savings goals</div>
            <p className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-ink"><Money value={accountsTotal} /></p>
            <p className="text-xs text-mute">Money across all accounts — your buying power.</p>
            <LinkButton to={R.savings} variant="secondary" size="sm" className="mt-4">Open savings goal</LinkButton>
          </Card>
        </div>
      </div>

      {/* Transaction dialog */}
      <Modal
        open={txOpen}
        onClose={() => setTxOpen(false)}
        title={txType === 'income' ? 'Log income' : 'Log expense'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTxOpen(false)}>Cancel</Button>
            <Button variant={txType === 'income' ? 'primary' : 'danger'} onClick={saveTx} disabled={!txAmount || parseFloat(txAmount) <= 0}>Save {txType}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Segmented<TransactionType> ariaLabel="Type" value={txType} onChange={(v) => { setTxType(v); setTxCategory(''); }} options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} className="self-start" />
          <Field label="Amount">{(id) => <MoneyInput id={id} data-autofocus value={txAmount} onChange={(e) => setTxAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveTx()} placeholder="2500" />}</Field>
          <div>
            <p className="mb-2 text-xs font-medium text-ink-2">Category</p>
            <Chips label="Category" value={txCategory} onChange={setTxCategory} options={txCats.map((c) => ({ value: c, label: c }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date">{(id) => <Input id={id} type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />}</Field>
            <Field label="Description">{(id) => <Input id={id} value={txDesc} onChange={(e) => setTxDesc(e.target.value)} placeholder={txType === 'income' ? 'e.g. DORY salary' : 'e.g. Load for client meeting'} />}</Field>
          </div>
        </div>
      </Modal>

      {/* Account dialog */}
      <Modal
        open={accOpen}
        onClose={() => setAccOpen(false)}
        title={accId ? 'Edit account' : 'Add account'}
        size="sm"
        footer={<><Button variant="ghost" onClick={() => setAccOpen(false)}>Cancel</Button><Button onClick={saveAccount} disabled={!accName.trim()}>{accId ? 'Save changes' : 'Add account'}</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Account name">{(id) => <Input id={id} data-autofocus value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="e.g. BPI, GCash, Cash" />}</Field>
          <Field label="Current balance">{(id) => <MoneyInput id={id} value={accBalance} onChange={(e) => setAccBalance(e.target.value)} placeholder="5000" />}</Field>
          <div>
            <p className="mb-2 text-xs font-medium text-ink-2">Type</p>
            <Chips label="Account type" value={accIcon} onChange={setAccIcon} options={ACCOUNT_TYPES.map((t) => ({ value: t, label: <>{(() => { const I = ACCOUNT_META[t].Icon; return <I size={14} strokeWidth={1.75} />; })()}{ACCOUNT_META[t].label}</> }))} />
          </div>
        </div>
      </Modal>

      {/* Recurring dialog */}
      <Modal
        open={recOpen}
        onClose={() => setRecOpen(false)}
        title="Add to monthly setup"
        footer={<><Button variant="ghost" onClick={() => setRecOpen(false)}>Cancel</Button><Button onClick={saveRecurring} disabled={!recTitle.trim() || !recAmount || parseFloat(recAmount) <= 0}>Add</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Segmented<TransactionType> ariaLabel="Kind" value={recType} onChange={(v) => { setRecType(v); setRecCategory(''); }} options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Bill' }]} className="self-start" />
          <Field label="Title">{(id) => <Input id={id} data-autofocus value={recTitle} onChange={(e) => setRecTitle(e.target.value)} placeholder={recType === 'income' ? 'e.g. DORY salary' : 'e.g. Internet bill'} />}</Field>
          <Field label="Amount per month">{(id) => <MoneyInput id={id} value={recAmount} onChange={(e) => setRecAmount(e.target.value)} placeholder="1500" />}</Field>
          <div>
            <p className="mb-2 text-xs font-medium text-ink-2">Category</p>
            <Chips label="Category" value={recCategory} onChange={setRecCategory} options={recCats.map((c) => ({ value: c, label: c }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={txToDelete !== null} onClose={() => setTxToDelete(null)} title="Delete this transaction?" description="It will be removed from your totals and charts." onConfirm={() => { if (txToDelete) deleteTransaction(txToDelete); toast('Transaction deleted'); }} />
      <ConfirmDialog open={accToDelete !== null} onClose={() => setAccToDelete(null)} title="Delete this account?" description="Its balance no longer counts toward your total." onConfirm={() => { if (accToDelete) deleteAccount(accToDelete); toast('Account deleted'); }} />
      <ConfirmDialog open={recToDelete !== null} onClose={() => setRecToDelete(null)} title="Remove from monthly setup?" onConfirm={() => { if (recToDelete) deleteRecurring(recToDelete); toast('Removed'); }} />
    </div>
  );
}
