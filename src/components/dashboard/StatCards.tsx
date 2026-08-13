import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardsProps {
  total: number;
  ended: number;
  totalIncome: number;
  pending: number;
}

const GRADIENTS = [
  'bg-gradient-to-br from-green-primary to-green-dark text-white',
  'bg-gradient-to-br from-green-dark to-green-primary text-white',
  'bg-gradient-to-br from-green-mint to-green-light text-navy-900',
  'bg-white text-navy-900 ring-1 ring-brand-100',
];

const LABELS = ['Total Projects', 'Ended Projects', 'Total Income', 'Pending'];

function formatIncome(n: number) {
  if (n >= 1_000_000) return '₱' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '₱' + (n / 1_000).toFixed(1) + 'K';
  return '₱' + n.toLocaleString();
}

export default function StatCards({ total, ended, totalIncome, pending }: StatCardsProps) {
  const values: (number | string)[] = [total, ended, totalIncome, pending];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {values.map((value, i) => {
        const isWhite = i === 3;
        const isIncome = i === 2;
        return (
          <motion.div
            key={LABELS[i]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4, ease: 'easeOut' }}
            className={`relative flex flex-col justify-between p-6 rounded-[22px] h-[170px] ${GRADIENTS[i]} ${isWhite ? 'shadow-card' : 'shadow-lg'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium tracking-wide ${isWhite ? 'text-gray-500' : 'text-white/80'}`}>
                {LABELS[i]}
              </span>
              <button className={`w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-105 ${isWhite ? 'bg-gray-100 text-gray-500' : 'bg-white/20 text-white'}`}>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {isIncome ? (
              <div>
                <span className={`text-[32px] font-bold leading-none tracking-tight ${isWhite ? 'text-navy-900' : 'text-white'}`}>
                  {formatIncome(value as number)}
                </span>
              </div>
            ) : (
              <span className={`text-[40px] font-bold leading-none tracking-tight ${isWhite ? 'text-navy-900' : 'text-white'}`}>
                {value}
              </span>
            )}

            {i === 1 && (
              <span className="text-[11px] text-white/70">
                Completed
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
