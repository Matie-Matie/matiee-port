import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMatieeStore } from '../../store/matieeStore';
import PrivateText from '../PrivateText';

const AVATAR_COLORS = [
  'from-green-primary to-green-dark',
  'from-purple-400 to-purple-600',
  'from-blue-400 to-blue-600',
  'from-amber-400 to-amber-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
];

export default function TeamCollaboration() {
  const navigate = useNavigate();
  const clients = useMatieeStore((s) => s.clients);
  const projects = useMatieeStore((s) => s.projects);

  const members = clients.slice(0, 4).map((c, i) => {
    const clientProjects = projects.filter((p) => p.clientId === c.id);
    const completed = clientProjects.filter((p) => p.status === 'completed').length;
    const total = clientProjects.length;
    return {
      initials: c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      name: c.name,
      task: total > 0 ? `${total} project${total !== 1 ? 's' : ''}` : 'No projects yet',
      status: total === 0 ? 'Pending' as const : completed === total ? 'Completed' as const : 'In Progress' as const,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      id: c.id,
    };
  });

  const statusStyles = {
    Completed: 'bg-green-mint/50 text-green-dark',
    'In Progress': 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
  };

  const statusDots = {
    Completed: 'bg-green-primary',
    'In Progress': 'bg-blue-500',
    Pending: 'bg-amber-500',
  };

  return (
    <div className="bg-white rounded-[22px] p-6 shadow-card flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-navy-900">Clients</h3>
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center gap-1.5 text-xs font-medium text-green-primary hover:text-green-dark transition-colors"
        >
          <Plus size={14} />
          Add Client
        </button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No clients yet</p>
      ) : (
        <div className="flex flex-col gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(`/clients/${m.id}`)}
              className="flex items-center gap-3 cursor-pointer hover:bg-brand-50 -mx-2 px-2 py-1 rounded-xl transition-colors"
            >
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate"><PrivateText type="name">{m.name}</PrivateText></p>
                <p className="text-xs text-gray-500 truncate">{m.task}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full shrink-0 ${statusStyles[m.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDots[m.status]}`} />
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
