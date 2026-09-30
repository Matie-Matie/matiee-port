import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { Card, CardHeader } from '../../ui/Card';
import { Ring } from '../../ui/Progress';
import { AnimatedNumber } from '../../ui/AnimatedNumber';
import { R } from '../../routes';
import { daysUntil } from '../../lib/format';
import type { Project } from '../../types';

export function Pulse({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const avg = total ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / total) : 0;
  const inProgress = projects.filter((p) => p.status === 'in-progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const pending = projects.filter((p) => p.status === 'pending' || p.status === 'on-hold').length;

  const rows = [
    { label: 'In progress', value: inProgress, dot: 'bg-brand-500' },
    { label: 'Completed', value: completed, dot: 'bg-brand-800' },
    { label: 'Pending', value: pending, dot: 'bg-warn-500' },
  ];

  const next = projects
    .filter((p) => p.status !== 'completed' && p.deadline)
    .map((p) => ({ p, days: daysUntil(p.deadline) as number }))
    .sort((a, b) => a.days - b.days)[0];

  return (
    <Card bezel spotlight pad="md" coreClassName="flex flex-col">
      <CardHeader
        title="Project pulse"
        description={`${total} project${total === 1 ? '' : 's'} in the vault`}
        action={
          <Link to={R.projects} aria-label="Open projects" className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.05] text-ink-2 transition-[background-color,transform] duration-300 ease-matie hover:bg-brand-600 hover:text-white active:scale-90">
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </Link>
        }
      />
      <div className="flex items-center gap-4">
        <Ring value={avg} size={108} stroke={10}>
          <span className="text-[24px] font-semibold leading-none tracking-[-0.04em] text-ink">
            <AnimatedNumber value={avg} />
            <span className="text-base text-mute">%</span>
          </span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-mute">avg</span>
        </Ring>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="flex min-w-0 items-center gap-2 text-mute">
                <span className={`h-2 w-2 shrink-0 rounded-full ${r.dot}`} />
                <span className="truncate">{r.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-ink">{r.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {total > 0 && (
        <div className="mt-auto pt-6">
          <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full" role="img" aria-label="Project status split">
            {rows.map((r) => (r.value ? <span key={r.label} className={`h-full rounded-full ${r.dot}`} style={{ flex: r.value }} /> : null))}
          </div>
          {next && (
            <Link to={R.client(next.p.clientId)} className="mt-4 flex items-center gap-3 rounded-2xl bg-paper-2 p-3 ring-1 ring-ink/[0.06] transition-colors hover:bg-brand-50">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-brand-600 shadow-hair"><CalendarClock size={16} strokeWidth={1.6} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-mute">Next deadline</span>
                <span className="block truncate text-[13px] font-medium text-ink">{next.p.name}</span>
              </span>
              <span className={`shrink-0 text-xs font-semibold ${next.days < 0 ? 'text-danger-700' : 'text-ink-2'}`}>
                {next.days < 0 ? `${Math.abs(next.days)}d late` : next.days === 0 ? 'Today' : `${next.days}d`}
              </span>
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
