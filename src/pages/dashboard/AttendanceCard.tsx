import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useMatieeStore } from '../../store/matieeStore';
import { ATTENDANCE_LABELS, ATTENDANCE_RATE_FACTOR, type AttendanceStatus } from '../../types';
import { Card, CardHeader } from '../../ui/Card';
import { Money } from '../../ui/Money';
import { R } from '../../routes';
import { cn } from '../../lib/cn';

const CELL: Record<AttendanceStatus, string> = {
  worked: 'bg-brand-600',
  'half-day': 'bg-brand-300',
  absent: 'bg-clay-500',
  leave: 'bg-warn-500',
  holiday: 'bg-sand-300',
  rest: 'bg-ink/15',
};

export function AttendanceCard() {
  const attendance = useMatieeStore((s) => s.attendance);
  const dailyRate = useMatieeStore((s) => s.dailyRate);

  const { days, worked, expected, monthLabel, todayIdx } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const count = new Date(y, m + 1, 0).getDate();
    const byDate = new Map(attendance.map((a) => [a.date, a.status]));
    let w = 0;
    let units = 0;
    const list = Array.from({ length: count }, (_, i) => {
      const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
      const status = byDate.get(date);
      if (status) units += ATTENDANCE_RATE_FACTOR[status];
      if (status === 'worked') w += 1;
      return { day: i + 1, date, status };
    });
    return {
      days: list,
      worked: w,
      expected: units * dailyRate,
      monthLabel: now.toLocaleDateString('en-US', { month: 'long' }),
      todayIdx: now.getDate() - 1,
    };
  }, [attendance, dailyRate]);

  return (
    <Card bezel spotlight pad="md">
      <CardHeader
        title={`${monthLabel} attendance`}
        description={<>{worked} day{worked === 1 ? '' : 's'} worked · <Money value={dailyRate} />/day</>}
        action={
          <Link to={R.attendance} aria-label="Open attendance" className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.05] text-ink-2 transition-[background-color,transform] duration-300 ease-matie hover:bg-brand-600 hover:text-white active:scale-90">
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </Link>
        }
      />
      <p className="text-xs text-mute">Expected salary</p>
      <p className="mb-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-ink"><Money value={expected} animate /></p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(22px,1fr))] gap-1.5" role="img" aria-label={`${worked} days worked this month`}>
        {days.map((d, i) => (
          <span
            key={d.date}
            title={`${monthLabel} ${d.day} — ${d.status ? ATTENDANCE_LABELS[d.status] : 'Not marked'}`}
            className={cn(
              'aspect-square rounded-[7px] transition-transform duration-300 ease-matie hover:scale-125',
              d.status ? CELL[d.status] : 'bg-ink/[0.05] ring-1 ring-inset ring-ink/[0.05]',
              i === todayIdx && 'outline outline-2 outline-offset-2 outline-brand-500',
            )}
          />
        ))}
      </div>
    </Card>
  );
}
