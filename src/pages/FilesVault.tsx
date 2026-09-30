import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, File as FileIcon, FileArchive, FileImage, FileText, FolderLock, HardDrive, Plus, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { VAULT_FILE_CATEGORIES, type VaultFile, type VaultFileCategory } from '../types';
import { fmtBytes, fmtDateLong } from '../lib/format';
import { STORAGE_BUDGET, vaultUsage } from '../lib/storage';
import { fadeUp, stagger } from '../lib/motion';
import { cn } from '../lib/cn';
import { PageHeader } from '../ui/PageHeader';
import { Button, IconButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Bar } from '../ui/Progress';
import { Chips } from '../ui/Chips';
import { EmptyState } from '../ui/EmptyState';
import { Field, Input } from '../ui/Field';
import { Segmented } from '../ui/Segmented';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/toast';

const CATEGORY_ORDER: VaultFileCategory[] = ['contract', 'receipt', 'reference', 'certificate', 'other'];
const CATEGORY_TONE: Record<VaultFileCategory, BadgeTone> = { contract: 'brand', receipt: 'warn', reference: 'sand', certificate: 'ink', other: 'neutral' };
const MAX_FILE_SIZE = 3 * 1024 * 1024;

function iconFor(type: string) {
  if (type.includes('zip') || type.includes('compressed') || type.includes('rar')) return FileArchive;
  if (type.startsWith('image/')) return FileImage;
  if (type.startsWith('text/') || type.includes('pdf') || type.includes('word') || type.includes('sheet')) return FileText;
  return FileIcon;
}

type Pending = { name: string; type: string; size: number; data: string };
type Filter = 'all' | VaultFileCategory;

