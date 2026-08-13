import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, BellRing, Pencil, Paperclip } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, type ProjectType, type Project } from '../types';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const TYPE_OPTIONS: ProjectType[] = ['prescription', 'lending', 'inventory', 'attendance', 'other'];

function formatDate(d: string | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Projects() {
  const navigate = useNavigate();
  const clients = useMatieeStore((s) => s.clients);
  const projects = useMatieeStore((s) => s.projects);
  const attachments = useMatieeStore((s) => s.attachments);
  const addProject = useMatieeStore((s) => s.addProject);
  const updateProject = useMatieeStore((s) => s.updateProject);
  const addClient = useMatieeStore((s) => s.addClient);

  const getAttachmentCount = (projectId: string) =>
    attachments.filter((a) => a.projectId === projectId).length;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: '', name: '', type: 'other' as ProjectType, typeOther: '',
    description: '', deadline: '', fee: 0, downpayment: 0,
  });

  // Client combobox state
  const [clientSearch, setClientSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name || 'Unknown';

  const sorted = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Filtered clients based on search
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()),
  );
  const canCreateNew = clientSearch.trim().length > 0 &&
    !clients.some((c) => c.name.toLowerCase() === clientSearch.trim().toLowerCase());

  const handleSelectClient = (clientId: string, clientName: string) => {
    setForm({ ...form, clientId });
    setSelectedClientName(clientName);
    setClientSearch(clientName);
    setShowDropdown(false);
  };

  const handleCreateAndSelect = () => {
    const newClient = addClient({
      name: clientSearch.trim(),
      contact: '',
      email: '',
      notes: '',
    });
    setForm({ ...form, clientId: newClient.id });
    setSelectedClientName(newClient.name);
    setClientSearch(newClient.name);
    setShowDropdown(false);
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.clientId) return;
    addProject({
      clientId: form.clientId, name: form.name.trim(), type: form.type,
      typeOther: form.type === 'other' ? form.typeOther : undefined,
      description: form.description.trim(), deadline: form.deadline,
      fee: form.fee, downpayment: form.downpayment, downpaymentPaid: false, remainingPaid: false, reminder: false,
      progress: 0, status: 'pending',
    });
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setForm({ clientId: '', name: '', type: 'other', typeOther: '', description: '', deadline: '', fee: 0, downpayment: 0 });
    setClientSearch('');
    setSelectedClientName('');
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ── Edit project ──
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', type: 'other' as ProjectType, typeOther: '',
    description: '', deadline: '', fee: 0, downpayment: 0,
  });

  const openEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditForm({
      name: project.name,
      type: project.type,
      typeOther: project.typeOther || '',
      description: project.description,
      deadline: project.deadline,
      fee: project.fee,
      downpayment: project.downpayment,
    });
    setEditingProject(project);
  };

  const handleEditSave = () => {
    if (!editingProject || !editForm.name.trim()) return;
    updateProject(editingProject.id, {
      name: editForm.name.trim(),
      type: editForm.type,
      typeOther: editForm.type === 'other' ? editForm.typeOther : undefined,
      description: editForm.description.trim(),
      deadline: editForm.deadline,
      fee: editForm.fee,
      downpayment: editForm.downpayment,
    });
    setEditingProject(null);
  };

  return (
    <div>
      <PageHeader
        badge="Projects"
        title="Projects"
        description={`${projects.length} project${projects.length !== 1 ? 's' : ''} across ${clients.length} client${clients.length !== 1 ? 's' : ''}.`}
        action={
          <button
            onClick={openForm}
            className="flex items-center gap-2 h-12 px-6 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add Project
          </button>
        }
      />

      {sorted.length === 0 ? (
        <Reveal y={20} delay={0.1}>
          <EmptyState
            icon="🚀"
            title="No projects yet"
            description="Add your first project to get started."
            action={
              <button
                onClick={openForm}
                className="flex items-center gap-2 h-12 px-6 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                Add Project
              </button>
            }
          />
        </Reveal>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {sorted.map((project, i) => {
            const clientName = getClientName(project.clientId);
            const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';

            return (
              <Reveal key={project.id} y={20} delay={0.04 * i} duration={0.4}>
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="p-6 bg-white rounded-[22px] shadow-card cursor-pointer transition-all duration-200 h-full flex flex-col"
                  onClick={() => navigate(`/clients/${project.clientId}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-light to-green-mint flex items-center justify-center text-green-dark text-sm font-bold flex-shrink-0 shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Edit button */}
                      <button
                        onClick={(e) => openEdit(e, project)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-green-primary hover:bg-green-mint/30 transition-all opacity-0 group-hover:opacity-100"
                        title="Edit project"
                      >
                        <Pencil size={13} />
                      </button>
                      {/* Reminder bell */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProject(project.id, { reminder: !project.reminder });
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          project.reminder
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                            : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
                        }`}
                        title={project.reminder ? 'Remove reminder' : 'Set as reminder'}
                      >
                        {project.reminder ? <BellRing size={14} /> : <Bell size={14} />}
                      </button>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${project.status === 'completed' ? 'bg-green-mint/50 text-green-dark' : 'bg-brand-50 text-gray-500'}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                      {project.status === 'completed' && !project.remainingPaid && (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-status-red/10 text-status-red">
                          Unpaid
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{PROJECT_TYPE_LABELS[project.type]}{project.type === 'other' && project.typeOther ? ` — ${project.typeOther}` : ''}</span>
                    {project.deadline && (
                      <span className={isOverdue ? 'text-status-red font-medium' : ''}>
                        {isOverdue ? '⚠ ' : ''}{formatDate(project.deadline)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-brand-50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-primary to-green-light rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-navy-900">{project.progress}%</span>
                  </div>

                  <div className="flex items-center gap-3 mt-auto pt-4 text-xs">
                    <span className="font-medium text-navy-900">₱{project.fee.toLocaleString()}</span>
                    {project.downpayment > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-green-primary font-medium">₱{project.downpayment.toLocaleString()} dp</span>
                      </>
                    )}
                    {getAttachmentCount(project.id) > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1 text-gray-400 font-medium">
                          <Paperclip size={11} />
                          {getAttachmentCount(project.id)}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ── Add Project Modal (with inline client creation) ── */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Project">
        <div className="flex flex-col gap-4">
          {/* Client Combobox */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Client <span className="text-green-primary">*</span>
            </label>
            <input
              autoFocus
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setForm({ ...form, clientId: '' });
                setSelectedClientName('');
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search or type client name..."
              className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint transition-all"
            />

            {showDropdown && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white rounded-2xl shadow-lg border border-brand-50 max-h-52 overflow-y-auto py-2">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c.id, c.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-brand-50 ${form.clientId === c.id ? 'bg-green-mint/30 font-semibold text-navy-900' : 'text-gray-700'}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-primary to-green-dark flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate">{c.name}</span>
                      {c.email && <span className="block text-[11px] text-gray-400 truncate">{c.email}</span>}
                    </div>
                  </button>
                ))}

                {canCreateNew && (
                  <button
                    type="button"
                    onClick={handleCreateAndSelect}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-green-primary font-medium hover:bg-brand-50 border-t border-brand-50 mt-1 pt-2 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-green-mint/50 flex items-center justify-center text-green-dark text-[10px] font-bold flex-shrink-0">
                      +
                    </div>
                    <span>Create new client "<strong>{clientSearch.trim()}</strong>"</span>
                  </button>
                )}

                {filteredClients.length === 0 && !canCreateNew && (
                  <p className="px-4 py-3 text-xs text-gray-400 text-center">Type a name to create a new client</p>
                )}
              </div>
            )}

            {selectedClientName && (
              <p className="text-[11px] text-green-primary font-medium mt-1.5 ml-1">
                ✓ {selectedClientName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Project Name <span className="text-green-primary">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Pharmacy Inventory System"
              className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProjectType })}
                className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 outline-none focus:ring-2 focus:ring-green-mint">
                {TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 outline-none focus:ring-2 focus:ring-green-mint" />
            </div>
          </div>

          {form.type === 'other' && (
            <input value={form.typeOther} onChange={(e) => setForm({ ...form, typeOther: e.target.value })}
              placeholder="Specify type..." className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
          )}

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description" rows={2}
            className="w-full px-5 py-3 bg-brand-50 rounded-2xl text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint resize-none" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Fee (₱)</label>
              <input type="number" value={form.fee || ''} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
                placeholder="0" className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Downpayment (₱)</label>
              <input type="number" value={form.downpayment || ''} onChange={(e) => setForm({ ...form, downpayment: Number(e.target.value) })}
                placeholder="0" className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 h-12 rounded-full text-sm font-medium text-gray-500 ring-1 ring-brand-100 hover:ring-gray-300 transition-all">Cancel</button>
            <button onClick={handleAdd} disabled={!form.name.trim() || !form.clientId}
              className="flex-1 h-12 rounded-full text-sm font-medium bg-green-primary text-white hover:bg-green-dark transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Project Modal ── */}
      <Modal
        open={editingProject !== null}
        onClose={() => setEditingProject(null)}
        title={`Edit ${editingProject?.name || 'Project'}`}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Project Name <span className="text-green-primary">*</span>
            </label>
            <input
              autoFocus
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
              placeholder="e.g. Pharmacy Inventory System"
              className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as ProjectType })}
                className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 outline-none focus:ring-2 focus:ring-green-mint">
                {TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Deadline</label>
              <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 outline-none focus:ring-2 focus:ring-green-mint" />
            </div>
          </div>

          {editForm.type === 'other' && (
            <input value={editForm.typeOther} onChange={(e) => setEditForm({ ...editForm, typeOther: e.target.value })}
              placeholder="Specify type..." className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
          )}

          <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="Description" rows={2}
            className="w-full px-5 py-3 bg-brand-50 rounded-2xl text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint resize-none" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Fee (₱)</label>
              <input type="number" value={editForm.fee || ''} onChange={(e) => setEditForm({ ...editForm, fee: Number(e.target.value) })}
                placeholder="0" className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Downpayment (₱)</label>
              <input type="number" value={editForm.downpayment || ''} onChange={(e) => setEditForm({ ...editForm, downpayment: Number(e.target.value) })}
                placeholder="0" className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditingProject(null)}
              className="flex-1 h-12 rounded-full text-sm font-medium text-gray-500 ring-1 ring-brand-100 hover:ring-gray-300 transition-all">Cancel</button>
            <button onClick={handleEditSave} disabled={!editForm.name.trim()}
              className="flex-1 h-12 rounded-full text-sm font-medium bg-green-primary text-white hover:bg-green-dark transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              <Pencil size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
