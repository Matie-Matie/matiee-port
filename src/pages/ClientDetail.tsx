import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Pencil, Check, X, ExternalLink, Mail, FileText, Camera, Bell, BellRing, Paperclip, Download } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, type ProjectType, type ProjectStatus } from '../types';
import Reveal from '../components/Reveal';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const TYPE_OPTIONS: ProjectType[] = ['prescription', 'lending', 'inventory', 'attendance', 'other'];

const STATUS_BG: Record<ProjectStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  'in-progress': 'bg-blue-50 text-blue-700',
  completed: 'bg-green-mint/50 text-green-dark',
  'on-hold': 'bg-brand-50 text-gray-500',
};

function formatDate(d: string | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clients = useMatieeStore((s) => s.clients);
  const allProjects = useMatieeStore((s) => s.projects);
  const allNotes = useMatieeStore((s) => s.notes);
  const allPayments = useMatieeStore((s) => s.payments);

  const client = clients.find((c) => c.id === id);
  const projects = allProjects.filter((p) => p.clientId === id);
  const notes = allNotes.filter((n) => n.clientId === id);

  const updateClient = useMatieeStore((s) => s.updateClient);
  const addProject = useMatieeStore((s) => s.addProject);
  const updateProject = useMatieeStore((s) => s.updateProject);
  const deleteProject = useMatieeStore((s) => s.deleteProject);
  const addNote = useMatieeStore((s) => s.addNote);
  const deleteNote = useMatieeStore((s) => s.deleteNote);
  const addPayment = useMatieeStore((s) => s.addPayment);
  const deletePayment = useMatieeStore((s) => s.deletePayment);
  const addAttachment = useMatieeStore((s) => s.addAttachment);
  const deleteAttachment = useMatieeStore((s) => s.deleteAttachment);
  const allAttachments = useMatieeStore((s) => s.attachments);

  const getPaymentsByProject = (projectId: string) =>
    allPayments.filter((p) => p.projectId === projectId);
  const getAttachmentsByProject = (projectId: string) =>
    allAttachments.filter((a) => a.projectId === projectId);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', contact: '', email: '', notes: '', photo: '' });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const handleFileUpload = (projectId: string) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    // Warn if > 4 MB (localStorage can get bloated)
    if (file.size > 4 * 1024 * 1024) {
      alert('File is too large. Please keep files under 4 MB for local storage.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      addAttachment(projectId, {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
      });
      setUploadingFor(null);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (attachment: { name: string; data: string }) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [projectForm, setProjectForm] = useState({
    name: '', type: 'other' as ProjectType, typeOther: '',
    description: '', deadline: '', fee: 0, downpayment: 0,
  });

  const [paymentForm, setPaymentForm] = useState({ amount: 0, date: '', notes: '' });
  const [editingProject, setEditingProject] = useState<string | null>(null);

  // ── Edit project form state ──
  const [editForm, setEditForm] = useState({
    name: '', type: 'other' as ProjectType, typeOther: '',
    description: '', deadline: '', fee: 0, downpayment: 0, progress: 0,
  });

  const startEditProject = (project: typeof projects[0]) => {
    setEditForm({
      name: project.name,
      type: project.type,
      typeOther: project.typeOther || '',
      description: project.description,
      deadline: project.deadline,
      fee: project.fee,
      downpayment: project.downpayment,
      progress: project.progress,
    });
    setEditingProject(editingProject === project.id ? null : project.id);
  };

  const saveEditProject = () => {
    if (!editingProject || !editForm.name.trim()) return;
    updateProject(editingProject, {
      name: editForm.name.trim(),
      type: editForm.type,
      typeOther: editForm.type === 'other' ? editForm.typeOther : undefined,
      description: editForm.description.trim(),
      deadline: editForm.deadline,
      fee: editForm.fee,
      downpayment: editForm.downpayment,
      progress: editForm.progress,
    });
    setEditingProject(null);
  };

  if (!client) {
    return (
      <div className="pt-16 text-center">
        <EmptyState
          icon="🔍"
          title="Client not found"
          description="This client might have been deleted."
          action={
            <button onClick={() => navigate('/clients')} className="h-12 px-6 bg-green-primary text-white text-sm font-medium rounded-full">Back to Clients</button>
          }
        />
      </div>
    );
  }

  const projectCount = projects.length;

  const handleAddProject = () => {
    if (!projectForm.name.trim()) return;
    addProject({
      clientId: id!, name: projectForm.name.trim(), type: projectForm.type,
      typeOther: projectForm.type === 'other' ? projectForm.typeOther : undefined,
      description: projectForm.description.trim(), deadline: projectForm.deadline,
      fee: projectForm.fee, downpayment: projectForm.downpayment, downpaymentPaid: false, remainingPaid: false, reminder: false,
      progress: 0, status: 'pending',
    });
    setProjectForm({ name: '', type: 'other', typeOther: '', description: '', deadline: '', fee: 0, downpayment: 0 });
    setShowProjectForm(false);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote({ clientId: id!, content: noteText.trim() });
    setNoteText('');
  };

  const handleAddPayment = (projectId: string) => {
    if (!paymentForm.amount || !paymentForm.date) return;
    addPayment({ projectId, amount: paymentForm.amount, date: paymentForm.date, notes: paymentForm.notes.trim() });
    setPaymentForm({ amount: 0, date: '', notes: '' });
    setShowPayment(null);
  };

  const startEditing = () => {
    setProfileForm({ name: client.name, contact: client.contact, email: client.email, notes: client.notes, photo: client.photo || '' });
    setEditingProfile(true);
  };

  const saveProfile = () => {
    if (!profileForm.name.trim() || !id) return;
    updateClient(id, {
      name: profileForm.name.trim(),
      contact: profileForm.contact.trim(),
      email: profileForm.email.trim(),
      notes: profileForm.notes.trim(),
      photo: profileForm.photo || undefined,
    });
    setEditingProfile(false);
  };

  const cancelEditing = () => {
    setEditingProfile(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm({ ...profileForm, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* ── Back ── */}
      <Reveal y={10} duration={0.3}>
        <button onClick={() => navigate('/clients')} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors mb-6">
          <ChevronLeft size={14} />
          Back to Clients
        </button>
      </Reveal>

      {/* ── Profile Card ── */}
      <Reveal y={15} duration={0.4}>
        <div className="bg-white rounded-[22px] shadow-card p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0 shadow-md bg-gradient-to-br from-green-primary to-green-dark">
              {client.photo ? (
                <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-green-mint" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              {editingProfile ? (
                /* ── Inline Edit Form ── */
                <div className="flex flex-col gap-3">
                  {/* Photo Edit */}
                  <div className="flex items-center gap-4 mb-1">
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-primary to-green-dark flex-shrink-0 cursor-pointer group ring-2 ring-brand-100 hover:ring-green-mint transition-all"
                    >
                      {profileForm.photo ? (
                        <img src={profileForm.photo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                          {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera size={14} className="text-white" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-left">
                      <button onClick={() => photoInputRef.current?.click()} className="font-medium text-green-primary hover:text-green-dark transition-colors">Change photo</button>
                      {profileForm.photo && (
                        <button onClick={() => setProfileForm({ ...profileForm, photo: '' })} className="font-medium text-gray-400 hover:text-status-red transition-colors ml-3">Remove</button>
                      )}
                    </div>
                    <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  </div>

                  <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Client Name"
                    className="w-full h-11 px-4 bg-brand-50 rounded-[999px] text-sm font-semibold text-navy-900 outline-none focus:ring-2 focus:ring-green-mint" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={profileForm.contact} onChange={(e) => setProfileForm({ ...profileForm, contact: e.target.value })}
                      placeholder="FB, Instagram (paste link)"
                      className="w-full h-11 px-4 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
                    <input value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Email"
                      className="w-full h-11 px-4 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
                  </div>
                  <textarea value={profileForm.notes} onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                    placeholder="Notes"
                    rows={2}
                    className="w-full px-4 py-3 bg-brand-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-mint resize-none" />
                  <div className="flex items-center gap-2">
                    <button onClick={saveProfile} disabled={!profileForm.name.trim()}
                      className="h-10 px-5 bg-green-primary hover:bg-green-dark text-white text-xs font-medium rounded-full transition-all disabled:opacity-40 flex items-center gap-1.5">
                      <Check size={14} /> Save
                    </button>
                    <button onClick={cancelEditing}
                      className="h-10 px-5 ring-1 ring-brand-100 hover:ring-gray-300 text-gray-500 text-xs font-medium rounded-full transition-all flex items-center gap-1.5">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-2xl font-bold text-navy-900">{client.name}</h1>
                    <button onClick={startEditing}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-green-primary hover:bg-green-mint/30 transition-all">
                      <Pencil size={14} />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 mt-2">
                    {client.contact && (
                      <a href={client.contact.startsWith('http') ? client.contact : `https://${client.contact}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-primary transition-colors">
                        <ExternalLink size={13} /> {client.contact.length > 30 ? client.contact.slice(0, 30) + '...' : client.contact}
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-primary transition-colors">
                        <Mail size={13} /> {client.email}
                      </a>
                    )}
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                      <FileText size={13} /> Client since {formatDate(client.createdAt)}
                    </span>
                  </div>

                  {/* Notes */}
                  {client.notes && (
                    <div className="mt-4 bg-brand-50 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed text-left">
                      {client.notes}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Projects ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900">Projects ({projectCount})</h2>
          <button onClick={() => setShowProjectForm(true)} className="flex items-center gap-1.5 h-10 px-5 bg-green-primary hover:bg-green-dark text-white text-xs font-medium rounded-full transition-all shadow-sm">
            <Plus size={14} />
            New Project
          </button>
        </div>

        {projectCount === 0 ? (
          <EmptyState icon="💼" title="No projects yet" description="Add your first project for this client." />
        ) : (
          <div className="space-y-3">
            {projects.map((project, i) => {
              const projPayments = getPaymentsByProject(project.id);
              const totalPaidAmt = projPayments.reduce((s, p) => s + p.amount, 0);
              const remaining = project.remainingPaid ? 0 : project.fee - totalPaidAmt;
              const due = project.deadline ? new Date(project.deadline) : null;
              const isOverdue = due && due < new Date() && project.status !== 'completed';

              return (
                <Reveal key={project.id} y={15} delay={0.04 * i} duration={0.3}>
                  <motion.div whileHover={{ scale: 1.002 }} className="p-5 bg-white rounded-[22px] shadow-card">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${project.status === 'pending' ? 'bg-amber-400' : project.status === 'in-progress' ? 'bg-blue-400' : project.status === 'completed' ? 'bg-green-primary' : 'bg-gray-300'} flex-shrink-0`} />
                        <div>
                          <p className="text-sm font-semibold text-navy-900">{project.name}</p>
                          <p className="text-xs text-gray-500">{PROJECT_TYPE_LABELS[project.type]}{project.type === 'other' && project.typeOther ? ` — ${project.typeOther}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
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
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BG[project.status]}`}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                        {project.status === 'completed' && !project.remainingPaid && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-status-red/10 text-status-red">
                            Unpaid
                          </span>
                        )}
                        <button onClick={() => startEditProject(project)} className="p-1.5 rounded-full hover:bg-brand-50 text-gray-300 hover:text-navy-900 transition-all">
                          <Pencil size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Project Body */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-gray-500">Fee</span><p className="font-semibold text-navy-900">₱{project.fee.toLocaleString()}</p></div>
                      <div><span className="text-gray-500">Paid</span><p className="font-semibold text-green-primary">₱{totalPaidAmt.toLocaleString()}</p></div>
                      <div><span className="text-gray-500">Remaining</span>{project.remainingPaid ? (
                        <p className="font-semibold text-green-primary">✅ Paid</p>
                      ) : (
                        <p className={`font-semibold ${remaining > 0 ? 'text-amber-600' : 'text-gray-500'}`}>₱{remaining.toLocaleString()}</p>
                      )}</div>
                      <div><span className="text-gray-500">Deadline</span><p className={`font-semibold ${isOverdue ? 'text-status-red' : 'text-navy-900'}`}>{formatDate(project.deadline)}{isOverdue ? ' ⚠️' : ''}</p></div>
                    </div>

                    {/* Downpayment Status */}
                    {project.downpayment > 0 && (
                      <div className="mt-3 pt-3 border-t border-brand-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Downpayment:</span>
                          <span className="text-xs font-semibold text-navy-900">₱{project.downpayment.toLocaleString()}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            project.downpaymentPaid
                              ? 'bg-green-mint/50 text-green-dark'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {project.downpaymentPaid ? '✅ Paid' : '⏳ Unpaid'}
                          </span>
                        </div>
                        <button
                          onClick={() => updateProject(project.id, { downpaymentPaid: !project.downpaymentPaid })}
                          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all ${
                            project.downpaymentPaid
                              ? 'bg-brand-50 text-gray-500 hover:bg-amber-50 hover:text-amber-700'
                              : 'bg-green-mint/50 text-green-dark hover:bg-green-primary hover:text-white'
                          }`}
                        >
                          {project.downpaymentPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </div>
                    )}

                    {/* Progress Slider — always visible, interactive */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-navy-900">{project.progress}%</span>
                      </div>
                      <div className="relative h-2 bg-brand-50 rounded-full overflow-hidden">
                        {/* Filled track */}
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-primary to-green-light rounded-full pointer-events-none"
                          style={{ width: `${project.progress}%` }}
                        />
                        {/* Hidden range input for interaction */}
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={project.progress}
                          onChange={(e) => updateProject(project.id, { progress: Number(e.target.value) })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && <p className="mt-3 text-xs text-gray-500">{project.description}</p>}

                    {/* Paid Status Toggle */}
                    {project.status === 'completed' && (
                      <div className="mt-3 pt-3 border-t border-brand-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Payment:</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            project.remainingPaid
                              ? 'bg-green-mint/50 text-green-dark'
                              : 'bg-status-red/10 text-status-red'
                          }`}>
                            {project.remainingPaid ? '✅ Paid' : '❌ Unpaid'}
                          </span>
                        </div>
                        <button
                          onClick={() => updateProject(project.id, { remainingPaid: !project.remainingPaid })}
                          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all ${
                            project.remainingPaid
                              ? 'bg-brand-50 text-gray-500 hover:bg-amber-50 hover:text-amber-700'
                              : 'bg-green-mint/50 text-green-dark hover:bg-green-primary hover:text-white'
                          }`}
                        >
                          {project.remainingPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </div>
                    )}

                    {/* Payments + Delete */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-brand-50">
                      <button onClick={() => setShowPayment(showPayment === project.id ? null : project.id)} className="text-xs font-medium text-green-primary hover:text-green-dark transition-colors">
                        {showPayment === project.id ? 'Hide Payments' : `Payments (${projPayments.length})`}
                      </button>
                      <button onClick={() => setDeleteConfirm(project.id)} className="text-xs font-medium text-gray-300 hover:text-status-red transition-colors ml-auto">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Payment List */}
                    {showPayment === project.id && (
                      <div className="mt-3 pt-3 border-t border-brand-50 space-y-2">
                        {projPayments.length === 0 ? (
                          <p className="text-xs text-gray-500">No payments recorded yet.</p>
                        ) : (
                          projPayments.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-xs bg-brand-50 p-3 rounded-xl">
                              <div>
                                <span className="font-semibold text-navy-900">₱{p.amount.toLocaleString()}</span>
                                <span className="text-gray-500 ml-2">{formatDate(p.date)}</span>
                                {p.notes && <span className="text-gray-500 ml-2">— {p.notes}</span>}
                              </div>
                              <button onClick={() => deletePayment(p.id)} className="text-gray-300 hover:text-status-red transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))
                        )}
                        <button onClick={() => handleAddPayment(project.id)} className="text-xs font-medium text-green-primary hover:text-green-dark transition-colors">+ Add Payment</button>
                      </div>
                    )}

                    {/* ── Attachments ── */}
                    <div className="mt-3 pt-3 border-t border-brand-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Paperclip size={13} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Attachments ({getAttachmentsByProject(project.id).length})
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setUploadingFor(uploadingFor === project.id ? null : project.id);
                            // Clear previous file selection when toggling
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-xs font-medium text-green-primary hover:text-green-dark transition-colors"
                        >
                          {uploadingFor === project.id ? 'Cancel' : '+ Add File'}
                        </button>
                      </div>

                      {/* Upload input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip"
                        className="hidden"
                        onChange={() => uploadingFor && handleFileUpload(uploadingFor)}
                      />

                      {uploadingFor === project.id && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-brand-50 rounded-xl">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 h-10 px-4 text-xs font-medium text-green-primary bg-white rounded-xl border border-dashed border-green-mint hover:bg-green-mint/20 transition-colors"
                          >
                            Choose file…
                          </button>
                          <span className="text-[11px] text-gray-400">Max 4 MB</span>
                        </div>
                      )}

                      {/* File list */}
                      {getAttachmentsByProject(project.id).length > 0 && (
                        <div className="space-y-1.5 mt-1">
                          {getAttachmentsByProject(project.id).map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-xl text-xs group"
                            >
                              <FileText size={13} className="text-gray-400 shrink-0" />
                              <span className="flex-1 min-w-0 truncate text-navy-900 font-medium">
                                {att.name}
                              </span>
                              <span className="text-gray-400 shrink-0">
                                {(att.size / 1024).toFixed(0)} KB
                              </span>
                              <button
                                onClick={() => downloadFile(att)}
                                className="p-1 rounded-lg text-gray-300 hover:text-green-primary hover:bg-green-mint/30 transition-all opacity-0 group-hover:opacity-100"
                                title="Download"
                              >
                                <Download size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove "${att.name}"?`)) deleteAttachment(att.id);
                                }}
                                className="p-1 rounded-lg text-gray-300 hover:text-status-red hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Inline Edit — Full project form */}
                    {editingProject === project.id && (
                      <div className="mt-3 pt-3 border-t border-brand-50 space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Project Name</label>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Project name"
                            className="w-full h-10 px-4 bg-brand-50 rounded-[999px] text-sm text-navy-900 outline-none focus:ring-2 focus:ring-green-mint"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as ProjectType })}
                              className="w-full h-10 px-4 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint">
                              {TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Deadline</label>
                            <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                              className="w-full h-10 px-4 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
                          </div>
                        </div>

                        {editForm.type === 'other' && (
                          <input value={editForm.typeOther} onChange={(e) => setEditForm({ ...editForm, typeOther: e.target.value })}
                            placeholder="Specify type..." className="w-full h-10 px-4 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
                        )}

                        <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description" rows={2}
                          className="w-full px-4 py-2.5 bg-brand-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-green-mint resize-none" />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Fee (₱)</label>
                            <input type="number" value={editForm.fee || ''} onChange={(e) => setEditForm({ ...editForm, fee: Number(e.target.value) })}
                              className="w-full h-10 px-4 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Downpayment (₱)</label>
                            <input type="number" value={editForm.downpayment || ''} onChange={(e) => setEditForm({ ...editForm, downpayment: Number(e.target.value) })}
                              className="w-full h-10 px-4 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
                          </div>
                        </div>

                        {/* Status quick controls */}
                        <div className="pt-2 border-t border-brand-50">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500">Status:</span>
                            {(Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]).map(([key, label]) => (
                              <button key={key} onClick={() => updateProject(project.id, { status: key })}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all ${project.status === key ? 'bg-green-primary text-white' : 'bg-brand-50 text-gray-500 hover:bg-gray-200'}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Save / Cancel */}
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => setEditingProject(null)}
                            className="flex-1 h-10 rounded-full text-xs font-medium text-gray-500 ring-1 ring-brand-100 hover:ring-gray-300 transition-all">
                            Cancel
                          </button>
                          <button onClick={saveEditProject} disabled={!editForm.name.trim()}
                            className="flex-1 h-10 rounded-full text-xs font-medium bg-green-primary text-white hover:bg-green-dark transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
                            <Check size={14} />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Notes ── */}
      <div>
        <h2 className="text-lg font-bold text-navy-900 mb-4">Notes</h2>
        <div className="flex gap-2 mb-4">
          <input value={noteText} onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            placeholder="Add a note..."
            className="flex-1 h-12 px-5 bg-white rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 shadow-card outline-none focus:ring-2 focus:ring-green-mint transition-all" />
          <button onClick={handleAddNote} disabled={!noteText.trim()}
            className="h-12 px-6 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all disabled:opacity-40">Add</button>
        </div>

        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No notes yet.</p>
          ) : (
            [...notes].reverse().map((note) => (
              <div key={note.id} className="flex items-start gap-3 p-4 bg-white rounded-[22px] shadow-card">
                <p className="flex-1 text-sm text-navy-900">{note.content}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-gray-500">{formatDate(note.createdAt)}</span>
                  <button onClick={() => deleteNote(note.id)} className="text-gray-300 hover:text-status-red transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── New Project Modal ── */}
      <Modal open={showProjectForm} onClose={() => setShowProjectForm(false)} title="New Project">
        <div className="flex flex-col gap-4">
          <input autoFocus value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            placeholder="Project Name *"
            className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint" />
          <select value={projectForm.type} onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value as ProjectType })}
            className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 outline-none focus:ring-2 focus:ring-green-mint">
            {TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>))}
          </select>
          {projectForm.type === 'other' && (
            <input value={projectForm.typeOther} onChange={(e) => setProjectForm({ ...projectForm, typeOther: e.target.value })}
              placeholder="Specify type..." className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" />
          )}
          <textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            placeholder="Description" rows={2}
            className="w-full px-5 py-3 bg-brand-50 rounded-2xl text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">Fee (₱)</label>
              <input type="number" value={projectForm.fee || ''} onChange={(e) => setProjectForm({ ...projectForm, fee: Number(e.target.value) })}
                placeholder="0" className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Downpayment (₱)</label>
              <input type="number" value={projectForm.downpayment || ''} onChange={(e) => setProjectForm({ ...projectForm, downpayment: Number(e.target.value) })}
                placeholder="0" className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" /></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Deadline</label>
            <input type="date" value={projectForm.deadline} onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
              className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm outline-none focus:ring-2 focus:ring-green-mint" /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowProjectForm(false)} className="flex-1 h-12 rounded-full text-sm font-medium text-gray-500 ring-1 ring-brand-100">Cancel</button>
            <button onClick={handleAddProject} disabled={!projectForm.name.trim()}
              className="flex-1 h-12 rounded-full text-sm font-medium bg-green-primary text-white hover:bg-green-dark disabled:opacity-40 flex items-center justify-center gap-2">
              <Plus size={16} /> Create
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete Project?">
        <p className="text-sm text-gray-500 mb-6">This will also remove all payments linked to this project.</p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 rounded-full text-sm font-medium text-gray-500 ring-1 ring-brand-100">Cancel</button>
          <button onClick={() => { if (deleteConfirm) deleteProject(deleteConfirm); setDeleteConfirm(null); }}
            className="flex-1 h-12 rounded-full text-sm font-medium bg-status-red text-white hover:bg-red-600">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
