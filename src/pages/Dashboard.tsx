import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMatieeStore } from '../store/matieeStore';
import { IncomeStrip, PrioritySavingsCard } from '../components/dashboard/IncomeOverview';
import StatCards from '../components/dashboard/StatCards';
import ProjectAnalytics from '../components/dashboard/ProjectAnalytics';
import ReminderCard from '../components/dashboard/ReminderCard';
import ProjectList from '../components/dashboard/ProjectList';
import TeamCollaboration from '../components/dashboard/TeamCollaboration';
import ProjectProgress from '../components/dashboard/ProjectProgress';

export default function Dashboard() {
  const navigate = useNavigate();
  const projects = useMatieeStore((s) => s.projects);
  const wishlist = useMatieeStore((s) => s.wishlist);
  const accounts = useMatieeStore((s) => s.accounts);

  const ended = projects.filter((p) => p.status === 'completed').length;
  const pending = projects.filter((p) => p.status === 'pending' || p.status === 'on-hold').length;
  // Total Revenue = what's been paid (toggle-based, no double counting)
  const totalRevenue = projects.reduce((sum, p) => {
    let rev = 0;
    if (p.downpaymentPaid) rev += p.downpayment;
    if (p.remainingPaid) rev += (p.fee - p.downpayment);
    return sum + rev;
  }, 0);

  // Outstanding = unpaid projects
  const outstanding = projects
    .filter((p) => !p.remainingPaid)
    .reduce((sum, p) => sum + (p.fee - (p.downpaymentPaid ? p.downpayment : 0)), 0);

  const totalAccountBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Total Income = sum of all project fees + money in accounts (total portfolio)
  const totalIncome = projects.reduce((sum, p) => sum + p.fee, 0) + totalAccountBalance;

  // Downpayments collected
  const downpaymentsCollected = projects
    .filter((p) => p.downpayment > 0 && p.downpaymentPaid)
    .reduce((sum, p) => sum + p.downpayment, 0);

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[32px] md:text-[46px] font-bold text-navy-900 leading-none tracking-tight"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-sm text-gray-500 mt-2"
          >
            Plan, prioritize, and accomplish your tasks with ease.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-3 shrink-0"
        >
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 h-12 px-6 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Add Project
          </button>
        </motion.div>
      </div>

      {/* ── Compact Income Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <IncomeStrip
          totalRevenue={totalRevenue}
          outstanding={outstanding}
          outsideSavings={totalAccountBalance}
          downpayments={downpaymentsCollected}
        />
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-6"
      >
        <StatCards total={projects.length} ended={ended} totalIncome={totalIncome} pending={pending} />
      </motion.div>

      {/* ── Middle Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6"
      >
        <div className="lg:col-span-1">
          <ProjectAnalytics />
        </div>
        <ReminderCard />
        <ProjectList />
      </motion.div>

      {/* ── Bottom Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <TeamCollaboration />
        <ProjectProgress />
        <PrioritySavingsCard items={wishlist} totalSaved={totalRevenue + totalAccountBalance} />
      </motion.div>
    </div>
  );
}
