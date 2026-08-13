import { BellRing, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMatieeStore } from '../../store/matieeStore';
import PrivateText from '../PrivateText';

export default function ReminderCard() {
  const navigate = useNavigate();
  const projects = useMatieeStore((s) => s.projects);
  const clients = useMatieeStore((s) => s.clients);

  // Show projects manually flagged as reminders
  const reminders = projects
    .filter((p) => p.reminder)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-[22px] p-6 shadow-card flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-navy-900">Reminders</h3>
        {reminders.length > 0 && (
          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            {reminders.length}
          </span>
        )}
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
          <BellRing size={32} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No reminders set</p>
          <p className="text-xs text-gray-400 mt-1">Mark a project with the bell icon</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {reminders.map((project) => {
            const client = clients.find((c) => c.id === project.clientId);
            const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/clients/${project.clientId}`)}
                className="flex items-start gap-3 p-3 bg-brand-50 rounded-2xl cursor-pointer hover:bg-brand-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <BellRing size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{project.name}</p>
                  {client && (
                    <p className="text-xs text-gray-500 truncate">
                      <PrivateText type="name">{client.name}</PrivateText>
                    </p>
                  )}
                  {project.deadline && (
                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-status-red font-medium' : 'text-gray-400'}`}>
                      {isOverdue ? '⚠ Overdue: ' : 'Due: '}
                      {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <ArrowRight size={14} className="text-gray-300 shrink-0 mt-2" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
