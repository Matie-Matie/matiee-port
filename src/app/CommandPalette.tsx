import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CornerDownLeft,
  DatabaseBackup,
  Eye,
  FilePlus2,
  FolderKanban,
  FileText,
  Plus,
  Search,
  StickyNote,
  UserPlus,
  Users,
  Wallet,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { downloadBackup } from '../lib/backup';
import { R } from '../routes';
import { EASE, spring } from '../lib/motion';
import { cn } from '../lib/cn';
import { Kbd } from '../ui/Kbd';
import { toast } from '../ui/toast';
import PrivateText from '../components/PrivateText';
import { NAV_ITEMS } from './nav';

interface Cmd {
  id: string;
  group: string;
  text: string;
  label: ReactNode;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

const GROUP_ORDER = ['Actions', 'Go to', 'Clients', 'Projects', 'Notes', 'Files'];

function scoreOf(q: string, text: string): number {
  if (!q) return 1;
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  const toks = q.split(/\s+/).filter(Boolean);
  return toks.length > 1 && toks.every((k) => t.includes(k)) ? 1.5 : 0;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const clients = useMatieeStore((s) => s.clients);
  const projects = useMatieeStore((s) => s.projects);
  const notes = useMatieeStore((s) => s.knowledgeNotes);
  const files = useMatieeStore((s) => s.vaultFiles);
  const togglePrivacy = useMatieeStore((s) => s.togglePrivacyMode);
  const setAttendance = useMatieeStore((s) => s.setAttendance);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const commands = useMemo<Cmd[]>(() => {
    const go = (to: string) => () => navigate(to);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const actions: Cmd[] = [
      { id: 'a-project', group: 'Actions', text: 'new project add create', label: 'New project', hint: 'Projects', icon: Plus, run: go(`${R.projects}?new=1`) },
      { id: 'a-client', group: 'Actions', text: 'new client add create person', label: 'New client', hint: 'Clients', icon: UserPlus, run: go(`${R.clients}?new=1`) },
      { id: 'a-tx', group: 'Actions', text: 'log income expense transaction add money', label: 'Log income or expense', hint: 'Money Hub', icon: Wallet, run: go(`${R.money}?new=1`) },
      {
        id: 'a-today',
        group: 'Actions',
        text: 'mark today worked attendance present',
        label: 'Mark today as worked',
        hint: 'Attendance',
        icon: CalendarCheck,
        run: () => {
          setAttendance(todayStr, 'worked');
          toast('Marked today as worked', 'success');
        },
      },
      { id: 'a-privacy', group: 'Actions', text: 'toggle privacy hide show amounts mode', label: 'Toggle privacy mode', hint: 'Hide amounts and names', icon: Eye, run: () => { togglePrivacy(); } },
      {
        id: 'a-backup',
        group: 'Actions',
        text: 'export backup download save',
        label: 'Export backup',
        hint: 'Download JSON',
        icon: DatabaseBackup,
        run: () => {
          downloadBackup();
          toast('Backup downloaded', 'success');
        },
      },
    ];

    const nav: Cmd[] = NAV_ITEMS.map((n) => ({ id: `n-${n.key}`, group: 'Go to', text: `${n.label} ${n.keywords}`, label: n.label, icon: n.icon, run: go(n.path) }));

    const cl: Cmd[] = clients.map((c) => ({
      id: `c-${c.id}`, group: 'Clients', text: `${c.name} ${c.email} ${c.contact}`,
      label: <PrivateText type="name">{c.name}</PrivateText>, hint: 'Client', icon: Users, run: go(R.client(c.id)),
    }));

    const pr: Cmd[] = projects.map((p) => {
      const cn_ = clients.find((c) => c.id === p.clientId)?.name ?? '';
      return { id: `p-${p.id}`, group: 'Projects', text: `${p.name} ${cn_}`, label: p.name, hint: cn_ ? 'Project' : undefined, icon: FolderKanban, run: go(R.client(p.clientId)) };
    });

    const nt: Cmd[] = notes.map((n) => ({ id: `k-${n.id}`, group: 'Notes', text: `${n.title} ${n.tags.join(' ')} ${n.category}`, label: n.title, hint: 'Knowledge', icon: StickyNote, run: go(R.knowledge) }));

    const fl: Cmd[] = files.map((f) => ({ id: `f-${f.id}`, group: 'Files', text: `${f.name} ${f.category}`, label: f.name, hint: 'File', icon: FileText, run: go(R.files) }));

    return [...actions, ...nav, ...cl, ...pr, ...nt, ...fl];
  }, [navigate, clients, projects, notes, files, togglePrivacy, setAttendance]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scored = commands
      .map((c) => ({ c, s: scoreOf(q, c.text + ' ' + c.group) }))
      .filter((x) => x.s > 0);
    // Empty query: only actions + navigation, so it stays a launcher.
    const pool = q ? scored : scored.filter((x) => x.c.group === 'Actions' || x.c.group === 'Go to');
    const grouped: Cmd[] = [];
    for (const g of GROUP_ORDER) {
      const items = pool.filter((x) => x.c.group === g).sort((a, b) => b.s - a.s).slice(0, q ? 5 : 20);
      grouped.push(...items.map((x) => x.c));
    }
    return grouped;
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function run(cmd: Cmd | undefined) {
    if (!cmd) return;
    onClose();
    // Let the overlay start closing before we navigate.
    setTimeout(cmd.run, 30);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }

  let lastGroup = '';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[65] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-ink/35 backdrop-blur-[6px]" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative w-full max-w-[620px] rounded-[28px] bg-white/60 p-1.5 shadow-pop ring-1 ring-white/50 backdrop-blur-xl"
          >
            <div className="overflow-hidden rounded-[22px] bg-paper ring-1 ring-ink/[0.06]">
              <div className="flex items-center gap-3 border-b border-ink/[0.07] px-5">
                <Search size={18} strokeWidth={1.5} className="shrink-0 text-mute" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search clients, projects, notes — or jump to a page"
                  aria-label="Search"
                  role="combobox"
                  aria-expanded
                  aria-controls="cmd-list"
                  aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                  className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
                />
                <Kbd>esc</Kbd>
              </div>

              <div ref={listRef} id="cmd-list" role="listbox" className="max-h-[min(52vh,420px)] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-ink">No matches for “{query}”</p>
                    <p className="mt-1 text-xs text-mute">Try a client name, a project, or a page like “money”.</p>
                  </div>
                ) : (
                  results.map((cmd, idx) => {
                    const showHeader = cmd.group !== lastGroup;
                    lastGroup = cmd.group;
                    const Icon = cmd.icon;
                    const isActive = idx === active;
                    return (
                      <div key={cmd.id}>
                        {showHeader && <p className={cn('px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute', idx === 0 ? 'pt-1' : 'pt-3')}>{cmd.group}</p>}
                        <button
                          type="button"
                          id={`cmd-${cmd.id}`}
                          data-idx={idx}
                          role="option"
                          aria-selected={isActive}
                          onMouseMove={() => setActive(idx)}
                          onClick={() => run(cmd)}
                          className="relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left"
                        >
                          {isActive && <motion.span layoutId="cmd-active" transition={spring.snappy} className="absolute inset-0 rounded-2xl bg-brand-50 ring-1 ring-brand-600/10" />}
                          <span className={cn('relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors', isActive ? 'bg-brand-600 text-white' : 'bg-ink/[0.05] text-ink-2')}>
                            <Icon size={16} strokeWidth={1.6} />
                          </span>
                          <span className="relative min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{cmd.label}</span>
                          {cmd.hint && <span className="relative shrink-0 text-xs text-mute">{cmd.hint}</span>}
                          {isActive && <ArrowRight size={14} className="relative shrink-0 text-brand-600" />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between border-t border-ink/[0.07] bg-paper-2 px-5 py-2.5 text-[11px] text-mute">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
                  <span className="flex items-center gap-1.5"><Kbd><CornerDownLeft size={10} /></Kbd> open</span>
                </span>
                <span className="hidden items-center gap-1.5 sm:flex"><FilePlus2 size={12} strokeWidth={1.6} /> Everything stays on this device</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
