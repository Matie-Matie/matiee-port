import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, BellRing, CalendarClock, FolderKanban, Paperclip, Pencil, Plus, Search } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { PROJECT_TYPE_LABELS, type Project, type ProjectStatus } from '../types';
import { R } from '../routes';
import { daysUntil, fmtDate } from '../lib/format';
import { fadeUp, stagger } from '../lib/motion';
import { cn } from '../lib/cn';
import { PageHeader } from '../ui/PageHeader';
import { Button, IconButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Bar } from '../ui/Progress';
import { EmptyState } from '../ui/EmptyState';
import { Input, Select } from '../ui/Field';
import { Money } from '../ui/Money';
import { Segmented } from '../ui/Segmented';
import Modal from '../ui/Modal';
import { toast } from '../ui/toast';
import PrivateText from '../components/PrivateText';
import { ProjectStatusBadge } from '../components/StatusBadge';
import { ClientPicker, ProjectFields, StatusPicker } from '../components/ProjectForm';
import { emptyProjectForm, projectFormFrom, type ProjectFormState } from '../components/projectFormState';

type Filter = 'all' | ProjectStatus;
type Sort = 'newest' | 'deadline' | 'fee';

export default function Projects() {
  const clients = useMatieeStore((s) => s.clients);
  const projects = useMatieeStore((s) => s.projects);
  const attachments = useMatieeStore((s) => s.attachments);
  const addProject = useMatieeStore((s) => s.addProject);
  const updateProject = useMatieeStore((s) => s.updateProject);
  const addClient = useMatieeStore((s) => s.addClient);

  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const [query, setQuery] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ProjectFormState>(emptyProjectForm());
  const [pickerKey, setPickerKey] = useState(0);

  const [editing, setEditing] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<ProjectFormState>(emptyProjectForm());
  const [editStatus, setEditStatus] = useState<ProjectStatus>('pending');

  // Deep link from Quick add / command palette: /app/projects?new=1
  useEffect(() => {
    if (params.get('new')) {
      openCreate();
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  function openCreate() {
    setCreateForm(emptyProjectForm());
    setPickerKey((k) => k + 1);
    setCreateOpen(true);
  }

  function handleCreate() {
    if (!createForm.name.trim() || !createForm.clientId) return;
    addProject({
      clientId: createForm.clientId,
      name: createForm.name.trim(),
      type: createForm.type,
      typeOther: createForm.type === 'other' ? createForm.typeOther : undefined,
      description: createForm.description.trim(),
      deadline: createForm.deadline,
      fee: createForm.fee,
      downpayment: createForm.downpayment,
      downpaymentPaid: false,
      remainingPaid: false,
      reminder: false,
      progress: 0,
      status: 'pending',
    });
    setCreateOpen(false);
    toast('Project created', 'success');
  }

  function openEdit(p: Project) {
    setEditForm(projectFormFrom(p));
    setEditStatus(p.status);
    setEditing(p);
  }

  function handleEdit() {
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

  const nameById = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients]);
  const clientName = (id: string) => nameById.get(id) ?? 'Unknown client';

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: projects.length, pending: 0, 'in-progress': 0, completed: 0, 'on-hold': 0 };
    projects.forEach((p) => (c[p.status] += 1));
    return c;
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter((p) => (filter === 'all' || p.status === filter) && (!q || `${p.name} ${nameById.get(p.clientId) ?? ''}`.toLowerCase().includes(q)));
    return list.sort((a, b) => {
      if (sort === 'fee') return b.fee - a.fee;
      if (sort === 'deadline') {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return da - db;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [projects, nameById, filter, query, sort]);

  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? '' : 's'} across ${clients.length} client${clients.length === 1 ? '' : 's'}.`}
        actions={
          <Button size="lg" trailing={<Plus size={16} strokeWidth={2} />} onClick={openCreate}>
            Add project
          </Button>
        }
      />

      {projects.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented<Filter>
            ariaLabel="Filter by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'in-progress', label: 'In progress', count: counts['in-progress'] },
              { value: 'pending', label: 'Pending', count: counts.pending },
              { value: 'completed', label: 'Completed', count: counts.completed },
              { value: 'on-hold', label: 'On hold', count: counts['on-hold'] },
            ]}
          />
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 lg:w-60 lg:flex-none">
              <Search size={16} strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
              <Input aria-label="Search projects" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="h-10 pl-10" />
            </div>
            <div className="w-40 shrink-0">
              <Select aria-label="Sort projects" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10">
                <option value="newest">Newest first</option>
                <option value="deadline">By deadline</option>
                <option value="fee">Highest fee</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <Card bezel pad="none">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create a project to track its fee, deadline, downpayment and progress."
            action={<Button trailing={<Plus size={16} strokeWidth={2} />} onClick={openCreate}>Add your first project</Button>}
          />
        </Card>
      ) : visible.length === 0 ? (
        <EmptyState compact icon={Search} title="No projects match" description="Try another status or clear the search." />
      ) : (
        <motion.ul key={`${filter}-${sort}`} variants={stagger(0.04)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => {
            const days = daysUntil(p.deadline);
            const overdue = p.status !== 'completed' && days !== null && days < 0;
            const soon = p.status !== 'completed' && days !== null && days >= 0 && days <= 3;
            const files = attachments.filter((a) => a.projectId === p.id).length;
            return (
              <motion.li key={p.id} variants={fadeUp} className="min-w-0 [&>*]:h-full">
                <Card bezel spotlight pad="md" className="group" coreClassName="flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <ProjectStatusBadge status={p.status} />
                    <div className="relative z-10 -mr-1 -mt-1 flex items-center gap-1">
                      <IconButton
                        size="sm"
                        tone="soft"
                        label={p.reminder ? `Remove reminder for ${p.name}` : `Set reminder for ${p.name}`}
                        aria-pressed={p.reminder}
                        className={cn(p.reminder && '!bg-warn-100 !text-warn-700')}
                        onClick={() => updateProject(p.id, { reminder: !p.reminder })}
                      >
                        {p.reminder ? <BellRing size={14} strokeWidth={1.75} /> : <Bell size={14} strokeWidth={1.75} />}
                      </IconButton>
                      <IconButton size="sm" tone="soft" label={`Edit ${p.name}`} onClick={() => openEdit(p)}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </IconButton>
                    </div>
                  </div>

                  <h3 className="mt-4 text-[16px] font-semibold leading-snug tracking-tight text-ink">
                    <Link to={R.client(p.clientId)} className="after:absolute after:inset-0 after:content-['']">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 truncate text-[13px] text-mute">
                    <PrivateText type="name">{clientName(p.clientId)}</PrivateText>
                    <span className="mx-1.5 text-faint">·</span>
                    {PROJECT_TYPE_LABELS[p.type]}
                    {p.type === 'other' && p.typeOther ? ` — ${p.typeOther}` : ''}
                  </p>

                  <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-mute">Progress</span>
                      <span className="font-semibold tabular-nums text-ink">{p.progress}%</span>
                    </div>
                    <Bar value={p.progress} tone={overdue ? 'danger' : 'brand'} label={`${p.name} progress`} />
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-5 text-xs">
                    <span className="text-[15px] font-semibold tracking-tight text-ink"><Money value={p.fee} /></span>
                    {p.downpayment > 0 && (
                      <span className={cn('font-medium', p.downpaymentPaid ? 'text-brand-700' : 'text-mute')}>
                        <Money value={p.downpayment} /> dp{p.downpaymentPaid ? ' ✓' : ''}
                      </span>
                    )}
                    {files > 0 && (
                      <span className="flex items-center gap-1 text-mute"><Paperclip size={12} strokeWidth={1.6} />{files}</span>
                    )}
                    <span className="ml-auto flex items-center gap-1.5">
                      {p.status === 'completed' && !p.remainingPaid && <Badge tone="danger">Unpaid</Badge>}
                      {p.deadline && (
                        <Badge tone={overdue ? 'danger' : soon ? 'warn' : 'neutral'}>
                          <CalendarClock size={11} strokeWidth={1.75} />
                          {overdue ? `${Math.abs(days as number)}d overdue` : fmtDate(p.deadline)}
                        </Badge>
                      )}
                    </span>
                  </div>
                </Card>
              </motion.li>
            );
          })}
        </motion.ul>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New project"
        description="Pick a client (or create one on the spot), then set the money."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!createForm.name.trim() || !createForm.clientId}>Create project</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <ClientPicker
            key={pickerKey}
            clients={clients}
            clientId={createForm.clientId}
            onSelect={(c) => setCreateForm((f) => ({ ...f, clientId: c.id }))}
            onCreate={(name) => {
              const c = addClient({ name, contact: '', email: '', notes: '' });
              setCreateForm((f) => ({ ...f, clientId: c.id }));
              toast(`Client “${name}” created`, 'success');
              return c;
            }}
          />
          <ProjectFields value={createForm} onChange={setCreateForm} />
        </div>
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name ?? 'project'}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!editForm.name.trim()}>Save changes</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <ProjectFields value={editForm} onChange={setEditForm} onSubmit={handleEdit} />
          <StatusPicker value={editStatus} onChange={setEditStatus} />
        </div>
      </Modal>
    </div>
  );
}
