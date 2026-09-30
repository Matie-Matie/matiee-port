import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMatieeStore } from '../../store/matieeStore';
import { Card, CardHeader } from '../../ui/Card';
import { Money } from '../../ui/Money';
import { EmptyState } from '../../ui/EmptyState';
import { LinkButton } from '../../ui/Button';
import { R } from '../../routes';
import { EASE } from '../../lib/motion';
import { cn } from '../../lib/cn';
import { peso } from '../../lib/format';

interface Month {
  key: string;
  label: string;
  income: number;
  expense: number;
}

function lastSixMonths(): Month[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      income: 0,
      expense: 0,
    };
  });
}

export function CashFlow() {
  const transactions = useMatieeStore((s) => s.transactions);
  const privacy = useMatieeStore((s) => s.privacyMode);
  const months = useMemo(() => {
    const base = lastSixMonths();
    for (const t of transactions) {
      const m = base.find((x) => t.date.startsWith(x.key));
      if (!m) continue;
      if (t.type === 'income') m.income += t.amount;
      else m.expense += t.amount;
    }
    return base;
  }, [transactions]);

  const [hover, setHover] = useState<number | null>(null);
  const sel = months[hover ?? months.length - 1];
  const max = Math.max(...months.flatMap((m) => [m.income, m.expense]), 1);
  const hasData = months.some((m) => m.income || m.expense);
  const net = sel.income - sel.expense;

  return (
    <Card bezel spotlight pad="md" coreClassName="flex flex-col">
      <CardHeader
        title="Cash flow"
        description="Income vs expenses, last 6 months"
        action={
          <Link to={R.money} aria-label="Open Money Hub" className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.05] text-ink-2 transition-[background-color,transform] duration-300 ease-matie hover:bg-brand-600 hover:text-white active:scale-90">
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </Link>
        }
      />
      {!hasData ? (
        <EmptyState
          compact
          icon={Wallet}
          title="No transactions yet"
          description="Log income and expenses in Money Hub and your monthly cash flow shows up here."
          action={<LinkButton to={`${R.money}?new=1`} variant="soft" size="sm">Log a transaction</LinkButton>}
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end gap-x-8 gap-y-3" aria-live="polite">
            <div>
              <p className="text-xs text-mute">{sel.label} net</p>
              <p className={cn('text-[28px] font-semibold leading-none tracking-[-0.04em]', net < 0 ? 'text-clay-600' : 'text-ink')}>
                <Money value={net} />
              </p>
            </div>
            <div className="flex gap-6 text-[13px]">
              <div>
                <p className="flex items-center gap-1.5 text-mute"><span className="h-2 w-2 rounded-full bg-brand-600" />Income</p>
                <p className="font-semibold tabular-nums text-ink"><Money value={sel.income} /></p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-mute"><span className="h-2 w-2 rounded-full bg-clay-500/80" />Expenses</p>
                <p className="font-semibold tabular-nums text-ink"><Money value={sel.expense} /></p>
              </div>
            </div>
          </div>

          <div className="grid min-h-[168px] flex-1 grid-cols-6 gap-2 sm:gap-3" onMouseLeave={() => setHover(null)}>
            {months.map((m, i) => {
              const active = (hover ?? months.length - 1) === i;
              return (
                <button
                  key={m.key}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={privacy ? m.label : `${m.label}: income ${peso(m.income)}, expenses ${peso(m.expense)}`}
                  className="group flex flex-col items-stretch rounded-2xl outline-offset-2"
                >
                  <div className={cn('relative flex-1 rounded-2xl transition-colors duration-300', active ? 'bg-brand-50' : 'bg-transparent')}>
                    <div className="absolute inset-x-1.5 bottom-0 top-3 flex items-end justify-center gap-1">
                    <motion.span
                      className="w-full max-w-[18px] origin-bottom rounded-t-[7px] bg-brand-600"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 }}
                      style={{ height: `${Math.max((m.income / max) * 100, m.income ? 4 : 1.5)}%`, opacity: m.income ? 1 : 0.18 }}
                    />
                    <motion.span
                      className="w-full max-w-[18px] origin-bottom rounded-t-[7px] bg-clay-500/70"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 + 0.06 }}
                      style={{ height: `${Math.max((m.expense / max) * 100, m.expense ? 4 : 1.5)}%`, opacity: m.expense ? 1 : 0.18 }}
                    />
                    </div>
                  </div>
                  <span className={cn('mt-2 text-center text-[11px] font-medium transition-colors', active ? 'text-brand-700' : 'text-mute')}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
