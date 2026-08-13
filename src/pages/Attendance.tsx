import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarCheck, Pencil, RotateCcw, Briefcase, Check, X } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import Reveal from '../components/Reveal';
import type { AttendanceStatus } from '../types';
import { ATTENDANCE_LABELS } from '../types';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_ORDER: AttendanceStatus[] = ['worked', 'half-day', 'absent', 'rest', 'holiday', 'leave'];

// Color coding per status
const STATUS_STYLES: Record<AttendanceStatus, { cell: string; dot: string; chip: string }> = {
  worked: {
    cell: 'bg-green-mint text-green-dark font-bold',
    dot: 'bg-green-primary',
    chip: 'bg-green-mint text-green-dark',
  },
  'half-day': {
    cell: 'bg-green-mint/50 text-green-dark font-semibold',
    dot: 'bg-green-light',
    chip: 'bg-green-mint/50 text-green-dark',
  },
  absent: {
    cell: 'bg-red-100 text-red-700 font-bold',
    dot: 'bg-red-500',
    chip: 'bg-red-100 text-red-700',
  },
  rest: {
    cell: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
    chip: 'bg-gray-100 text-gray-500',
  },
  holiday: {
    cell: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700',
  },
  leave: {
    cell: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-700',
  },
};

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Attendance() {
  const navigate = useNavigate();
  const projects = useMatieeStore((s) => s.projects);
  const clients = useMatieeStore((s) => s.clients);
  const attendance = useMatieeStore((s) => s.attendance);
  const dailyRate = useMatieeStore((s) => s.dailyRate);
  const setAttendance = useMatieeStore((s) => s.setAttendance);
  const clearAttendance = useMatieeStore((s) => s.clearAttendance);
  const setDailyRate = useMatieeStore((s) => s.setDailyRate);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(String(dailyRate));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

  // Build calendar cells
  const cells: (number | null)[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) cells.push(lastDayOfPrevMonth - i);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push(i);

  // Attendance map for the visible month
  const monthAttendance = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    attendance.forEach((a) => {
      const [y, m] = a.date.split('-').map(Number);
      if (y === year && m === month + 1) map.set(a.date, a.status);
    });
    return map;
  }, [attendance, year, month]);

  // Month stats
  const monthStats = useMemo(() => {
    let worked = 0;
    let halfDays = 0;
    let absent = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const status = monthAttendance.get(toDateKey(year, month, d));
      if (status === 'worked') worked++;
      if (status === 'half-day') halfDays++;
      if (status === 'absent') absent++;
    }
    const expected = (worked + halfDays * 0.5) * dailyRate;
    return { worked, halfDays, absent, expected };
  }, [monthAttendance, daysInMonth, year, month, dailyRate]);

  // Selected date record
  const selectedRecord = selectedDate ? attendance.find((a) => a.date === selectedDate) : undefined;
  const selectedDeadlines = selectedDate ? projects.filter((p) => p.deadline && p.deadline.slice(0, 10) === selectedDate && p.status !== 'completed') : [];

  const isToday = (day: number) => {
    const t = new Date();
    return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  const handleSetStatus = (status: AttendanceStatus) => {
    if (!selectedDate) return;
    setAttendance(selectedDate, status);
    setSelectedDate(null);
  };

  const handleClear = () => {
    if (!selectedDate) return;
    clearAttendance(selectedDate);
    setSelectedDate(null);
  };

  const saveRate = () => {
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val > 0) setDailyRate(val);
    setEditingRate(false);
  };

  // Upcoming deadlines (sorted) for side panel
  const upcoming = [...projects]
    .filter((p) => p.deadline && p.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[32px] md:text-[46px] font-bold text-navy-900 leading-none tracking-tight mb-2"
      >
        Attendance
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-sm text-gray-500 mb-8"
      >
        Mark your work days and watch your expected salary grow. 💸
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Calendar Grid ── */}
        <div className="lg:col-span-2 bg-white rounded-[22px] shadow-card p-5 md:p-6">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-navy-900 hover:bg-brand-50 transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-navy-900">{MONTHS[month]} {year}</h2>
              <button onClick={today} className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-green-mint/50 text-green-dark hover:bg-green-mint transition-all">
                Today
              </button>
            </div>
            <button onClick={nextMonth} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-navy-900 hover:bg-brand-50 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;

              const isCurrentMonth = i >= firstDayOfWeek && i < firstDayOfWeek + daysInMonth;
              const dateKey = toDateKey(year, month, day);
              const status = isCurrentMonth ? monthAttendance.get(dateKey) : undefined;
              const selected = selectedDate === dateKey;
              const todayDate = isToday(day);
              const hasDeadline = isCurrentMonth && projects.some((p) => p.deadline && p.deadline.slice(0, 10) === dateKey && p.status !== 'completed');

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (isCurrentMonth) {
                      setSelectedDate(selected ? null : dateKey);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center justify-center h-12 md:h-14 rounded-xl text-sm transition-all
                    ${!isCurrentMonth ? 'text-gray-200' : ''}
                    ${isCurrentMonth && !selected && !status ? 'hover:bg-brand-50 text-navy-900' : ''}
                    ${todayDate && !selected && !status ? 'ring-1 ring-green-primary/40 text-navy-900' : ''}
                    ${status ? STATUS_STYLES[status].cell : ''}
                    ${selected ? 'ring-2 ring-green-primary text-navy-900' : ''}
                  `}
                >
                  <span>{day}</span>
                  {(status || hasDeadline) && isCurrentMonth && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {status && (
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[status].dot}`} />
                      )}
                      {hasDeadline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 pt-4 border-t border-brand-100">
            {(STATUS_ORDER).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[s].dot}`} />
                {ATTENDANCE_LABELS[s]}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Deadline
            </span>
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className="flex flex-col gap-5">
          {/* Month Summary */}
          <Reveal y={15} duration={0.4}>
            <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarCheck size={16} className="text-green-primary" />
                <h3 className="text-base font-semibold text-navy-900">
                  {MONTHS[month]} Summary
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 rounded-xl bg-green-mint/40">
                  <p className="text-2xl font-bold text-green-dark">{monthStats.worked}</p>
                  <p className="text-[10px] font-medium text-gray-500 mt-0.5">Worked</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-green-mint/20">
                  <p className="text-2xl font-bold text-navy-900">{monthStats.halfDays}</p>
                  <p className="text-[10px] font-medium text-gray-500 mt-0.5">Half Day</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50">
                  <p className="text-2xl font-bold text-red-600">{monthStats.absent}</p>
                  <p className="text-[10px] font-medium text-gray-500 mt-0.5">Absent</p>
                </div>
              </div>

              {/* Daily rate + expected salary */}
              <div className="rounded-xl bg-gradient-to-br from-green-primary to-green-dark text-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-white/80">Daily Rate</p>
                  {editingRate ? (
                    <button onClick={() => setEditingRate(false)} className="text-[11px] font-semibold text-white/80 hover:text-white">
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => { setRateInput(String(dailyRate)); setEditingRate(true); }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-white transition-colors"
                    >
                      <Pencil size={11} />
                      Edit
                    </button>
                  )}
                </div>

                {editingRate ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold">₱</span>
                    <input
                      type="number"
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRate();
                        if (e.key === 'Escape') setEditingRate(false);
                      }}
                      autoFocus
                      className="w-full px-3 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-white/40"
                    />
                    <button onClick={saveRate} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-2xl font-bold mt-1">{fmt(dailyRate)}</p>
                )}

                <div className="h-px bg-white/20 my-3" />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-white/80">Expected Salary</p>
                  <p className="text-xl font-bold">{fmt(monthStats.expected)}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Quick actions for selected date */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-[22px] shadow-card p-5 md:p-6"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-navy-900">
                    {new Date(Number(selectedDate.split('-')[0]), Number(selectedDate.split('-')[1]) - 1, Number(selectedDate.split('-')[2])).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  {selectedRecord && (
                    <button onClick={handleClear} className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-red-500 transition-colors" title="Clear this day">
                      <RotateCcw size={12} />
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  {selectedRecord ? `Marked as ${ATTENDANCE_LABELS[selectedRecord.status]}` : 'How was this day?'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {STATUS_ORDER.map((s) => {
                    const active = selectedRecord?.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleSetStatus(s)}
                        className={`
                          flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all
                          ${active ? STATUS_STYLES[s].chip + ' ring-1 ring-green-primary/30' : 'bg-brand-50 text-gray-500 hover:bg-brand-100'}
                        `}
                      >
                        {s === 'worked' && <Check size={13} />}
                        {s === 'absent' && <X size={13} />}
                        {s === 'rest' && <Briefcase size={13} />}
                        {ATTENDANCE_LABELS[s]}
                      </button>
                    );
                  })}
                </div>

                {selectedDeadlines.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-brand-100">
                    <p className="text-[11px] font-semibold text-amber-600 mb-2">Deadline this day</p>
                    {selectedDeadlines.map((p) => {
                      const client = clients.find((c) => c.id === p.clientId);
                      return (
                        <div key={p.id} onClick={() => navigate(`/clients/${p.clientId}`)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-50 cursor-pointer transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <p className="text-xs font-medium text-navy-900 truncate flex-1">{p.name}</p>
                          {client && <p className="text-[10px] text-gray-400 truncate">{client.name}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upcoming Deadlines */}
          <Reveal y={15} duration={0.4}>
            <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
              <h3 className="text-base font-semibold text-navy-900 mb-4">Upcoming Deadlines</h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((p) => {
                    const client = clients.find((c) => c.id === p.clientId);
                    const overdue = new Date(p.deadline) < new Date();
                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/clients/${p.clientId}`)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 transition-all cursor-pointer"
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-red-500' : 'bg-green-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{client?.name || 'Unknown'}</p>
                        </div>
                        <span className={`text-[11px] font-semibold shrink-0 ${overdue ? 'text-red-500' : 'text-gray-500'}`}>
                          {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
