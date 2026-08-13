import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  onClick?: () => void;
}

export default function StatCard({ label, value, icon, trend, onClick }: StatCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex flex-col gap-2 p-5 md:p-6 bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-soil-200/40 text-left cursor-pointer transition-all duration-500"
      style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-soil-400">
          {label}
        </span>
        {icon && (
          <span className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-soil-500">
            {icon}
          </span>
        )}
      </div>
      <span className="text-2xl md:text-3xl font-semibold tracking-tight text-soil-900">
        {value}
      </span>
      {trend && (
        <span className={`text-xs font-medium ${trend.positive ? 'text-status-green' : 'text-clay-500'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </motion.button>
  );
}
