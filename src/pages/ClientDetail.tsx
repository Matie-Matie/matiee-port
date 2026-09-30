import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, ExternalLink, FolderPlus, Mail, Pencil, Search, Trash2 } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { projectFinance } from '../lib/finance';
import { fmtDateLong } from '../lib/format';
import { fadeUp, stagger } from '../lib/motion';
import { R } from '../routes';
import { Button, IconButton, LinkButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { Input } from '../ui/Field';
import { Money } from '../ui/Money';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/toast';
import PrivateText from '../components/PrivateText';
import { usePrivacy } from '../lib/usePrivacy';
import { ClientFields } from '../components/ClientForm';
import { clientFormFrom, emptyClientForm, type ClientFormState } from '../components/clientFormState';
import { ProjectFields, StatusPicker } from '../components/ProjectForm';
import { emptyProjectForm, projectFormFrom, type ProjectFormState } from '../components/projectFormState';
import { ProjectPanel } from './client/ProjectPanel';
import type { Project, ProjectStatus } from '../types';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { name: pname } = usePrivacy();
  const navigate = useNavigate();

  const clients = useMatieeStore((s) => s.clients);
  const allProjects = useMatieeStore((s) => s.projects);
  const allNotes = useMatieeStore((s) => s.notes);
  const updateClient = useMatieeStore((s) => s.updateClient);
  const deleteClient = useMatieeStore((s) => s.deleteClient);
  const addProject = useMatieeStore((s) => s.addProject);
  const updateProject = useMatieeStore((s) => s.updateProject);
  const deleteProject = useMatieeStore((s) => s.deleteProject);
  const addNote = useMatieeStore((s) => s.addNote);
  const deleteNote = useMatieeStore((s) => s.deleteNote);

  const client = clients.find((c) => c.id === id);
  const projects = useMemo(() => allProjects.filter((p) => p.clientId === id), [allProjects, id]);
  const notes = useMemo(() => allNotes.filter((n) => n.clientId === id), [allNotes, id]);
  const fin = useMemo(() => projectFinance(projects), [projects]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ClientFormState>(emptyClientForm);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState<ProjectFormState>(emptyProjectForm());
  const [editing, setEditing] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<ProjectFormState>(emptyProjectForm());
  const [editStatus, setEditStatus] = useState<ProjectStatus>('pending');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteClientOpen, setDeleteClientOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  if (!client || !id) {
    return (
      <Card bezel pad="none">
        <EmptyState
          icon={Search}
          title="Client not found"
          description="This client might have been deleted."
          action={<LinkButton to={R.clients} size="sm">Back to clients</LinkButton>}
        />
      </Card>
    );
  }

  function saveProfile() {
    if (!profileForm.name.trim() || !id) return;
    updateClient(id, {
      name: profileForm.name.trim(),
      contact: profileForm.contact.trim(),
      email: profileForm.email.trim(),
      notes: profileForm.notes.trim(),
      photo: profileForm.photo || undefined,
    });
    setProfileOpen(false);
    toast('Profile updated', 'success');
  }

  function createProject() {
    if (!newForm.name.trim() || !id) return;
    addProject({
      clientId: id,
      name: newForm.name.trim(),
      type: newForm.type,
      typeOther: newForm.type === 'other' ? newForm.typeOther : undefined,
      description: newForm.description.trim(),
      deadline: newForm.deadline,
      fee: newForm.fee,
      downpayment: newForm.downpayment,
      downpaymentPaid: false,
      remainingPaid: false,
      reminder: false,
      progress: 0,
      status: 'pending',
    });
    setNewOpen(false);
    toast('Project created', 'success');
  }

  function saveProject() {
    if (!editing || !editForm.name.trim()) return;
    updateProject(editing.id, {
      name: editForm.name.trim(),
      type: editForm.type,
      typeOther: editForm.type === 'other' ? editForm.typeOther : undefined,
      description: editForm.description.trim(),
      deadline: editForm.deadline,
      fee: editForm.fee,
      downpayment: editForm.downpayment,
      status: editStatus,
    });
    setEditing(null);
    toast('Project updated', 'success');
  }

  function submitNote() {
    if (!noteText.trim() || !id) return;
    addNote({ clientId: id, content: noteText.trim() });
    setNoteText('');
  }

  const projToDelete = projects.find((p) => p.id === deleteProjectId);

  const stats = [
    { label: 'Projects', node: <span className="tabular-nums">{projects.length}</span> },
    { label: 'Billed', node: <Money value={fin.pipelineValue} /> },
    { label: 'Collected', node: <Money value={fin.totalRevenue} /> },
    { label: 'Outstanding', node: <Money value={fin.outstanding} /> },
  ];

  return (
    <div>
      <Link to={R.clients} className="group mb-5 inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-[13px] font-medium text-mute transition-colors hover:text-ink">
        <ArrowLeft size={15} strokeWidth={1.75} className="transition-transform duration-500 ease-matie group-hover:-translate-x-1" />
        Clients
      </Link>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
        <Card bezel pad="none" className="mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar name={client.name} photo={client.photo} size={88} className="mx-auto md:mx-0" />
              <div className="min-w-0 flex-1 text-center md:text-left">
                <div className="flex items-start justify-center gap-2 md:justify-between">
                  <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink md:text-[36px]">
                    <PrivateText type="name">{client.name}</PrivateText>
                  </h1>
                  <div className="hidden shrink-0 gap-1.5 md:flex">
                    <Button variant="secondary" size="sm" leading={<Pencil size={14} strokeWidth={1.75} />} onClick={() => { setProfileForm(clientFormFrom(client)); setProfileOpen(true); }}>
                      Edit
                    </Button>
                    <IconButton size="sm" tone="danger" label="Delete client" className="!h-9 !w-9" onClick={() => setDeleteClientOpen(true)}>
                      <Trash2 size={15} strokeWidth={1.75} />
                    </IconButton>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-mute md:justify-start">
                  {client.contact && (
                    <a href={client.contact.startsWith('http') ? client.contact : `https://${client.contact}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-brand-700">
                      <ExternalLink size={14} strokeWidth={1.6} />
                      <span className="max-w-[240px] truncate"><PrivateText type="name">{client.contact}</PrivateText></span>
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 transition-colors hover:text-brand-700">
                      <Mail size={14} strokeWidth={1.6} /> <PrivateText type="name">{client.email}</PrivateText>
                    </a>
                  )}
                  <span className="flex items-center gap-1.5"><CalendarDays size={14} strokeWidth={1.6} /> Client since {fmtDateLong(client.createdAt)}</span>
                </div>

                {client.notes && <p className="mt-4 rounded-2xl bg-paper-2 p-4 text-left text-sm leading-relaxed text-ink-2 ring-1 ring-ink/[0.05]">{client.notes}</p>}

                <div className="mt-5 flex justify-center gap-2 md:hidden">
                  <Button variant="secondary" size="sm" leading={<Pencil size={14} strokeWidth={1.75} />} onClick={() => { setProfileForm(clientFormFrom(client)); setProfileOpen(true); }}>Edit</Button>
                  <Button variant="ghost" size="sm" leading={<Trash2 size={14} strokeWidth={1.75} />} onClick={() => setDeleteClientOpen(true)}>Delete</Button>
                </div>
              </div>
            </div>

            <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-ink/[0.07] pt-6 md:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className={i > 0 ? 'md:border-l md:border-ink/[0.07] md:pl-5' : ''}>
                  <dt className="text-xs text-mute">{s.label}</dt>
                  <dd className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-ink">{s.node}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </motion.div>

      {/* Projects */}
      <section aria-labelledby="proj-h" className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="proj-h" className="text-xl font-semibold tracking-[-0.03em] text-ink">
            Projects <span className="ml-1 text-base font-normal text-mute">{projects.length}</span>
          </h2>
          <Button size="sm" leading={<FolderPlus size={15} strokeWidth={1.75} />} onClick={() => { setNewForm(emptyProjectForm(id)); setNewOpen(true); }}>
            New project
          </Button>
        </div>
        {projects.length === 0 ? (
          <Card bezel pad="none">
            <EmptyState icon={FolderPlus} title="No projects yet" description="Add the first project for this client." action={<Button size="sm" onClick={() => { setNewForm(emptyProjectForm(id)); setNewOpen(true); }}>New project</Button>} />
          </Card>
        ) : (
          <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {projects.map((p) => (
              <motion.div key={p.id} variants={fadeUp} className="min-w-0 [&>*]:h-full">
                <ProjectPanel
                  project={p}
                  onEdit={() => { setEditForm(projectFormFrom(p)); setEditStatus(p.status); setEditing(p); }}
                  onDelete={() => setDeleteProjectId(p.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Notes */}
      <section aria-labelledby="notes-h">
        <h2 id="notes-h" className="mb-4 text-xl font-semibold tracking-[-0.03em] text-ink">Notes</h2>
        <form onSubmit={(e) => { e.preventDefault(); submitNote(); }} className="mb-4 flex gap-2">
          <Input aria-label="New note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Jot something down about this client…" className="h-12 bg-paper" />
          <Button type="submit" size="lg" disabled={!noteText.trim()}>Add</Button>
        </form>
        {notes.length === 0 ? (
          <p className="py-6 text-center text-sm text-mute">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {[...notes].reverse().map((n) => (
              <li key={n.id} className="group flex items-start gap-3 rounded-[20px] bg-paper p-4 shadow-soft ring-1 ring-ink/[0.06]">
                <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">{n.content}</p>
                <span className="shrink-0 pt-0.5 text-[11px] text-mute">{fmtDateLong(n.createdAt)}</span>
                <IconButton size="sm" tone="danger" label="Delete note" onClick={() => { deleteNote(n.id); toast('Note deleted'); }}>
                  <Trash2 size={13} strokeWidth={1.75} />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Edit client"
        footer={<><Button variant="ghost" onClick={() => setProfileOpen(false)}>Cancel</Button><Button onClick={saveProfile} disabled={!profileForm.name.trim()}>Save changes</Button></>}
      >
        <ClientFields value={profileForm} onChange={setProfileForm} onSubmit={saveProfile} />
      </Modal>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New project"
        description={`For ${pname(client.name)}`}
        footer={<><Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={createProject} disabled={!newForm.name.trim()}>Create project</Button></>}
      >
        <ProjectFields value={newForm} onChange={setNewForm} onSubmit={createProject} />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name ?? 'project'}`}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveProject} disabled={!editForm.name.trim()}>Save changes</Button></>}
      >
        <div className="flex flex-col gap-4">
          <ProjectFields value={editForm} onChange={setEditForm} onSubmit={saveProject} />
          <StatusPicker value={editStatus} onChange={setEditStatus} />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteProjectId !== null}
        onClose={() => setDeleteProjectId(null)}
        title={`Delete ${projToDelete?.name ?? 'project'}?`}
        description="This also removes its payments and attached files."
        onConfirm={() => { if (deleteProjectId) deleteProject(deleteProjectId); toast('Project deleted'); }}
      />
      <ConfirmDialog
        open={deleteClientOpen}
        onClose={() => setDeleteClientOpen(false)}
        title={`Delete ${pname(client.name)}?`}
        description={projects.length ? `This also removes ${projects.length} project${projects.length === 1 ? '' : 's'}, their payments and notes.` : 'This removes the client and their notes.'}
        onConfirm={() => {
          deleteClient(client.id);
          toast('Client deleted');
          navigate(R.clients);
        }}
      />
    </div>
  );
}