export default function FilesVault() {
  const files = useMatieeStore((s) => s.vaultFiles);
  const addVaultFile = useMatieeStore((s) => s.addVaultFile);
  const deleteVaultFile = useMatieeStore((s) => s.deleteVaultFile);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<VaultFileCategory>('contract');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<VaultFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSize = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files]);
  const usage = vaultUsage();
  const usagePct = Math.min(100, (usage / STORAGE_BUDGET) * 100);
  const visible = useMemo(() => (filter === 'all' ? files : files.filter((f) => f.category === filter)), [files, filter]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: files.length, contract: 0, receipt: 0, reference: 0, certificate: 0, other: 0 };
    files.forEach((f) => (c[f.category] += 1));
    return c;
  }, [files]);

  function readFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(`That file is ${fmtBytes(file.size)} — the limit is 3 MB so your vault stays fast.`);
      setPending(null);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setPending({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, data: reader.result as string });
    reader.readAsDataURL(file);
  }

  function openUpload() {
    setPending(null);
    setError('');
    setDescription('');
    setCategory('contract');
    setOpen(true);
  }

  function save() {
    if (!pending) return;
    addVaultFile({ ...pending, category, description: description.trim() || undefined });
    setOpen(false);
    toast('Saved to your vault', 'success');
  }

  function download(f: VaultFile) {
    const a = document.createElement('a');
    a.href = f.data;
    a.download = f.name;
    a.click();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Files & Contracts"
        title="Your paper trail"
        description="Contracts, receipts, references — kept safely in your vault."
        actions={<Button size="lg" trailing={<Plus size={16} strokeWidth={2} />} onClick={openUpload}>Upload file</Button>}
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: FolderLock, label: 'Files', value: <span className="tabular-nums">{files.length}</span>, sub: `${counts.contract} contract${counts.contract === 1 ? '' : 's'}` },
          { icon: HardDrive, label: 'File size', value: fmtBytes(totalSize), sub: 'Stored as base64 in this browser' },
          { icon: ShieldCheck, label: 'Vault storage', value: `${(usage / (1024 * 1024)).toFixed(1)} MB`, sub: 'of about 5 MB browser limit', bar: usagePct },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={fadeUp} className="min-w-0 [&>*]:h-full">
              <Card bezel spotlight pad="md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={17} strokeWidth={1.6} /></span>
                  <p className="text-[13px] text-mute">{s.label}</p>
                </div>
                <p className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.04em] text-ink">{s.value}</p>
                {'bar' in s && s.bar !== undefined && <Bar value={s.bar} height={5} tone={s.bar > 80 ? 'danger' : s.bar > 60 ? 'warn' : 'brand'} className="mt-3" label="Browser storage used" />}
                <p className="mt-2 text-xs text-mute">{s.sub}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {files.length > 0 && (
        <Segmented<Filter>
          ariaLabel="Filter by category"
          value={filter}
          onChange={setFilter}
          options={[{ value: 'all', label: 'All', count: counts.all }, ...CATEGORY_ORDER.map((c) => ({ value: c as Filter, label: VAULT_FILE_CATEGORIES[c], count: counts[c] }))]}
        />
      )}

      {visible.length === 0 ? (
        <Card bezel pad="none">
          <EmptyState
            icon={FolderLock}
            title={files.length === 0 ? 'Nothing in the vault yet' : 'No files in this category'}
            description={files.length === 0 ? 'Upload a contract, receipt or certificate and it will be waiting here.' : 'Try another category.'}
            action={files.length === 0 ? <Button trailing={<Plus size={16} strokeWidth={2} />} onClick={openUpload}>Upload your first file</Button> : undefined}
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((f, i) => {
              const Icon = iconFor(f.type);
              const isImage = f.type.startsWith('image/');
              return (
                <motion.li key={f.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.03 }} className="min-w-0 [&>*]:h-full">
                  <Card bezel spotlight pad="none" className="group" coreClassName="flex flex-col">
                    {isImage ? (
                      <div className="h-36 overflow-hidden bg-paper-2">
                        <img src={f.data} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-matie group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-gradient-to-b from-paper-2 to-paper">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-brand-600 shadow-soft ring-1 ring-ink/[0.06]"><Icon size={22} strokeWidth={1.5} /></span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-[14.5px] font-semibold tracking-tight text-ink" title={f.name}>{f.name}</p>
                      </div>
                      {f.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mute">{f.description}</p>}
                      <div className="mt-3 flex items-center gap-2">
                        <Badge tone={CATEGORY_TONE[f.category]}>{VAULT_FILE_CATEGORIES[f.category]}</Badge>
                        <span className="text-[11.5px] text-mute">{fmtBytes(f.size)}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="text-[11px] text-mute">{fmtDateLong(f.uploadedAt)}</span>
                        <div className="flex gap-1">
                          <IconButton size="sm" tone="soft" label={`Download ${f.name}`} onClick={() => download(f)}><Download size={14} strokeWidth={1.75} /></IconButton>
                          <IconButton size="sm" tone="danger" label={`Delete ${f.name}`} onClick={() => setToDelete(f)}><Trash2 size={14} strokeWidth={1.75} /></IconButton>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload to vault"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!pending}>Save to vault</Button></>}
      >
        <div className="flex flex-col gap-4">
          <input ref={inputRef} type="file" className="hidden" aria-label="Choose a file" onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
          <button
            type="button"
            data-autofocus
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files?.[0]); }}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-9 text-center transition-[background-color,border-color,transform] duration-300 ease-matie',
              dragging ? 'scale-[1.01] border-brand-600 bg-brand-50' : 'border-ink/20 bg-paper-2 hover:border-brand-600/50 hover:bg-brand-50/60',
            )}
          >
            {pending ? (
              <>
                <FileText size={28} strokeWidth={1.5} className="mb-2 text-brand-600" />
                <p className="max-w-full truncate text-sm font-semibold text-ink">{pending.name}</p>
                <p className="mt-0.5 text-xs text-mute">{fmtBytes(pending.size)} · click to change</p>
              </>
            ) : (
              <>
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-brand-600 shadow-soft ring-1 ring-ink/[0.06]"><UploadCloud size={22} strokeWidth={1.5} /></span>
                <p className="text-sm font-medium text-ink">Drop a file here, or click to browse</p>
                <p className="mt-1 text-xs text-mute">Up to 3 MB · PDF, images, docs, zips</p>
              </>
            )}
          </button>
          {error && <p role="alert" className="rounded-xl bg-danger-100 px-3 py-2 text-xs font-medium text-danger-700">{error}</p>}
          <div>
            <p className="mb-2 text-xs font-medium text-ink-2">Category</p>
            <Chips label="Category" value={category} onChange={setCategory} options={CATEGORY_ORDER.map((c) => ({ value: c, label: VAULT_FILE_CATEGORIES[c] }))} />
          </div>
          <Field label="Description (optional)">{(id) => <Input id={id} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. DORY employment contract" />}</Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Delete “${toDelete?.name ?? 'file'}”?`}
        description="It will be removed from your vault. This can't be undone."
        onConfirm={() => { if (toDelete) deleteVaultFile(toDelete.id); toast('File deleted'); }}
      />
    </div>
  );
}
