import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, Check, ChevronLeft, ChevronRight, Clock, Flag, Moon, Pencil, Plane, RotateCcw, X, type LucideIcon } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { ATTENDANCE_LABELS, ATTENDANCE_RATE_FACTOR, type AttendanceStatus } from '../types';
import { R } from '../routes';
import { daysUntil, fmtDate, todayStr } from '../lib/format';
import { EASE } from '../lib/motion';
import { cn } from '../lib/cn';
import { PageHeader } from '../ui/PageHeader';
import { Button, IconButton } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { Money } from '../ui/Money';
import { MoneyInput } from '../ui/Field';
import { Badge } from '../ui/Badge';
import { toast } from '../ui/toast';
import PrivateText from '../components/PrivateText';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS_ORDER: AttendanceStatus[] = ['worked', 'half-day', 'absent', 'rest', 'holiday', 'leave'];

const STATUS_UI: Record<AttendanceStatus, { cell: string; dot: string; icon: LucideIcon }> = {
  worked: { cell: 'bg-brand-600 text-white shadow-[0_6px_14px_-6px_rgb(28_111_69/0.7)]', dot: 'bg-brand-600', icon: Check },
  'half-day': { cell: 'bg-brand-200 text-brand-900', dot: 'bg-brand-300', icon: Clock },
  absent: { cell: 'bg-clay-100 text-clay-600', dot: 'bg-clay-500', icon: X },
  rest: { cell: 'bg-ink/[0.06] text-mute', dot: 'bg-faint', icon: Moon },
  holiday: { cell: 'bg-sand-200 text-ink-2', dot: 'bg-sand-300', icon: Flag },
  leave: { cell: 'bg-warn-100 text-warn-700', dot: 'bg-warn-500', icon: Plane },
};

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function Attendance() {
  const projects = useMatieeStore((s) => s.projects);
  const clients = useMatieeStore((s) => s.clients);
  const attendance = useMatieeStore((s) => s.attendance);
  const dailyRate = useMatieeStore((s) => s.dailyRate);
  const setAttendance = useMatieeStore((s) => s.setAttendance);
  const clearAttendance = useMatieeStore((s) => s.clearAttendance);
  const setDailyRate = useMatieeStore((s) => s.setDailyRate);

  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [dir, setDir] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState('');

  const { y, m } = cursor;
  const today = todayStr();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDow = new Date(y, m, 1).getDay();

  const byDate = useMemo(() => new Map(attendance.map((a) => [a.date, a.status])), [attendance]);
  const deadlineDates = useMemo(() => new Set(projects.filter((p) => p.deadline && p.status !== 'completed').map((p) => p.deadline.slice(0, 10))), [projects]);

  const stats = useMemo(() => {
    let worked = 0, half = 0, absent = 0, marked = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const s = byDate.get(key(y, m, d));
      if (!s) continue;
      marked++;
      if (s === 'worked') worked++;
      if (s === 'half-day') half++;
      if (s === 'absent') absent++;
    }
    return { worked, half, absent, marked, expected: (worked * ATTENDANCE_RATE_FACTOR.worked + half * ATTENDANCE_RATE_FACTOR['half-day']) * dailyRate };
  }, [byDate, daysInMonth, y, m, dailyRate]);

  function go(delta: number) {
    setDir(delta);
    const d = new Date(y, m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  }
  function goToday() {
    const n = new Date();
    setDir(n.getFullYear() * 12 + n.getMonth() >= y * 12 + m ? 1 : -1);
    setCursor({ y: n.getFullYear(), m: n.getMonth() });
    setSelected(today);
  }

  function setStatus(s: AttendanceStatus) {
    if (!selected) return;
    setAttendance(selected, s);
    setSelected(null);
  }

  function saveRate() {
    const v = parseFloat(rateInput);
    if (!Number.isNaN(v) && v > 0) {
      setDailyRate(v);
      toast('Daily rate updated', 'success');
    }
    setEditingRate(false);
  }

  const todayStatus = byDate.get(today);
  const selectedStatus = selected ? byDate.get(selected) : undefined;
  const selectedDeadlines = selected ? projects.filter((p) => p.deadline?.slice(0, 10) === selected && p.status !== 'completed') : [];
  const upcoming = useMemo(
    () => [...projects].filter((p) => p.deadline && p.status !== 'completed').sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5),
    [projects],
  );
  const selectedLabel = selected ? new Date(+selected.slice(0, 4), +selected.slice(5, 7) - 1, +selected.slice(8, 10)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';

  return (
    <div>
      <PageHeader
        eyebrow="Attendance"
        title="Work days & salary"
        description="Mark the days you worked and watch your expected salary build up."
        actions={
          <Button
            size="lg"
            variant={todayStatus === 'worked' ? 'soft' : 'primary'}
            leading={todayStatus === 'worked' ? <Check size={16} strokeWidth={2.25} /> : <CalendarCheck size={16} strokeWidth={1.75} />}
            onClick={() => {
              if (todayStatus === 'worked') return;
              setAttendance(today, 'worked');
              toast('Marked today as worked', 'success');
            }}
            disabled={todayStatus === 'worked'}
          >
            {todayStatus === 'worked' ? 'Today is marked' : 'Mark today as worked'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card bezel pad="none">
          <div className="p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-ink">
                  {MONTHS[m]} <span className="font-normal text-mute">{y}</span>
                </h2>
                <Button variant="soft" size="sm" onClick={goToday}>Today</Button>
              </div>
              <div className="flex gap-1.5">
                <IconButton label="Previous month" onClick={() => go(-1)}><ChevronLeft size={17} strokeWidth={1.75} /></IconButton>
                <IconButton label="Next month" onClick={() => go(1)}><ChevronRight size={17} strokeWidth={1.75} /></IconButton>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">{d}</div>
              ))}
            </div>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${y}-${m}`}
                  initial={{ opacity: 0, x: dir * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -28 }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="grid grid-cols-7 gap-1.5 sm:gap-2"
                >
                  {Array.from({ length: firstDow }, (_, i) => <div key={`b${i}`} aria-hidden />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const k = key(y, m, day);
                    const status = byDate.get(k);
                    const isSel = selected === k;
                    const isToday = k === today;
                    const hasDeadline = deadlineDates.has(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSelected(isSel ? null : k)}
                        aria-pressed={isSel}
                        aria-label={`${MONTHS[m]} ${day}${status ? `, ${ATTENDANCE_LABELS[status]}` : ''}${hasDeadline ? ', project deadline' : ''}`}
                        className={cn(
                          'relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-medium transition-[transform,background-color,box-shadow] duration-300 ease-matie active:scale-90',
                          status ? STATUS_UI[status].cell : 'bg-paper-2 text-ink ring-1 ring-inset ring-ink/[0.05] hover:bg-brand-50 hover:ring-brand-600/20',
                          isToday && !isSel && 'outline outline-2 outline-offset-2 outline-brand-500',
                          isSel && 'scale-[1.06] shadow-lift outline outline-2 outline-offset-2 outline-ink',
                        )}
                      >
                        <span className="tabular-nums">{day}</span>
                        {hasDeadline && <span className={cn('absolute bottom-1.5 h-1.5 w-1.5 rounded-full', status === 'worked' ? 'bg-warn-100' : 'bg-warn-500')} />}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink/[0.07] pt-4">
              {STATUS_ORDER.map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-[11.5px] font-medium text-mute">
                  <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_UI[s].dot)} />
                  {ATTENDANCE_LABELS[s]}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-mute"><span className="h-2 w-2 rounded-full bg-warn-500" /> Deadline</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card bezel tone="brand" pad="none">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-white/70">Expected salary · {MONTHS[m]}</p>
                {editingRate ? (
                  <button type="button" onClick={() => setEditingRate(false)} className="text-[12px] font-medium text-white/70 hover:text-white">Cancel</button>
                ) : (
                  <button type="button" onClick={() => { setRateInput(String(dailyRate)); setEditingRate(true); }} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/15">
                    <Pencil size={11} strokeWidth={1.75} /> Rate
                  </button>
                )}
              </div>
              <p className="mt-2 text-[44px] font-semibold leading-none tracking-[-0.045em]"><Money value={stats.expected} animate /></p>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                {editingRate ? (
                  <form onSubmit={(e) => { e.preventDefault(); saveRate(); }} className="flex w-full items-center gap-2">
                    <div className="flex-1 [&_input]:border-0 [&_input]:bg-white [&_input]:text-ink"><MoneyInput data-autofocus aria-label="Daily rate" value={rateInput} onChange={(e) => setRateInput(e.target.value)} className="h-10" /></div>
                    <Button type="submit" size="sm" variant="dark">Save</Button>
                  </form>
                ) : (
                  <>
                    <span className="text-[12px] text-white/70">Daily rate</span>
                    <span className="text-lg font-semibold tabular-nums"><Money value={dailyRate} /></span>
                  </>
                )}
              </div>

              <dl className="mt-5 grid grid-cols-3 divide-x divide-white/10 text-center">
                {[
                  ['Worked', stats.worked],
                  ['Half day', stats.half],
                  ['Absent', stats.absent],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
                    <dt className="text-[11px] text-white/60">{label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </Card>

          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.4, ease: EASE }}>
                <Card bezel pad="md">
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-tight text-ink">{selectedLabel}</h3>
                      <p className="mt-0.5 text-xs text-mute">{selectedStatus ? `Marked as ${ATTENDANCE_LABELS[selectedStatus]}` : 'How was this day?'}</p>
                    </div>
                    {selectedStatus && (
                      <button type="button" onClick={() => { clearAttendance(selected); setSelected(null); }} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-mute transition-colors hover:bg-danger-100 hover:text-danger-700">
                        <RotateCcw size={12} strokeWidth={1.75} /> Clear
                      </button>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {STATUS_ORDER.map((s) => {
                      const Icon = STATUS_UI[s].icon;
                      const on = selectedStatus === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={cn(
                            'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-medium transition-[transform,background-color,box-shadow] duration-300 ease-matie active:scale-95',
                            on ? cn(STATUS_UI[s].cell, 'ring-2 ring-ink/10') : 'bg-paper-2 text-ink-2 ring-1 ring-inset ring-ink/[0.06] hover:bg-brand-50',
                          )}
                        >
                          <Icon size={15} strokeWidth={1.75} />
                          {ATTENDANCE_LABELS[s]}
                        </button>
                      );
                    })}
                  </div>
                  {selectedDeadlines.length > 0 && (
                    <div className="mt-4 border-t border-ink/[0.07] pt-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-warn-700">Due this day</p>
                      {selectedDeadlines.map((p) => (
                        <Link key={p.id} to={R.client(p.clientId)} className="flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-ink/[0.04]">
                          <span className="h-1.5 w-1.5 rounded-full bg-warn-500" />
                          <span className="flex-1 truncate text-[13px] font-medium text-ink">{p.name}</span>
                          <span className="truncate text-[11px] text-mute"><PrivateText type="name">{clients.find((c) => c.id === p.clientId)?.name ?? ''}</PrivateText></span>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card bezel pad="md">
            <CardHeader title="Upcoming deadlines" />
            {upcoming.length === 0 ? (
              <p className="py-4 text-center text-sm text-mute">No upcoming deadlines</p>
            ) : (
              <ul className="-mx-2 space-y-0.5">
                {upcoming.map((p) => {
                  const d = daysUntil(p.deadline) ?? 0;
                  return (
                    <li key={p.id}>
                      <Link to={R.client(p.clientId)} className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-ink/[0.04]">
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', d < 0 ? 'bg-danger-500' : d <= 3 ? 'bg-warn-500' : 'bg-brand-500')} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                          <span className="block truncate text-[11.5px] text-mute"><PrivateText type="name">{clients.find((c) => c.id === p.clientId)?.name ?? 'Unknown'}</PrivateText></span>
                        </span>
                        <Badge tone={d < 0 ? 'danger' : d <= 3 ? 'warn' : 'neutral'}>{fmtDate(p.deadline)}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
