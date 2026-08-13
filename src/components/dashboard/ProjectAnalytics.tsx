import { useMemo } from 'react';
import { useMatieeStore } from '../../store/matieeStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProjectAnalytics() {
  const projects = useMatieeStore((s) => s.projects);

  const data = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun … 6=Sat
    // Monday-anchored week
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    return DAYS.map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const count = projects.filter((p) =>
        p.createdAt.startsWith(dateStr),
      ).length;

      return { day: dateStr, label: DAYS[i], count };
    });
  }, [projects]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalCreated = data.reduce((sum, d) => sum + d.count, 0);
  const todayIndex = ((new Date().getDay() + 6) % 7); // Mon=0 … Sun=6

  return (
    <div className="bg-white rounded-[22px] p-6 shadow-card flex flex-col min-h-[300px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-navy-900">Project Analytics</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {totalCreated > 0
              ? `${totalCreated} project${totalCreated !== 1 ? 's' : ''} created this week`
              : 'No projects created this week'}
          </p>
        </div>
        <span className="text-xs text-gray-500 shrink-0">This Week</span>
      </div>

      {totalCreated === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">No activity yet this week</p>
        </div>
      ) : (
        <div className="flex-1 flex items-end justify-between gap-3 px-2">
          {data.map((entry, idx) => {
            const isToday = idx === todayIndex;
            const barHeight = (entry.count / maxCount) * 160;

            return (
              <div key={entry.day} className="flex flex-col items-center gap-1.5 flex-1">
                {/* Count label */}
                {entry.count > 0 && (
                  <span className={`text-[11px] font-semibold ${isToday ? 'text-green-primary' : 'text-gray-500'}`}>
                    {entry.count}
                  </span>
                )}

                {/* Bar */}
                <div className="relative flex items-end justify-center w-full">
                  <div
                    className={`w-full max-w-[32px] rounded-t-[6px] transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-b from-green-dark to-green-primary shadow-sm'
                        : 'bg-green-mint/70'
                    }`}
                    style={{ height: `${Math.max(barHeight, entry.count > 0 ? 6 : 0)}px` }}
                  />
                </div>

                {/* Day label */}
                <span className={`text-[11px] font-medium ${isToday ? 'text-green-primary font-bold' : 'text-gray-500'}`}>
                  {entry.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
