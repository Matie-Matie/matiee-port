import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMatieeStore } from '../../store/matieeStore';
import { Card } from '../../ui/Card';
import { Ring } from '../../ui/Progress';
import { R } from '../../routes';
import { cn } from '../../lib/cn';

/** First-run checklist. Disappears once the basics exist. */
export function GetStarted() {
  const hasClients = useMatieeStore((s) => s.clients.length > 0);
  const hasProjects = useMatieeStore((s) => s.projects.length > 0);
  const hasTx = useMatieeStore((s) => s.transactions.length > 0);

  const steps = [
    { done: hasClients, title: 'Add your first client', body: 'Everyone you work with lives here.', to: `${R.clients}?new=1` },
    { done: hasProjects, title: 'Create a project', body: 'Set a fee, a deadline and a downpayment.', to: `${R.projects}?new=1` },
    { done: hasTx, title: 'Log income or an expense', body: 'Build your monthly cash flow.', to: `${R.money}?new=1` },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  const nextIdx = steps.findIndex((s) => !s.done);

  return (
    <Card bezel tone="sand" pad="none" className="mb-4 md:mb-5">
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
        <div className="flex items-center gap-5 md:w-[280px] md:shrink-0">
          <Ring value={(doneCount / steps.length) * 100} size={76} stroke={7}>
            <span className="text-base font-semibold tabular-nums text-ink">{doneCount}/{steps.length}</span>
          </Ring>
          <div>
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-ink">Set up your vault</h2>
            <p className="mt-1 text-[13px] leading-snug text-mute">Three quick steps and the dashboard comes alive.</p>
          </div>
        </div>
        <ul className="grid grid-cols-1 flex-1 gap-2.5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.li key={s.title} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
              <Link
                to={s.to}
                className={cn(
                  'group flex h-full items-start gap-3 rounded-2xl p-4 ring-1 transition-[background-color,box-shadow] duration-300',
                  s.done ? 'bg-brand-50/70 ring-brand-600/15' : i === nextIdx ? 'bg-paper shadow-soft ring-brand-600/30' : 'bg-paper/60 ring-ink/[0.07] hover:bg-paper',
                )}
              >
                <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', s.done ? 'bg-brand-600 text-white' : 'bg-ink/[0.07] text-mute')}>
                  {s.done ? <Check size={13} strokeWidth={2.5} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-[13.5px] font-medium', s.done ? 'text-mute line-through decoration-ink/20' : 'text-ink')}>{s.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-mute">{s.body}</span>
                </span>
                {!s.done && <ArrowRight size={15} strokeWidth={1.75} className="mt-1 shrink-0 text-faint transition-[transform,color] duration-500 ease-matie group-hover:translate-x-1 group-hover:text-brand-600" />}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
