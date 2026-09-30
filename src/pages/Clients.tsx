import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { projectFinance } from '../lib/finance';
import { R } from '../routes';
import { fadeUp, stagger } from '../lib/motion';
import { PageHeader } from '../ui/PageHeader';
import { Button, IconButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
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

export default function Clients() {
  const { name: pname } = usePrivacy();
  const clients = useMatieeStore((s) => s.clients);
  const projects = useMatieeStore((s) => s.projects);
  const addClient = useMatieeStore((s) => s.addClient);
  const updateClient = useMatieeStore((s) => s.updateClient);
  const deleteClient = useMatieeStore((s) => s.deleteClient);

  const [params, setParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyClientForm);
  const [query, setQuery] = useState('');

  // Deep link from Quick add / command palette: /app/clients?new=1
  useEffect(() => {
    if (params.get('new')) {
      setForm(emptyClientForm);
      setEditingId(null);
      setModalOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients
      .filter((c) => !q || `${c.name} ${c.email} ${c.contact}`.toLowerCase().includes(q))
      .map((c) => {
        const mine = projects.filter((p) => p.clientId === c.id);
        const fin = projectFinance(mine);
        return { c, count: mine.length, active: mine.filter((p) => p.status === 'in-progress').length, billed: fin.pipelineValue, outstanding: fin.outstanding };
      });
  }, [clients, projects, query]);

  const open = modalOpen || editingId !== null;
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyClientForm);
  };

  function save() {
    if (!form.name.trim()) return;
    const data = { name: form.name.trim(), contact: form.contact.trim(), email: form.email.trim(), notes: form.notes.trim(), photo: form.photo || undefined };
    if (editingId) {
      updateClient(editingId, data);
      toast('Client updated', 'success');
    } else {
      addClient(data);
      toast('Client added', 'success');
    }
    closeModal();
  }

  const toDelete = clients.find((c) => c.id === deleteId);
  const linked = toDelete ? projects.filter((p) => p.clientId === toDelete.id).length : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Clients"
        title="Your roster"
        description={`${clients.length} client${clients.length === 1 ? '' : 's'} on board, ${projects.length} project${projects.length === 1 ? '' : 's'} between them.`}
        actions={
          <Button size="lg" trailing={<Plus size={16} strokeWidth={2} />} onClick={() => { setForm(emptyClientForm); setModalOpen(true); }}>
            Add client
          </Button>
        }
      />

      {clients.length > 6 && (
        <div className="relative mb-5 max-w-sm">
          <Search size={16} strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <Input aria-label="Search clients" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients" className="pl-10" />
        </div>
      )}

      {clients.length === 0 ? (
        <Card bezel pad="none">
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add the people you work with — projects, payments and notes hang off each client."
            action={<Button trailing={<Plus size={16} strokeWidth={2} />} onClick={() => setModalOpen(true)}>Add your first client</Button>}
          />
        </Card>
      ) : rows.length === 0 ? (
        <EmptyState compact icon={Search} title={`No client matches “${query}”`} description="Try a different name or email." />
      ) : (
        <motion.ul variants={stagger(0.05)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ c, count, active, billed, outstanding }) => (
            <motion.li key={c.id} variants={fadeUp} className="min-w-0 [&>*]:h-full">
              <Card bezel spotlight pad="md" className="group">
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} photo={c.photo} size={48} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold tracking-tight text-ink">
                      <Link to={R.client(c.id)} className="after:absolute after:inset-0 after:content-['']">
                        <PrivateText type="name">{c.name}</PrivateText>
                      </Link>
                    </h3>
                    <p className="truncate text-xs text-mute">{c.email ? <PrivateText type="name">{c.email}</PrivateText> : c.contact ? 'Has contact link' : 'No contact details'}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Badge tone={count ? 'brand' : 'neutral'} dot>{count} project{count === 1 ? '' : 's'}</Badge>
                  {active > 0 && <Badge tone="sand">{active} active</Badge>}
                  <div className="relative z-10 ml-auto flex items-center gap-1">
                    {c.contact && (
                      <a
                        href={c.contact.startsWith('http') ? c.contact : `https://${c.contact}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${pname(c.name)}'s contact link`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-mute transition-colors hover:bg-ink/[0.06] hover:text-ink"
                      >
                        <ExternalLink size={14} strokeWidth={1.6} />
                      </a>
                    )}
                    <span className="flex gap-1 md:opacity-0 md:transition-opacity md:duration-300 md:focus-within:opacity-100 md:group-hover:opacity-100">
                      <IconButton size="sm" tone="soft" label={`Edit ${pname(c.name)}`} onClick={() => { setForm(clientFormFrom(c)); setEditingId(c.id); }}>
                        <Pencil size={14} strokeWidth={1.75} />
                      </IconButton>
                      <IconButton size="sm" tone="danger" label={`Delete ${pname(c.name)}`} onClick={() => setDeleteId(c.id)}>
                        <Trash2 size={14} strokeWidth={1.75} />
                      </IconButton>
                    </span>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-ink/[0.07] pt-4">
                  <div>
                    <dt className="text-[11px] text-mute">Billed</dt>
                    <dd className="text-[15px] font-semibold tracking-tight text-ink"><Money value={billed} /></dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-mute">Outstanding</dt>
                    <dd className={`text-[15px] font-semibold tracking-tight ${outstanding > 0 ? 'text-warn-700' : 'text-ink'}`}><Money value={outstanding} /></dd>
                  </div>
                </dl>
                <ArrowUpRight size={16} strokeWidth={1.6} className="absolute bottom-5 right-5 text-faint opacity-0 transition-[opacity,transform] duration-500 ease-matie group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={editingId ? 'Edit client' : 'New client'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={save} disabled={!form.name.trim()}>{editingId ? 'Save changes' : 'Add client'}</Button>
          </>
        }
      >
        <ClientFields value={form} onChange={setForm} onSubmit={save} />
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={`Delete ${toDelete ? pname(toDelete.name) : 'client'}?`}
        description={linked ? `This also removes ${linked} project${linked === 1 ? '' : 's'}, their payments and notes. This can't be undone.` : "This removes the client and their notes. This can't be undone."}
        onConfirm={() => {
          if (deleteId) deleteClient(deleteId);
          toast('Client deleted');
        }}
      />
    </div>
  );
}
