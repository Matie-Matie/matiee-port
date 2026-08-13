import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, Wallet, CalendarCheck, Trophy } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import Reveal from '../components/Reveal';
import PrivateText from '../components/PrivateText';
import { ATTENDANCE_RATE_FACTOR } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#1C6F45', '#74D4A3', '#E8A838', '#F87171', '#60A5FA', '#A78BFA', '#F472B6', '#94A3B8'];

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Insights() {
  const transactions = useMatieeStore((s) => s.transactions);
  const attendance = useMatieeStore((s) => s.attendance);
  const dailyRate = useMatieeStore((s) => s.dailyRate);
  const projects = useMatieeStore((s) => s.projects);
  const payments = useMatieeStore((s) => s.payments);
  const clients = useMatieeStore((s) => s.clients);

  const [range, setRange] = useState(6);

  // ── Monthly cashflow (income vs expense) ──
  const cashflow = useMemo(() => {
    const months: { label: string; Income: number; Expense: number }[] = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const income = transactions.filter((t) => t.type === 'income' && t.date.slice(0, 7) === key).reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter((t) => t.type === 'expense' && t.date.slice(0, 7) === key).reduce((s, t) => s + t.amount, 0);
      months.push({ label: MONTHS[d.getMonth()], Income: income, Expense: expense });
    }
    return months;
  }, [transactions, range]);

  // ── Expense by category (all time) ──
  const expensePie = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [transactions]);

  // ── Attendance per month (last `range` months) ──
  const attendanceByMonth = useMemo(() => {
    const months: { label: string; Worked: number; Earned: number }[] = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const worked = attendance
        .filter((a) => a.date.slice(0, 7) === key)
        .reduce((s, a) => s + ATTENDANCE_RATE_FACTOR[a.status], 0);
      months.push({ label: MONTHS[d.getMonth()], Worked: worked, Earned: Math.round(worked * dailyRate) });
    }
    return months;
  }, [attendance, range, dailyRate]);

  // ── Top clients by total fee ──
  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => {
      const client = clients.find((c) => c.id === p.clientId);
      const name = client?.name || 'Unknown';
      map.set(name, (map.get(name) || 0) + p.fee);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [projects, clients]);

  // ── Project payments over time ──
  const paymentTrend = useMemo(() => {
    const months: { label: string; Payments: number }[] = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const sum = payments.filter((p) => p.date && p.date.slice(0, 7) === key).reduce((s, p) => s + p.amount, 0);
      months.push({ label: MONTHS[d.getMonth()], Payments: sum });
    }
    return months;
  }, [payments, range]);

  const totalEarned = attendance.reduce((s, a) => s + ATTENDANCE_RATE_FACTOR[a.status] * dailyRate, 0);
  const totalWorked = attendance.reduce((s, a) => s + ATTENDANCE_RATE_FACTOR[a.status], 0);
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

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
          <h1 className="text-[32px] md:text-[46px] font-bold text-navy-900 leading-none tracking-tight">Insights</h1>
          <p className="text-sm text-gray-500 mt-2">See the patterns — money, work days, and clients.</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm">
          {[3, 6, 12].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${range === r ? 'bg-green-primary text-white' : 'text-gray-500 hover:text-navy-900'}`}
            >
              {r} mo
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Top Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-[22px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-mint/40 flex items-center justify-center">
              <CalendarCheck size={16} className="text-green-primary" />
            </div>
            <p className="text-sm text-gray-500">Total Work Days</p>
          </div>
          <p className="text-2xl font-bold text-navy-900">{Math.floor(totalWorked)}<span className="text-sm font-normal text-gray-400 ml-1">days</span></p>
          <p className="text-[11px] text-gray-400 mt-1">≈ {fmt(totalEarned)} earned</p>
        </div>
        <div className="bg-white rounded-[22px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-mint/40 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-primary" />
            </div>
            <p className="text-sm text-gray-500">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-navy-900"><PrivateText>{fmt(totalIncome)}</PrivateText></p>
        </div>
        <div className="bg-white rounded-[22px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Wallet size={16} className="text-red-500" />
            </div>
            <p className="text-sm text-gray-500">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-navy-900"><PrivateText>{fmt(totalExpense)}</PrivateText></p>
        </div>
        <div className="bg-white rounded-[22px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Trophy size={16} className="text-amber-500" />
            </div>
            <p className="text-sm text-gray-500">Top Client</p>
          </div>
          <p className="text-2xl font-bold text-navy-900 truncate">{topClients[0]?.name || '—'}</p>
          {topClients[0] && <p className="text-[11px] text-gray-400 mt-1">{fmt(topClients[0].value)} in projects</p>}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow chart */}
        <Reveal y={15} duration={0.4}>
          <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
            <h3 className="text-base font-semibold text-navy-900 mb-5">Cash Flow — Income vs Expenses</h3>
            {cashflow.some((d) => d.Income > 0 || d.Expense > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflow} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A8A8A' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#B0B0B0' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : String(v)} />
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 14, border: '1px solid #ECECEC', fontSize: 12, fontFamily: 'Poppins' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Income" fill="#1C6F45" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Expense" fill="#F87171" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart label="Log income and expenses to see trends" />
            )}
          </div>
        </Reveal>

        {/* Expense pie */}
        <Reveal y={15} duration={0.4}>
          <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
            <h3 className="text-base font-semibold text-navy-900 mb-5">Expenses by Category</h3>
            {expensePie.length > 0 ? (
              <div className="h-64 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expensePie} dataKey="value" nameKey="name" cx="45%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {expensePie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 14, border: '1px solid #ECECEC', fontSize: 12, fontFamily: 'Poppins' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {expensePie.slice(0, 5).map((e, i) => (
                    <div key={e.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-500 flex-1 truncate">{e.name}</span>
                      <span className="font-semibold text-navy-900">{fmt(e.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart label="No expenses logged yet" />
            )}
          </div>
        </Reveal>

        {/* Attendance chart */}
        <Reveal y={15} duration={0.4}>
          <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
            <h3 className="text-base font-semibold text-navy-900 mb-5">Work Days per Month</h3>
            {attendanceByMonth.some((d) => d.Worked > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A8A8A' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#B0B0B0' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip formatter={(v, name) => (name === 'Earned' ? fmt(Number(v)) : `${v} days`)} contentStyle={{ borderRadius: 14, border: '1px solid #ECECEC', fontSize: 12, fontFamily: 'Poppins' }} />
                    <Line type="monotone" dataKey="Worked" stroke="#1C6F45" strokeWidth={2.5} dot={{ r: 4, fill: '#1C6F45' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart label="Mark your attendance to see the trend" />
            )}
          </div>
        </Reveal>

        {/* Project payment trend */}
        <Reveal y={15} duration={0.4}>
          <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
            <h3 className="text-base font-semibold text-navy-900 mb-5">Project Payments Received</h3>
            {paymentTrend.some((d) => d.Payments > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A8A8A' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#B0B0B0' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : String(v)} />
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 14, border: '1px solid #ECECEC', fontSize: 12, fontFamily: 'Poppins' }} />
                    <Bar dataKey="Payments" fill="#E8A838" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart label="Project payments will show here" />
            )}
          </div>
        </Reveal>

        {/* Top clients */}
        <Reveal y={15} duration={0.4}>
          <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
            <h3 className="text-base font-semibold text-navy-900 mb-5">Top Clients by Project Value</h3>
            {topClients.length > 0 ? (
              <div className="space-y-4">
                {topClients.map((c, i) => {
                  const max = topClients[0]?.value || 1;
                  const pct = (c.value / max) * 100;
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-gray-600">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-gray-500'}`}>{i + 1}</span>
                          {c.name}
                        </span>
                        <span className="font-semibold text-navy-900">{fmt(c.value)}</span>
                      </div>
                      <div className="h-2 bg-brand-50 rounded-full overflow-hidden ml-8">
                        <div className="h-full bg-gradient-to-r from-green-mint to-green-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyChart label="Add clients and projects to see rankings" />
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center">
      <TrendingUp size={32} className="text-gray-300 mb-3" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
