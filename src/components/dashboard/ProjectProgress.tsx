import { useMatieeStore } from '../../store/matieeStore';

export default function ProjectProgress() {
  const projects = useMatieeStore((s) => s.projects);
  const total = projects.length || 1;
  const avg = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total);

  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (avg / 100) * circumference;

  return (
    <div className="bg-white rounded-[22px] p-6 shadow-card flex flex-col items-center">
      <h3 className="text-base font-semibold text-navy-900 self-start mb-4">Project Progress</h3>

      <div className="relative w-full max-w-[220px] h-[130px] overflow-visible">
        <svg width="100%" height="140" viewBox="0 0 200 140" className="-ml-1">
          <path
            d="M 20 120 A 80 80 0 0 1 180 120"
            fill="none"
            stroke="#F0F0F0"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 20 120 A 80 80 0 0 1 180 120"
            fill="none"
            stroke="url(#progressGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#155C39" />
              <stop offset="100%" stopColor="#1C6F45" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
          <span className="text-[36px] font-bold text-navy-900 leading-none">{avg}%</span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Overall Progress
          </p>
        </div>
      </div>
    </div>
  );
}
