import { useNavigate } from 'react-router-dom';
import { useMatieeStore } from '../../store/matieeStore';
import PrivateText from '../PrivateText';

const COLORS = ['bg-blue-400', 'bg-purple-400', 'bg-green-primary', 'bg-amber-400', 'bg-pink-400', 'bg-cyan-400', 'bg-rose-400', 'bg-emerald-400'];

function formatDate(d: string | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ProjectList() {
  const navigate = useNavigate();
  const projects = useMatieeStore((s) => s.projects);
  const clients = useMatieeStore((s) => s.clients);

  const recent = [...projects].reverse().slice(0, 5).map((p, i) => ({
    ...p,
    clientName: clients.find((c) => c.id === p.clientId)?.name || 'Unknown',
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-[22px] p-6 shadow-card flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-navy-900">Projects</h3>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No projects yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/clients/${p.clientId}`)}
              className="flex items-center gap-3 py-2 border-b border-brand-50 last:border-0 cursor-pointer hover:bg-brand-50/50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${p.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy-900 truncate">{p.name}</p>
                <p className="text-[11px] text-gray-500 truncate"><PrivateText type="name">{p.clientName}</PrivateText></p>
              </div>
              <span className="text-[11px] text-gray-500 font-medium shrink-0">{formatDate(p.deadline)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
