import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronRight, Pencil, Camera } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function Clients() {
  const navigate = useNavigate();
  const clients = useMatieeStore((s) => s.clients);
  const projects = useMatieeStore((s) => s.projects);
  const addClient = useMatieeStore((s) => s.addClient);
  const updateClient = useMatieeStore((s) => s.updateClient);
  const deleteClient = useMatieeStore((s) => s.deleteClient);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', notes: '', photo: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addClient({ name: form.name.trim(), contact: form.contact.trim(), email: form.email.trim(), notes: form.notes.trim(), photo: form.photo || undefined });
    setForm({ name: '', contact: '', email: '', notes: '', photo: '' });
    setModalOpen(false);
  };

  const handleEdit = (client: typeof clients[0]) => {
    setForm({ name: client.name, contact: client.contact, email: client.email, notes: client.notes, photo: client.photo || '' });
    setEditingClient(client.id);
  };

  const handleSaveEdit = () => {
    if (!form.name.trim() || !editingClient) return;
    updateClient(editingClient, { name: form.name.trim(), contact: form.contact.trim(), email: form.email.trim(), notes: form.notes.trim(), photo: form.photo || undefined });
    setForm({ name: '', contact: '', email: '', notes: '', photo: '' });
    setEditingClient(null);
  };

  const isEditing = editingClient !== null;
  const editingTitle = isEditing
    ? `Edit ${clients.find((c) => c.id === editingClient)?.name || 'Client'}`
    : 'New Client';

  const getProjectCount = (clientId: string) =>
    projects.filter((p) => p.clientId === clientId).length;

  return (
    <div>
      <PageHeader
        badge="Clients"
        title="Your Roster"
        description={`${clients.length} client${clients.length !== 1 ? 's' : ''} on board.`}
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 h-12 px-6 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Add Client
          </button>
        }
      />

      {/* Client List */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <Reveal y={20} delay={0.1}>
            <EmptyState
              icon="🤝"
              title="No clients yet"
              description="Tap 'Add Client' to get started."
              action={
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 h-12 px-6 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all duration-200"
                >
                  <Plus size={18} />
                  Add Client
                </button>
              }
            />
          </Reveal>
        ) : (
          clients.map((client, i) => (
            <Reveal key={client.id} y={20} delay={0.04 * i} duration={0.4}>
              <motion.div
                whileHover={{ scale: 1.005, x: 3 }}
                whileTap={{ scale: 0.995 }}
                className="group flex items-center justify-between p-4 md:p-5 bg-white rounded-[22px] shadow-card cursor-pointer transition-all duration-200"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                  <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-primary to-green-dark">
                    {client.photo ? (
                      <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{client.name}</p>
                    <p className="text-xs text-gray-500">
                      {getProjectCount(client.id)} project{getProjectCount(client.id) !== 1 ? 's' : ''}
                      {client.contact && ` · ${client.contact}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getProjectCount(client.id) > 0 && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-mint/50 text-green-dark">
                      {getProjectCount(client.id)}
                    </span>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:text-green-primary hover:bg-green-mint/30 transition-all duration-200"
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(client.id); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:text-status-red hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 size={14} />
                  </button>

                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </motion.div>
            </Reveal>
          ))
        )}
      </div>

      {/* ── Add / Edit Client Modal ── */}
      <Modal open={modalOpen || isEditing} onClose={() => { setModalOpen(false); setEditingClient(null); setForm({ name: '', contact: '', email: '', notes: '', photo: '' }); }} title={editingTitle}>
        <div className="flex flex-col gap-4">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-primary to-green-dark flex-shrink-0 cursor-pointer group ring-2 ring-brand-100 hover:ring-green-mint transition-all"
            >
              {form.photo ? (
                <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                  {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera size={16} className="text-white" />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <button onClick={() => fileInputRef.current?.click()} className="font-medium text-green-primary hover:text-green-dark transition-colors">Upload photo</button>
              {form.photo && (
                <button onClick={() => setForm({ ...form, photo: '' })} className="font-medium text-gray-400 hover:text-status-red transition-colors ml-3">Remove</button>
              )}
              <p className="mt-0.5">PNG, JPG up to 2MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Client Name <span className="text-green-primary">*</span>
            </label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (isEditing ? handleSaveEdit() : handleAdd())}
              placeholder="e.g. Juan Dela Cruz"
              className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Where to Contact?</label>
            <input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="FB, Instagram (paste link)"
              className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@"
              className="w-full h-12 px-5 bg-brand-50 rounded-[999px] text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Prescription system — downpayment ₱5k..."
              rows={2}
              className="w-full px-5 py-3 bg-brand-50 rounded-2xl text-sm text-navy-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-green-mint transition-all resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => { setModalOpen(false); setEditingClient(null); setForm({ name: '', contact: '', email: '', notes: '', photo: '' }); }} className="flex-1 h-12 rounded-full text-sm font-medium text-gray-500 ring-1 ring-brand-100 hover:ring-gray-300 transition-all">Cancel</button>
            <button onClick={isEditing ? handleSaveEdit : handleAdd} disabled={!form.name.trim()} className="flex-1 h-12 rounded-full text-sm font-medium bg-green-primary text-white hover:bg-green-dark transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
              {isEditing ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete Client?">
        <p className="text-sm text-gray-500 mb-6">
          This will also remove all projects, payments, and notes linked to this client.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 rounded-full text-sm font-medium text-gray-500 ring-1 ring-brand-100 hover:ring-gray-300 transition-all">Cancel</button>
          <button onClick={() => { if (deleteConfirm) deleteClient(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 h-12 rounded-full text-sm font-medium bg-status-red text-white hover:bg-red-600 transition-all">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
