import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Download, FileText, FileImage, FileArchive, File, ShieldCheck, HardDrive, FolderOpen,
} from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import Reveal from '../components/Reveal';
import type { VaultFile, VaultFileCategory } from '../types';
import { VAULT_FILE_CATEGORIES } from '../types';

const CATEGORY_ORDER: VaultFileCategory[] = ['contract', 'receipt', 'reference', 'certificate', 'other'];

const CATEGORY_STYLES: Record<VaultFileCategory, { chip: string; icon: string }> = {
  contract: { chip: 'bg-green-mint/40 text-green-dark', icon: 'text-green-primary' },
  receipt: { chip: 'bg-amber-50 text-amber-700', icon: 'text-amber-500' },
  reference: { chip: 'bg-blue-50 text-blue-700', icon: 'text-blue-500' },
  certificate: { chip: 'bg-purple-50 text-purple-700', icon: 'text-purple-500' },
  other: { chip: 'bg-gray-100 text-gray-500', icon: 'text-gray-400' },
};

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB per file (localStorage-friendly)

function fmtSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

function fileIcon(type: string) {
  if (type.startsWith('image/')) return FileImage;
  if (type.includes('zip') || type.includes('compressed') || type.includes('rar')) return FileArchive;
  if (type.startsWith('text/') || type.includes('pdf') || type.includes('word') || type.includes('sheet')) return FileText;
  return File;
}

function fileKey(f: VaultFile) {
  return `${f.name}-${f.size}-${f.uploadedAt}`;
}

export default function FilesVault() {
  const vaultFiles = useMatieeStore((s) => s.vaultFiles);
  const addVaultFile = useMatieeStore((s) => s.addVaultFile);
  const deleteVaultFile = useMatieeStore((s) => s.deleteVaultFile);

  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<VaultFileCategory>('contract');
  const [description, setDescription] = useState('');
  const [pendingFile, setPendingFile] = useState<{ name: string; type: string; size: number; data: string } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState<'all' | VaultFileCategory>('all');

  const grouped = useMemo(() => {
    const filtered = filter === 'all' ? vaultFiles : vaultFiles.filter((f) => f.category === filter);
    return filtered;
  }, [vaultFiles, filter]);

  const totalSize = useMemo(() => vaultFiles.reduce((s, f) => s + f.size, 0), [vaultFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (max 3MB). Found: ${fmtSize(file.size)}`);
      setPendingFile(null);
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, data: reader.result as string });
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!pendingFile) return;
    addVaultFile({
      name: pendingFile.name,
      type: pendingFile.type,
      size: pendingFile.size,
      data: pendingFile.data,
      category,
      description: description.trim() || undefined,
    });
    setShowModal(false);
    setPendingFile(null);
    setDescription('');
    setCategory('contract');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this file from the vault?')) deleteVaultFile(id);
  };

  const handleDownload = (f: VaultFile) => {
    const a = document.createElement('a');
    a.href = f.data;
    a.download = f.name;
    a.click();
  };

  const counts = useMemo(() => {
    const map = new Map<VaultFileCategory, number>();
    CATEGORY_ORDER.forEach((c) => map.set(c, 0));
    vaultFiles.forEach((f) => map.set(f.category, (map.get(f.category) || 0) + 1));
    return map;
  }, [vaultFiles]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[32px] md:text-[46px] font-bold text-navy-900 leading-none tracking-tight">Files & Contracts</h1>
          <p className="text-sm text-gray-500 mt-2">Your paper trail — contracts, receipts, references. All in one safe place.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-11 px-5 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all shadow-sm"
        >
          <Plus size={16} />
          Upload File
        </button>
      </motion.div>

      {/* ── Top Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-[22px] shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-mint/40 flex items-center justify-center">
              <FolderOpen size={18} className="text-green-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Files</p>
              <p className="text-xl font-bold text-navy-900">{vaultFiles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[22px] shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <HardDrive size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Storage Used</p>
              <p className="text-xl font-bold text-navy-900">{fmtSize(totalSize)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[22px] shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-mint/40 flex items-center justify-center">
              <ShieldCheck size={18} className="text-green-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Contracts</p>
              <p className="text-xl font-bold text-navy-900">{counts.get('contract') || 0}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Category Filter ── */}
      <Reveal y={15} duration={0.4}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === 'all' ? 'bg-green-primary text-white' : 'bg-white text-gray-500 hover:bg-brand-50'}`}
          >
            All ({vaultFiles.length})
          </button>
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === c ? 'bg-green-primary text-white' : `bg-white text-gray-500 hover:bg-brand-50 ${CATEGORY_STYLES[c].chip.split(' ')[0]}`}`}
            >
              {VAULT_FILE_CATEGORIES[c]} ({counts.get(c) || 0})
            </button>
          ))}
        </div>
      </Reveal>

      {/* ── File Grid ── */}
      {grouped.length === 0 ? (
        <Reveal y={15} duration={0.4}>
          <div className="bg-white rounded-[22px] p-16 shadow-card flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <FileText size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">No files in this vault yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Upload contracts, receipts, references, certificates — anything you need to keep safe.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-primary text-white rounded-xl hover:bg-green-dark transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={18} />
              Upload Your First File
            </button>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {grouped.map((f, i) => {
              const Icon = fileIcon(f.type);
              const styles = CATEGORY_STYLES[f.category];
              return (
                <motion.div
                  key={fileKey(f)}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="bg-white rounded-[22px] shadow-card p-5 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${styles.chip.split(' ')[0]} flex items-center justify-center ${styles.icon}`}>
                      <Icon size={20} />
                    </div>
                    <button onClick={() => handleDelete(f.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-navy-900 truncate mb-1" title={f.name}>{f.name}</p>
                  {f.description && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{f.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${styles.chip}`}>
                      {VAULT_FILE_CATEGORIES[f.category]}
                    </span>
                    <span className="text-[11px] text-gray-400">{fmtSize(f.size)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-50">
                    <span className="text-[10px] text-gray-400">
                      {new Date(f.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button onClick={() => handleDownload(f)} className="flex items-center gap-1.5 text-xs font-semibold text-green-primary hover:text-green-dark transition-colors">
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setPendingFile(null); setError(''); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[22px] p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-navy-900">Upload to Vault</h2>
                <button onClick={() => { setShowModal(false); setPendingFile(null); setError(''); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File drop */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-gray-200 bg-brand-50/60 flex flex-col items-center justify-center py-8 cursor-pointer hover:border-green-primary/40 hover:bg-green-mint/10 transition-all"
                >
                  {pendingFile ? (
                    <div className="text-center px-4">
                      <FileText size={28} className="text-green-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold text-navy-900 truncate max-w-full">{pendingFile.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{fmtSize(pendingFile.size)}</p>
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3">
                        <FolderOpen size={22} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">Tap to choose a file</p>
                      <p className="text-[11px] text-gray-400 mt-1">Max 3MB · PDF, images, docs, zips</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {error && (
                  <p className="text-xs font-medium text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_ORDER.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === c ? 'bg-green-primary text-white' : 'bg-brand-50 text-gray-500 hover:bg-brand-100'}`}
                      >
                        {VAULT_FILE_CATEGORIES[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. DORY employment contract"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); setPendingFile(null); setError(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!pendingFile}
                  className="flex-1 py-2.5 rounded-xl bg-green-primary text-white text-sm font-medium hover:bg-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save to Vault
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
