import { Wallet, TrendingUp, PiggyBank, Coins, Star, ShoppingBag, Sparkles } from 'lucide-react';
import PrivateText from '../PrivateText';

function formatPeso(n: number) {
  return '₱' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ── Compact Income Strip ── */

interface IncomeStripProps {
  totalRevenue: number;
  outstanding: number;
  outsideSavings: number;
  downpayments: number;
}

export function IncomeStrip({ totalRevenue, outstanding, outsideSavings, downpayments }: IncomeStripProps) {
  const items = [
    { label: 'Total Revenue', value: totalRevenue, icon: Wallet },
    { label: 'Outstanding', value: outstanding, icon: TrendingUp },
    { label: 'Outside Savings', value: outsideSavings, icon: Coins },
    { label: 'Downpayments', value: downpayments, icon: PiggyBank },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-brand-100 rounded-2xl overflow-hidden shadow-sm">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-white px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-mint/40 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-green-primary" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 leading-tight">{item.label}</p>
              <p className="text-lg font-bold text-navy-900 leading-tight mt-0.5">
                <PrivateText>{formatPeso(item.value)}</PrivateText>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Priority Savings Card ── */

interface PrioritySavingsProps {
  items: { id: string; name: string; price: number; photo?: string; priority: boolean }[];
  totalSaved: number;
}

export function PrioritySavingsCard({ items, totalSaved }: PrioritySavingsProps) {
  const priorityItems = items.filter((i) => i.priority);
  if (priorityItems.length === 0) return null;

  return (
    <div className="bg-white rounded-[22px] p-6 shadow-card">
      <div className="flex items-center gap-2 mb-5">
        <Star size={16} className="text-amber-500" fill="currentColor" />
        <h3 className="text-base font-semibold text-navy-900">Priority Savings</h3>
      </div>
      <div className="space-y-5">
        {priorityItems.slice(0, 5).map((item) => {
          const canBuy = totalSaved >= item.price;
          const progress = Math.min(100, (totalSaved / item.price) * 100);
          return (
            <div key={item.id} className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-gray-100 overflow-hidden flex-shrink-0 ring-1 ring-black/[0.04] shadow-sm">
                {item.photo ? (
                  <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={20} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-navy-900 truncate flex items-center gap-1.5">
                    {item.name}
                    {canBuy && <Sparkles size={13} className="text-green-primary shrink-0" />}
                  </span>
                  <span className={`text-sm font-bold ${canBuy ? 'text-green-primary' : 'text-navy-900'}`}>
                    ₱{item.price.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 bg-brand-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      canBuy ? 'bg-green-primary' : 'bg-amber-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={`text-[11px] mt-1 ${canBuy ? 'text-green-primary font-semibold' : 'text-gray-400'}`}>
                  {canBuy
                    ? 'You can buy this! 🎉'
                    : `₱${(item.price - totalSaved).toLocaleString()} remaining`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
