import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Pencil, Pin, PinOff, Search, BookOpen, Briefcase, Palette, Lightbulb, StickyNote, Scale,
} from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import Reveal from '../components/Reveal';
import type { KnowledgeNote, KnowledgeCategory } from '../types';
import { KNOWLEDGE_CATEGORIES } from '../types';

const CATEGORY_ORDER: KnowledgeCategory[] = ['terms', 'playbook', 'design', 'lessons', 'other'];

const CATEGORY_STYLES: Record<KnowledgeCategory, { chip: string; icon: string; Icon: typeof Briefcase }> = {
  terms: { chip: 'bg-green-mint/40 text-green-primary', icon: 'bg-green-mint/40 text-green-primary', Icon: Scale },
  playbook: { chip: 'bg-amber-50 text-amber-500', icon: 'bg-amber-50 text-amber-500', Icon: BookOpen },
  design: { chip: 'bg-blue-50 text-blue-500', icon: 'bg-blue-50 text-blue-500', Icon: Palette },
  lessons: { chip: 'bg-purple-50 text-purple-500', icon: 'bg-purple-50 text-purple-500', Icon: Lightbulb },
  other: { chip: 'bg-gray-100 text-gray-400', icon: 'bg-gray-100 text-gray-400', Icon: StickyNote },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function KnowledgeVault() {
  const notes = useMatieeStore((s) => s.knowledgeNotes);
  const addKnowledgeNote = useMatieeStore((s) => s.addKnowledgeNote);
  const updateKnowledgeNote = useMatieeStore((s) => s.updateKnowledgeNote);
  const deleteKnowledgeNote = useMatieeStore((s) => s.deleteKnowledgeNote);

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<KnowledgeNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('other');
  const [tagsInput, setTagsInput] = useState('');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | KnowledgeCategory>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...notes]
      .filter((n) => (filter === 'all' ? true : n.category === filter))
      .filter((n) => {
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, search, filter]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    notes.forEach((n) => map.set(n.category, (map.get(n.category) || 0) + 1));
    return map;
  }, [notes]);

  const openAdd = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('other');
    setTagsInput('');
    setShowModal(true);
  };

  const openEdit = (n: KnowledgeNote) => {
    setEditingNote(n);
    setTitle(n.title);
    setContent(n.content);
    setCategory(n.category);
    setTagsInput(n.tags.join(', '));
    setShowModal(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (editingNote) {
      updateKnowledgeNote(editingNote.id, { title: title.trim(), content: content.trim(), category, tags });
    } else {
      addKnowledgeNote({ title: title.trim(), content: content.trim(), category, tags, pinned: false });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this note?')) deleteKnowledgeNote(id);
  };

  const togglePin = (n: KnowledgeNote) => {
    updateKnowledgeNote(n.id, { pinned: !n.pinned });
  };

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
          <h1 className="text-[32px] md:text-[46px] font-bold text-navy-900 leading-none tracking-tight">Knowledge Vault</h1>
          <p className="text-sm text-gray-500 mt-2">Your brain, backed up — terms, playbooks, design rules, lessons.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-11 px-5 bg-green-primary hover:bg-green-dark text-white text-sm font-medium rounded-full transition-all shadow-sm"
        >
          <Plus size={16} />
          New Note
        </button>
      </motion.div>

      {/* ── Search + Filter ── */}
      <Reveal y={15} duration={0.4}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, tags, content..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm text-navy-900 outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === 'all' ? 'bg-green-primary text-white' : 'bg-white text-gray-500 hover:bg-brand-50'}`}
            >
              All ({notes.length})
            </button>
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === c ? 'bg-green-primary text-white' : 'bg-white text-gray-500 hover:bg-brand-50'}`}
              >
                {KNOWLEDGE_CATEGORIES[c]} ({counts.get(c) || 0})
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Notes Grid ── */}
      {filtered.length === 0 ? (
        <Reveal y={15} duration={0.4}>
          <div className="bg-white rounded-[22px] p-16 shadow-card flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">
              {search || filter !== 'all' ? 'No notes match' : 'Your vault is empty'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              {search || filter !== 'all'
                ? 'Try a different search or category.'
                : 'Store your employment terms, client playbooks, design rules, and lessons learned.'}
            </p>
            {!search && filter === 'all' && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-6 py-3 bg-green-primary text-white rounded-xl hover:bg-green-dark transition-colors text-sm font-medium shadow-sm"
              >
                <Plus size={18} />
                Create Your First Note
              </button>
            )}
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => {
              const styles = CATEGORY_STYLES[n.category];
              const Icon = styles.Icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="bg-white rounded-[22px] shadow-card p-5 flex flex-col group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${styles.icon.split(' ')[0]} flex items-center justify-center ${styles.icon.split(' ')[1]}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePin(n)}
                        className={`p-1.5 rounded-lg transition-all ${n.pinned ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
                        title={n.pinned ? 'Unpin' : 'Pin'}
                      >
                        {n.pinned ? <Pin size={15} fill="currentColor" /> : <PinOff size={15} />}
                      </button>
                      <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg text-gray-300 hover:text-navy-900 hover:bg-brand-50 transition-all">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${styles.chip}`}>
                      {KNOWLEDGE_CATEGORIES[n.category]}
                    </span>
                    {n.pinned && (
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Pinned</span>
                    )}
                  </div>

                  <h3 className="font-bold text-navy-900 mb-1.5 leading-snug">{n.title}</h3>
                  <p className="text-sm text-gray-500 flex-1 whitespace-pre-line line-clamp-4">{n.content}</p>

                  {n.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {n.tags.map((t) => (
                        <span key={t} className="text-[10px] font-medium text-gray-400 bg-brand-50 px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-brand-50">
                    Updated {timeAgo(n.updatedAt)}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Note Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[22px] p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-navy-900">
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. My DORY employment terms"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write it down so future-you remembers..."
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all resize-none"
                  />
                </div>

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
                        {KNOWLEDGE_CATEGORIES[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="dory, salary, probation"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 bg-white outline-none focus:ring-2 focus:ring-green-primary/30 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-green-primary text-white text-sm font-medium hover:bg-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
