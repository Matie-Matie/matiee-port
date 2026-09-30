import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlarmClock, Bell, BellRing, CircleAlert, CheckCheck } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { daysUntil, fmtDate } from '../lib/format';
import { R } from '../routes';
import { IconButton } from '../ui/Button';
import { Popover } from '../ui/Popover';
import PrivateText from '../components/PrivateText';
import { cn } from '../lib/cn';

interface Alert {
  id: string;
  projectName: string;
  clientId: string;
  clientName: string;
  kind: 'overdue' | 'soon' | 'reminder';
  when: string;
  days: number | null;
}

/** Real alerts: overdue, due within 7 days, or bell-flagged projects. */
function useAlerts(): Alert[] {
  const projects = useMatieeStore((s) => s.projects);
  const clients = useMatieeStore((s) => s.clients);
  return useMemo(() => {
    const out: Alert[] = [];
    for (const p of projects) {
      if (p.status === 'completed') continue;
      const d = daysUntil(p.deadline);
      const clientName = clients.find((c) => c.id === p.clientId)?.name ?? 'Unknown client';
      const base = { id: p.id, projectName: p.name, clientId: p.clientId, clientName, days: d };
      if (d !== null && d < 0) out.push({ ...base, kind: 'overdue', when: `${Math.abs(d)}d overdue` });
      else if (d !== null && d <= 7) out.push({ ...base, kind: 'soon', when: d === 0 ? 'Due today' : d === 1 ? 'Due tomorrow' : `Due ${fmtDate(p.deadline)}` });
      else if (p.reminder) out.push({ ...base, kind: 'reminder', when: p.deadline ? `Due ${fmtDate(p.deadline)}` : 'Reminder set' });
    }
    const rank = { overdue: 0, soon: 1, reminder: 2 } as const;
    return out.sort((a, b) => rank[a.kind] - rank[b.kind] || (a.days ?? 999) - (b.days ?? 999));
  }, [projects, clients]);
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const alerts = useAlerts();
  const urgent = alerts.filter((a) => a.kind !== 'reminder').length;

  return (
    <div className="relative">
      <IconButton label={alerts.length ? `Notifications, ${alerts.length} items` : 'Notifications'} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog" className="relative">
        <Bell size={17} strokeWidth={1.5} />
        {alerts.length > 0 && (
          <span className={cn('absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-paper', urgent ? 'bg-clay-500' : 'bg-warn-500')} />
        )}
      </IconButton>

      <Popover open={open} onClose={() => setOpen(false)} className="w-[min(92vw,360px)]" label="Notifications">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h3 className="text-sm font-semibold tracking-tight text-ink">Needs attention</h3>
          {alerts.length > 0 && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] font-medium tabular-nums text-mute">{alerts.length}</span>}
        </div>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center px-6 pb-8 pt-4 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><CheckCheck size={20} strokeWidth={1.5} /></span>
            <p className="text-sm font-medium text-ink">You're all caught up</p>
            <p className="mt-1 text-xs leading-relaxed text-mute">Overdue and upcoming deadlines, plus projects you flagged with the bell, show up here.</p>
          </div>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto px-1.5 pb-1.5">
            {alerts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate(R.client(a.clientId)); }}
                  className="flex w-full items-start gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors hover:bg-ink/[0.04]"
                >
                  <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', a.kind === 'overdue' ? 'bg-danger-100 text-danger-700' : a.kind === 'soon' ? 'bg-warn-100 text-warn-700' : 'bg-brand-50 text-brand-600')}>
                    {a.kind === 'overdue' ? <CircleAlert size={16} strokeWidth={1.75} /> : a.kind === 'soon' ? <AlarmClock size={16} strokeWidth={1.75} /> : <BellRing size={16} strokeWidth={1.75} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{a.projectName}</span>
                    <span className="block truncate text-[11.5px] text-mute"><PrivateText type="name">{a.clientName}</PrivateText></span>
                  </span>
                  <span className={cn('shrink-0 pt-0.5 text-[11px] font-medium', a.kind === 'overdue' ? 'text-danger-700' : a.kind === 'soon' ? 'text-warn-700' : 'text-mute')}>{a.when}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Popover>
    </div>
  );
}
