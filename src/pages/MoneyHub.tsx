import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowDownLeft, ArrowUpRight, Receipt, Banknote,
  Landmark, Smartphone, CreditCard, HandCoins, Repeat, CalendarPlus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useMatieeStore } from '../store/matieeStore';
import Reveal from '../components/Reveal';
import PrivateText from '../components/PrivateText';
import type { TransactionType, AccountIcon } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ACCOUNT_ICONS: Record<AccountIcon, { Icon: typeof Landmark; label: string; color: string }> = {
  bank: { Icon: Landmark, label: 'Bank', color: 'text-green-primary' },
  wallet: { Icon: Smartphone, label: 'E-Wallet', color: 'text-blue-500' },
  cash: { Icon: HandCoins, label: 'Cash', color: 'text-amber-600' },
  card: { Icon: CreditCard, label: 'Card', color: 'text-purple-500' },
};

const ACCOUNT_ICON_OPTIONS: AccountIcon[] = ['bank', 'wallet', 'cash', 'card'];

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function MoneyHub() {
  const navigate = useNavigate();
  const transactions = useMatieeStore((s) => s.transactions);
  const accounts = useMatieeStore((s) => s.accounts);
  const recurring = useMatieeStore((s) => s.recurring);
  const addTransaction = useMatieeStore((s) => s.addTransaction);
  const deleteTransaction = useMatieeStore((s) => s.deleteTransaction);
  const addAccount = useMatieeStore((s) => s.addAccount);
  const deleteAccount = useMatieeStore((s) => s.deleteAccount);
  const addRecurring = useMatieeStore((s) => s.addRecurring);
  const updateRecurring = useMatieeStore((s) => s.updateRecurring);
  const deleteRecurring = useMatieeStore((s) => s.deleteRecurring);

  // ── Transaction modal state ──
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'all' | 'income' | 'expense'>('all');
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  // ── Account modal state ──
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [accIcon, setAccIcon] = useState<AccountIcon>('bank');

  // ── Recurring modal state ──
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recType, setRecType] = useState<TransactionType>('income');
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recCategory, setRecCategory] = useState('');

  const stats = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = totalIncome - totalExpense;
    return { totalIncome, totalExpense, net };
  }, [transactions]);

  const totalAccounts = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);

  // Recurring totals (active items only)
  const recurringIncome = useMemo(
    () => recurring.filter((r) => r.type === 'income' && r.active).reduce((s, r) => s + r.amount, 0),
    [recurring],
  );
  const recurringBills = useMemo(
    () => recurring.filter((r) => r.type === 'expense' && r.active).reduce((s, r) => s + r.amount, 0),
    [recurring],
  );
  const recurringNet = recurringIncome - recurringBills;

  // This month's transactions
  const thisMonthKey = monthKey(new Date());
  const thisMonth = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income' && t.date.slice(0, 7) === thisMonthKey).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense' && t.date.slice(0, 7) === thisMonthKey).reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions, thisMonthKey]);

  // Last 6 months chart
  const chartData = useMemo(() => {
    const months: { label: string; Income: number; Expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const income = transactions.filter((t) => t.type === 'income' && t.date.slice(0, 7) === key).reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter((t) => t.type === 'expense' && t.date.slice(0, 7) === key).reduce((s, t) => s + t.amount, 0);
      months.push({ label: MONTHS[d.getMonth()], Income: income, Expense: expense });
    }
    return months;
  }, [transactions]);

  const sorted = useMemo(() => {
    const filtered = transactions.filter((t) => (tab === 'all' ? true : t.type === tab));
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, tab]);

  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const resetModal = () => {
    setType('income');
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  const openModal = (t: TransactionType) => {
    setType(t);
    setShowModal(true);
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    const cat = category || (type === 'income' ? 'Other' : 'Other');
    addTransaction({ type, amount: amt, category: cat, date, description: description.trim() || cat });
    setShowModal(false);
    resetModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) deleteTransaction(id);
  };

  const catList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // ── Account handlers ──
  const saveAccount = () => {
    const name = accName.trim();
    const bal = parseFloat(accBalance) || 0;
    if (!name) return;
    addAccount({ name, balance: bal, icon: accIcon });
    setShowAccountModal(false);
    setAccName('');
    setAccBalance('');
    setAccIcon('bank');
  };

  // ── Recurring handlers ──
  const saveRecurring = () => {
    const title = recTitle.trim();
    const amt = parseFloat(recAmount);
    if (!title || isNaN(amt) || amt <= 0) return;
    addRecurring({
      title,
      amount: amt,
      type: recType,
      category: recCategory || (recType === 'income' ? 'Salary' : 'Other'),
      active: true,
    });
    setShowRecurringModal(false);
    setRecTitle('');
    setRecAmount('');
    setRecCategory('');
    setRecType('income');
  };

  // Log a recurring item as this month's transaction
  const logRecurring = (r: { id: string; title: string; amount: number; type: TransactionType; category: string }) => {
    addTransaction({
      type: r.type,
      amount: r.amount,
      category: r.category,
      date: new Date().toISOString().slice(0, 10),
      description: r.title,
    });
  };

  const recCatList = recType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[32px] md:text-[46px] font-bold text-navy-900 leading-none tracking-tight">Money Hub</h1>
          <p className="text-sm text-gray-500 mt-2">Every peso in, every peso out — know your profit.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-2 h-11 px-5 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium rounded-full transition-all"
          >
            <ArrowDownLeft size={16} />
            Expense
          </button>
          <button
            onClick={() => openModal('income')}
            className="flex items-center gap-2 h-11 px-5 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all shadow-sm"
          >
            <Plus size={16} />
            Income
          </button>
        </div>
      </motion.div>

      {/* ── Top Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-mint/40 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-primary" />
            </div>
            <p className="text-sm text-gray-500">Total Income</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-navy-900">
            <PrivateText>{fmt(stats.totalIncome)}</PrivateText>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{fmt(thisMonth.income)} this month</p>
        </div>

        <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <p className="text-sm text-gray-500">Total Expenses</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-navy-900">
            <PrivateText>{fmt(stats.totalExpense)}</PrivateText>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{fmt(thisMonth.expense)} this month</p>
        </div>

        <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Wallet size={18} className="text-amber-500" />
            </div>
            <p className="text-sm text-gray-500">Money in Accounts</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-navy-900">
            <PrivateText>{fmt(totalAccounts)}</PrivateText>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{accounts.length} account{accounts.length === 1 ? '' : 's'}</p>
        </div>

        <div className="bg-gradient-to-br from-green-primary to-green-dark rounded-[22px] shadow-lg p-5 md:p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <PiggyBank size={18} />
            </div>
            <p className="text-sm text-white/80">Net Profit</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold">
            <PrivateText>{fmt(stats.net)}</PrivateText>
          </p>
          <p className="text-[11px] text-white/70 mt-1">{fmt(thisMonth.net)} this month</p>
        </div>
      </motion.div>

      {/* ── Bank Accounts ── */}
      <Reveal y={15} duration={0.4}>
        <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Landmark size={16} className="text-green-primary" />
              <h3 className="text-base font-semibold text-navy-900">Bank Accounts & Wallets</h3>
            </div>
            <button
              onClick={() => setShowAccountModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-mint/40 text-green-dark text-xs font-semibold hover:bg-green-mint transition-all"
            >
              <Plus size={13} />
              Add Account
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="py-8 text-center">
              <Landmark size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No accounts yet</p>
              <p className="text-xs text-gray-400 mt-1">Add BPI, GCash, cash — wherever your money lives</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const meta = ACCOUNT_ICONS[acc.icon];
                const Icon = meta.Icon;
                const pct = totalAccounts > 0 ? (acc.balance / totalAccounts) * 100 : 0;
                return (
                  <div key={acc.id} className="rounded-2xl border border-brand-100 p-4 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center ${meta.color}`}>
                          <Icon size={17} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy-900">{acc.name}</p>
                          <p className="text-[10px] text-gray-400">{meta.label}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-navy-900"><PrivateText>{fmt(acc.balance)}</PrivateText></p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-1.5 bg-brand-50 rounded-full overflow-hidden">
                        <div className="h-full bg-green-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Chart + Transactions ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Monthly P&L chart */}
          <Reveal y={15} duration={0.4}>
            <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Banknote size={16} className="text-green-primary" />
                  <h3 className="text-base font-semibold text-navy-900">Monthly Income vs Expenses</h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-primary" /> Income</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Expense</span>
                </div>
              </div>
              {chartData.some((d) => d.Income > 0 || d.Expense > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A8A8A' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#B0B0B0' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : String(v)} />
                      <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 14, border: '1px solid #ECECEC', fontSize: 12, fontFamily: 'Poppins' }} />
                      <Bar dataKey="Income" fill="#1C6F45" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Expense" fill="#F87171" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Banknote size={32} className="text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No transactions yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add your first income or expense to see the chart</p>
                </div>
              )}
            </div>
          </Reveal>

          {/* Transactions list */}
          <Reveal y={15} duration={0.4}>
            <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-navy-900">Transactions</h3>
                <div className="flex items-center gap-1 bg-brand-50 rounded-full p-1">
                  {(['all', 'income', 'expense'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-900'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {sorted.length === 0 ? (
                <div className="py-10 text-center">
                  <Receipt size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No transactions {tab !== 'all' ? `in ${tab}` : 'yet'}</p>
                  <p className="text-xs text-gray-400 mt-1">Log your first income or expense above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sorted.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 transition-colors group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-green-mint/40 text-green-primary' : 'bg-red-50 text-red-500'}`}>
                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">{t.description}</p>
                        <p className="text-[11px] text-gray-400">{t.category} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${t.type === 'income' ? 'text-green-primary' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                      </span>
                      <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* ── Right: Recurring + Breakdown ── */}
        <div className="flex flex-col gap-6">
          {/* Monthly income & bills */}
          <Reveal y={15} duration={0.4}>
            <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Repeat size={16} className="text-green-primary" />
                  <h3 className="text-base font-semibold text-navy-900">Monthly Income & Bills</h3>
                </div>
                <button
                  onClick={() => setShowRecurringModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-green-mint/40 text-green-dark text-xs font-semibold hover:bg-green-mint transition-all"
                >
                  <Plus size={13} />
                  Add
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">Set your fixed monthly setup — salary in, bills out.</p>

              {recurring.length === 0 ? (
                <div className="py-6 text-center">
                  <Repeat size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recurring items yet</p>
                  <p className="text-xs text-gray-400 mt-1">e.g. DORY salary, internet bill, rent</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recurring.map((r) => (
                    <div key={r.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors group ${r.active ? 'hover:bg-brand-50' : 'opacity-50'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.type === 'income' ? 'bg-green-mint/40 text-green-primary' : 'bg-red-50 text-red-500'}`}>
                        {r.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">{r.title}</p>
                        <p className="text-[10px] text-gray-400">{r.type === 'income' ? 'Monthly income' : 'Bill'} · {r.category}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${r.type === 'income' ? 'text-green-primary' : 'text-red-500'}`}>
                        {r.type === 'income' ? '+' : '−'}{fmt(r.amount)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => logRecurring(r)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-primary hover:bg-green-mint/40 transition-all"
                          title="Log as this month's transaction"
                        >
                          <CalendarPlus size={14} />
                        </button>
                        <button
                          onClick={() => updateRecurring(r.id, { active: !r.active })}
                          className={`p-1.5 rounded-lg transition-all ${r.active ? 'text-gray-400 hover:text-amber-500' : 'text-gray-300 hover:text-green-primary'}`}
                          title={r.active ? 'Pause' : 'Resume'}
                        >
                          <Repeat size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Remove "${r.title}" from monthly setup?`)) deleteRecurring(r.id); }}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recurring.length > 0 && (
                <div className="mt-4 pt-3 border-t border-brand-100">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-green-mint/30">
                      <p className="text-[10px] text-gray-500 font-medium">Monthly In</p>
                      <p className="text-sm font-bold text-green-primary">{fmt(recurringIncome)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-50">
                      <p className="text-[10px] text-gray-500 font-medium">Monthly Bills</p>
                      <p className="text-sm font-bold text-red-500">{fmt(recurringBills)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-brand-50">
                      <p className="text-[10px] text-gray-500 font-medium">Left Over</p>
                      <p className={`text-sm font-bold ${recurringNet >= 0 ? 'text-green-primary' : 'text-red-500'}`}>{fmt(recurringNet)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Expense breakdown */}
          <Reveal y={15} duration={0.4}>
            <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
              <div className="flex items-center gap-2 mb-5">
                <Receipt size={16} className="text-red-500" />
                <h3 className="text-base font-semibold text-navy-900">Expense Breakdown</h3>
              </div>
              {expenseBreakdown.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No expenses logged yet</p>
              ) : (
                <div className="space-y-4">
                  {expenseBreakdown.slice(0, 6).map(([cat, amt]) => {
                    const pct = stats.totalExpense > 0 ? (amt / stats.totalExpense) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-gray-600">{cat}</span>
                          <span className="font-semibold text-navy-900">{fmt(amt)}</span>
                        </div>
                        <div className="h-2 bg-brand-50 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>

          {/* Savings mini card */}
          <Reveal y={15} duration={0.4}>
            <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank size={16} className="text-green-primary" />
                <h3 className="text-base font-semibold text-navy-900">Savings Goals</h3>
              </div>
              <p className="text-2xl font-bold text-navy-900">
                <PrivateText>{fmt(totalAccounts)}</PrivateText>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Money in all accounts — your buying power</p>
              <button
                onClick={() => navigate('/savings')}
                className="mt-4 w-full py-2.5 rounded-xl bg-green-mint/40 text-green-dark text-sm font-semibold hover:bg-green-mint transition-colors"
              >
                Go to Savings Goal
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Add Transaction Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetModal(); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[22px] p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-navy-900">
                  {type === 'income' ? 'Add Income' : 'Add Expense'}
                </h2>
                <button onClick={() => { setShowModal(false); resetModal(); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Type toggle */}
              <div className="flex items-center gap-1 bg-brand-50 rounded-full p-1 mb-5">
                {(['income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setCategory(''); }}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all capitalize ${type === t ? (t === 'income' ? 'bg-green-primary text-white shadow-sm' : 'bg-red-500 text-white shadow-sm') : 'text-gray-500 hover:text-navy-900'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Amount (₱)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 2500"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {catList.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === c ? 'bg-green-primary text-white' : 'bg-brand-50 text-gray-500 hover:bg-brand-100'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={type === 'income' ? 'e.g. DORY salary' : 'e.g. Load for client meeting'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); resetModal(); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${type === 'income' ? 'bg-green-primary hover:bg-green-dark' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Save {type}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Account Modal ── */}
      <AnimatePresence>
        {showAccountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAccountModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[22px] p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-navy-900">Add Account</h2>
                <button onClick={() => setShowAccountModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Account Name</label>
                  <input
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="e.g. BPI, GCash, Cash"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Current Balance (₱)</label>
                  <input
                    type="number"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCOUNT_ICON_OPTIONS.map((ic) => {
                      const meta = ACCOUNT_ICONS[ic];
                      const Icon = meta.Icon;
                      return (
                        <button
                          key={ic}
                          onClick={() => setAccIcon(ic)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${accIcon === ic ? 'bg-green-primary text-white' : 'bg-brand-50 text-gray-500 hover:bg-brand-100'}`}
                        >
                          <Icon size={13} />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAccount}
                  disabled={!accName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-green-primary text-white text-sm font-medium hover:bg-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Recurring Modal ── */}
      <AnimatePresence>
        {showRecurringModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowRecurringModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[22px] p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-navy-900">Add Monthly Item</h2>
                <button onClick={() => setShowRecurringModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Type toggle */}
              <div className="flex items-center gap-1 bg-brand-50 rounded-full p-1 mb-5">
                {(['income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setRecType(t); setRecCategory(''); }}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all capitalize ${recType === t ? (t === 'income' ? 'bg-green-primary text-white shadow-sm' : 'bg-red-500 text-white shadow-sm') : 'text-gray-500 hover:text-navy-900'}`}
                  >
                    {t === 'income' ? 'Income' : 'Bill'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={recTitle}
                    onChange={(e) => setRecTitle(e.target.value)}
                    placeholder={recType === 'income' ? 'e.g. DORY salary' : 'e.g. Internet bill'}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Amount (₱ / month)</label>
                  <input
                    type="number"
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {recCatList.map((c) => (
                      <button
                        key={c}
                        onClick={() => setRecCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${recCategory === c ? 'bg-green-primary text-white' : 'bg-brand-50 text-gray-500 hover:bg-brand-100'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRecurringModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRecurring}
                  disabled={!recTitle.trim() || !recAmount || parseFloat(recAmount) <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-green-primary text-white text-sm font-medium hover:bg-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add to Setup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
