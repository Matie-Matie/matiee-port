import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Lightbulb, Palette, Pencil, Pin, PinOff, Plus, Scale, Search, StickyNote, Trash2, type LucideIcon } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory, type KnowledgeNote } from '../types';
import { timeAgo } from '../lib/format';
import { usePrivacy } from '../lib/usePrivacy';
import { cn } from '../lib/cn';
import { PageHeader } from '../ui/PageHeader';
import { Button, IconButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Chips } from '../ui/Chips';
import { EmptyState } from '../ui/EmptyState';
import { Field, Input, Textarea } from '../ui/Field';
import { Segmented } from '../ui/Segmented';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/toast';

const ORDER: KnowledgeCategory[] = ['terms', 'playbook', 'design', 'lessons', 'other'];
const ICONS: Record<KnowledgeCategory, LucideIcon> = { terms: Scale, playbook: BookOpen, design: Palette, lessons: Lightbulb, other: StickyNote };
type Filter = 'all' | KnowledgeCategory;

export default function KnowledgeVault() {
  const { on: hide } = usePrivacy();
  const notes = useMatieeStore((s) => s.knowledgeNotes);
  const addNote = useMatieeStore((s) => s.addKnowledgeNote);
  const updateNote = useMatieeStore((s) => s.updateKnowledgeNote);
  const deleteNote = useMatieeStore((s) => s.deleteKnowledgeNote);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('other');
  const [tags, setTags] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<KnowledgeNote | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: notes.length, terms: 0, playbook: 0, design: 0, lessons: 0, other: 0 };
    notes.forEach((n) => (c[n.category] += 1));
    return c;
  }, [notes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes
      .filter((n) => (filter === 'all' || n.category === filter) && (!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q))))
      .sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  }, [notes, search, filter]);

  function openEditor(n?: KnowledgeNote) {
    setEditing(n ?? null);
    setTitle(n?.title ?? '');
    setContent(n?.content ?? '');
    setCategory(n?.category ?? 'other');
    setTags(n?.tags.join(', ') ?? '');
    setOpen(true);
  }

  function save() {
    if (!title.trim()) return;
    const tagList = tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
    if (editing) {
      updateNote(editing.id, { title: title.trim(), content: content.trim(), category, tags: tagList });
      toast('Note updated', 'success');
    } else {
      addNote({ title: title.trim(), content: content.trim(), category, tags: tagList, pinned: false });
      toast('Note saved', 'success');
    }
    setOpen(false);
  }

  const filtering = search.trim() !== '' || filter !== 'all';

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Knowledge Vault"
        title="Your second brain"
        description="Terms, playbooks, design rules and lessons — written down so future-you remembers."
        actions={<Button size="lg" trailing={<Plus size={16} strokeWidth={2} />} onClick={() => openEditor()}>New note</Button>}
      />

      {notes.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search size={16} strokeWidth={1.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
            <Input aria-label="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes, tags, content" className="pl-10" />
          </div>
          <Segmented<Filter>
            ariaLabel="Filter by category"
            value={filter}
            onChange={setFilter}
            options={[{ value: 'all', label: 'All', count: counts.all }, ...ORDER.map((c) => ({ value: c as Filter, label: KNOWLEDGE_CATEGORIES[c], count: counts[c] }))]}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <Card bezel pad="none">
          <EmptyState
            icon={filtering ? Search : BookOpen}
            title={filtering ? 'No notes match' : 'Your vault is empty'}
            description={filtering ? 'Try a different search or category.' : 'Store your employment terms, client playbooks, design rules and lessons learned.'}
            action={!filtering ? <Button trailing={<Plus size={16} strokeWidth={2} />} onClick={() => openEditor()}>Write your first note</Button> : undefined}
          />
        </Card>
      ) : (
        <ul className="columns-1 gap-4 md:columns-2 xl:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
          <AnimatePresence initial={false}>
            {filtered.map((n) => {
              const Icon = ICONS[n.category];
              const long = n.content.length > 240 || n.content.split('\n').length > 5;
              const isOpen = expanded.has(n.id);
              return (
                <motion.li key={n.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                  <Card bezel spotlight pad="md">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={18} strokeWidth={1.6} /></span>
                      <div className="-mr-1 flex items-center gap-1">
                        <IconButton size="sm" tone="soft" label={n.pinned ? `Unpin ${n.title}` : `Pin ${n.title}`} aria-pressed={n.pinned} className={cn(n.pinned && '!bg-warn-100 !text-warn-700')} onClick={() => updateNote(n.id, { pinned: !n.pinned })}>
                          {n.pinned ? <Pin size={14} strokeWidth={1.75} fill="currentColor" /> : <PinOff size={14} strokeWidth={1.75} />}
                        </IconButton>
                        <IconButton size="sm" tone="soft" label={`Edit ${n.title}`} onClick={() => openEditor(n)}><Pencil size={14} strokeWidth={1.75} /></IconButton>
                        <IconButton size="sm" tone="danger" label={`Delete ${n.title}`} onClick={() => setToDelete(n)}><Trash2 size={14} strokeWidth={1.75} /></IconButton>
                      </div>
                    </div>
                    <div className="mb-2 flex items-center gap-1.5">
                      <Badge tone="brand">{KNOWLEDGE_CATEGORIES[n.category]}</Badge>
                      {n.pinned && <Badge tone="warn">Pinned</Badge>}
                    </div>
                    <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-ink">{n.title}</h3>
                    {n.content && <p className={cn('mt-1.5 whitespace-pre-line text-sm leading-relaxed text-mute', !isOpen && 'line-clamp-5')}>{hide ? n.content.replace(/₱\s?[\d,]+(\.\d+)?/g, '₱•••') : n.content}</p>}
                    {long && (
                      <button type="button" onClick={() => setExpanded((s) => { const x = new Set(s); if (x.has(n.id)) x.delete(n.id); else x.add(n.id); return x; })} className="mt-1.5 text-xs font-medium text-brand-700 hover:text-brand-800">
                        {isOpen ? 'Show less' : 'Read more'}
                      </button>
                    )}
                    {n.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {n.tags.map((t) => <span key={t} className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[11px] font-medium text-mute">#{t}</span>)}
                      </div>
                    )}
                    <p className="mt-4 border-t border-ink/[0.07] pt-3 text-[11px] text-mute">Updated {timeAgo(new Date(n.updatedAt).getTime())}</p>
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
        title={editing ? 'Edit note' : 'New note'}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!title.trim()}>{editing ? 'Save changes' : 'Create note'}</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Title">{(id) => <Input id={id} data-autofocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My DORY employment terms" />}</Field>
          <Field label="Content">{(id) => <Textarea id={id} rows={7} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write it down so future-you remembers…" />}</Field>
          <div>
            <p className="mb-2 text-xs font-medium text-ink-2">Category</p>
            <Chips label="Category" value={category} onChange={setCategory} options={ORDER.map((c) => ({ value: c, label: KNOWLEDGE_CATEGORIES[c] }))} />
          </div>
          <Field label="Tags" hint="Comma separated">{(id) => <Input id={id} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="dory, salary, probation" />}</Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Delete “${toDelete?.title ?? 'note'}”?`}
        description="This can't be undone."
        onConfirm={() => { if (toDelete) deleteNote(toDelete.id); toast('Note deleted'); }}
      />
    </div>
  );
}
