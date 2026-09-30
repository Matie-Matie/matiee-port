import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DatabaseBackup, ShieldCheck } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { downloadBackup, getLastBackup } from '../lib/backup';
import { timeAgo } from '../lib/format';
import { R } from '../routes';
import { cn } from '../lib/cn';
import { spring } from '../lib/motion';
import { Brand } from './Brand';
import { NAV_GROUPS, isActivePath } from './nav';

/** Shared by the desktop rail and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const clientCount = useMatieeStore((s) => s.clients.length);
  const activeProjects = useMatieeStore((s) => s.projects.filter((p) => p.status === 'in-progress' || p.status === 'pending').length);
  const hasData = useMatieeStore((s) => s.clients.length + s.projects.length + s.transactions.length + s.attendance.length > 0);

  const [last, setLast] = useState<number | null>(() => getLastBackup());
  const stale = hasData && (last === null || Date.now() - last > 14 * 86_400_000);

  const counts: Record<string, number> = { clients: clientCount, projects: activeProjects };

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pb-5 pt-1">
        <Brand onClick={onNavigate} />
      </div>

      <nav aria-label="Primary" className="-mx-1 flex-1 overflow-y-auto px-1 hide-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">{group.title}</p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActivePath(item.path, pathname);
                const Icon = item.icon;
                const count = counts[item.key];
                return (
                  <li key={item.key}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors duration-300',
                        active ? 'text-brand-800' : 'text-mute hover:text-ink',
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="nav-pill"
                          transition={spring.snappy}
                          className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-600/10"
                        />
                      ) : (
                        <span className="absolute inset-0 rounded-xl bg-ink/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      )}
                      <Icon
                        size={18}
                        strokeWidth={1.6}
                        className={cn('relative shrink-0 transition-transform duration-500 ease-matie group-hover:scale-110', active && 'text-brand-600')}
                      />
                      <span className="relative truncate">{item.label}</span>
                      {count > 0 && (
                        <span
                          className={cn(
                            'relative ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                            active ? 'bg-brand-600 text-white' : 'bg-ink/[0.06] text-mute',
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-3">
        <div className={cn('rounded-2xl p-3 ring-1', stale ? 'bg-warn-100/70 ring-warn-500/20' : 'bg-brand-50/70 ring-brand-600/10')}>
          <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
            <ShieldCheck size={15} strokeWidth={1.75} className={stale ? 'text-warn-700' : 'text-brand-600'} />
            Local vault
            <button
              type="button"
              onClick={() => {
                downloadBackup();
                setLast(Date.now());
              }}
              className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-full bg-paper px-2.5 text-[11px] font-medium text-ink shadow-hair ring-1 ring-ink/10 transition-[transform,box-shadow] duration-300 ease-matie hover:ring-ink/25 active:scale-95"
            >
              <DatabaseBackup size={13} strokeWidth={1.75} />
              Back up
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-mute">
            {last ? `Last backup ${timeAgo(last)}.` : hasData ? 'Never backed up.' : 'Data stays on this device.'}
            {stale && ' Back up before clearing browser data.'}
          </p>
        </div>
        <Link to={R.welcome} onClick={onNavigate} className="mt-2.5 block px-1 text-[11px] text-mute underline-offset-2 transition-colors hover:text-ink hover:underline">
          About Matie Port
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed bottom-4 left-4 top-4 z-30 hidden w-[248px] lg:block" aria-label="Sidebar">
      <div className="h-full rounded-[28px] bg-ink/[0.035] p-1.5 ring-1 ring-ink/[0.06]">
        <div className="h-full rounded-[22px] bg-paper p-4 shadow-soft ring-1 ring-ink/[0.06]">
          <SidebarContent />
        </div>
      </div>
    </aside>
  );
}
