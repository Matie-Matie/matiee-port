import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import Reveal from '../components/Reveal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const navigate = useNavigate();
  const projects = useMatieeStore((s) => s.projects);
  const clients = useMatieeStore((s) => s.clients);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Go to previous/next month
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  // Build calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

  // Get deadlines for the current month view
  const deadlinesMap = useMemo(() => {
    const map = new Map<string, typeof projects>();
    projects
      .filter((p) => p.deadline && p.status !== 'completed')
      .forEach((p) => {
        const d = new Date(p.deadline);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const existing = map.get(key) || [];
        existing.push(p);
        map.set(key, existing);
      });
    return map;
  }, [projects]);

  // Check if a date has deadlines
  const getDeadlines = (day: number) => {
    const key = `${year}-${month}-${day}`;
    return deadlinesMap.get(key) || [];
  };

  // Build calendar cells
  const cells: (number | null)[] = [];
  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) cells.push(lastDayOfPrevMonth - i);
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  // Next month padding
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push(i);

  // Selected date deadlines
  const selectedDeadlines = selectedDate ? (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const key = `${y}-${m}-${d}`;
    return deadlinesMap.get(key) || [];
  })() : [];

  const isToday = (day: number) => {
    const todayDate = new Date();
    return day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Upcoming deadlines (sorted)
  const upcoming = [...projects]
    .filter((p) => p.deadline && p.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 8);

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[32px] md:text-[46px] font-bold text-navy-900 leading-none tracking-tight mb-2"
      >
        Calendar
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-sm text-gray-500 mb-8"
      >
        Track your project deadlines and milestones.
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
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;

              const isCurrentMonth = i >= firstDayOfWeek && i < firstDayOfWeek + daysInMonth;
              const deadlines = isCurrentMonth ? getDeadlines(day) : [];
              const hasDeadline = deadlines.length > 0;
              const selected = selectedDate === `${year}-${month}-${day}`;
              const todayDate = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (isCurrentMonth) {
                      setSelectedDate(selected ? null : `${year}-${month}-${day}`);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center justify-center h-12 md:h-14 rounded-xl text-sm transition-all
                    ${!isCurrentMonth ? 'text-gray-200' : ''}
                    ${isCurrentMonth && !selected && !todayDate ? 'hover:bg-brand-50 text-navy-900' : ''}
                    ${todayDate && !selected ? 'bg-green-mint/40 text-navy-900 font-bold' : ''}
                    ${selected ? 'bg-green-primary text-white font-bold' : ''}
                  `}
                >
                  <span>{day}</span>
                  {hasDeadline && isCurrentMonth && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {deadlines.slice(0, 3).map((_, i) => (
                        <span key={i} className={`w-1 h-1 rounded-full ${selected ? 'bg-white' : 'bg-green-primary'}`} />
                      ))}
                      {deadlines.length > 3 && (
                        <span className={`text-[8px] ${selected ? 'text-white/80' : 'text-gray-400'}`}>+{deadlines.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className="flex flex-col gap-5">
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
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-status-red' : 'bg-green-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{client?.name || 'Unknown'}</p>
                        </div>
                        <span className={`text-[11px] font-semibold shrink-0 ${overdue ? 'text-status-red' : 'text-gray-500'}`}>
                          {formatDate(p.deadline)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>

          {/* Selected Date Details */}
          {selectedDate && (
            <Reveal y={15} duration={0.3}>
              <div className="bg-white rounded-[22px] shadow-card p-5 md:p-6">
                <h3 className="text-base font-semibold text-navy-900 mb-3">
                  {new Date(Number(selectedDate.split('-')[0]), Number(selectedDate.split('-')[1]), Number(selectedDate.split('-')[2])).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h3>
                {selectedDeadlines.length === 0 ? (
                  <p className="text-sm text-gray-500">No deadlines this day</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDeadlines.map((p) => {
                      const client = clients.find((c) => c.id === p.clientId);
                      return (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/clients/${p.clientId}`)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-50 transition-all cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-primary to-green-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {client ? client.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-navy-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-gray-500">{client?.name || 'Unknown'} · {p.status}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
