import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowUpRight } from 'lucide-react';
import { useMatieeStore } from '../../store/matieeStore';
import { Card, CardHeader } from '../../ui/Card';
import { Bar } from '../../ui/Progress';
import { Badge } from '../../ui/Badge';
import { EmptyState } from '../../ui/EmptyState';
import { LinkButton } from '../../ui/Button';
import PrivateText from '../../components/PrivateText';
import { R } from '../../routes';
import { daysUntil } from '../../lib/format';

export function Deadlines() {
  const projects = useMatieeStore((s) => s.projects);
  const clients = useMatieeStore((s) => s.clients);

  const rows = useMemo(
    () =>
      projects
        .filter((p) => p.status !== 'completed' && p.deadline)
        .map((p) => ({ p, days: daysUntil(p.deadline) as number, client: clients.find((c) => c.id === p.clientId)?.name ?? '' }))
        .sort((a, b) => a.days - b.days)
        .slice(0, 5),
    [projects, clients],
  );

  return (
    <Card bezel spotlight pad="md">
      <CardHeader
        title="Deadlines"
        description="What's due next"
        action={
          <Link to={R.projects} aria-label="Open projects" className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.05] text-ink-2 transition-[background-color,transform] duration-300 ease-matie hover:bg-brand-600 hover:text-white active:scale-90">
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          compact
          icon={CalendarClock}
          title="No deadlines ahead"
          description="Set a deadline on a project and it lands on this timeline."
          action={<LinkButton to={`${R.projects}?new=1`} variant="soft" size="sm">New project</LinkButton>}
        />
      ) : (
        <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[19px] before:top-3 before:w-px before:bg-ink/10">
          {rows.map(({ p, days, client }) => {
            const overdue = days < 0;
            const soon = days >= 0 && days <= 3;
            return (
              <li key={p.id}>
                <Link to={R.client(p.clientId)} className="group relative flex items-start gap-3 rounded-2xl p-2 transition-colors duration-300 hover:bg-ink/[0.04]">
                  <span className={`relative z-10 mt-1.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-paper ring-4 ring-paper`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${overdue ? 'bg-danger-500' : soon ? 'bg-warn-500' : 'bg-brand-500'}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                      <Badge tone={overdue ? 'danger' : soon ? 'warn' : 'neutral'}>
                        {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                      </Badge>
                    </span>
                    {client && <span className="block truncate text-xs text-mute"><PrivateText type="name">{client}</PrivateText></span>}
                    <Bar value={p.progress} height={4} className="mt-2" tone={overdue ? 'danger' : 'brand'} label={`${p.name} progress`} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
