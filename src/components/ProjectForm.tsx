import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS, type Client, type ProjectStatus, type ProjectType } from '../types';
import { Segmented } from '../ui/Segmented';
import { Avatar } from '../ui/Avatar';
import { Field, Input, MoneyInput, Select, Textarea, inputBase } from '../ui/Field';
import PrivateText from './PrivateText';
import { cn } from '../lib/cn';
import { TYPE_OPTIONS, type ProjectFormState } from './projectFormState';

export function ProjectFields({
  value,
  onChange,
  onSubmit,
}: {
  value: ProjectFormState;
  onChange: (v: ProjectFormState) => void;
  onSubmit?: () => void;
}) {
  const set = <K extends keyof ProjectFormState>(k: K, v: ProjectFormState[K]) => onChange({ ...value, [k]: v });
  const overDownpayment = value.downpayment > value.fee && value.fee > 0;

  return (
    <div className="flex flex-col gap-4">
      <Field label="Project name *">
        {(id) => (
          <Input
            id={id}
            data-autofocus
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
            placeholder="e.g. Pharmacy Inventory System"
          />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          {(id) => (
            <Select id={id} value={value.type} onChange={(e) => set('type', e.target.value as ProjectType)}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Deadline">
          {(id) => <Input id={id} type="date" value={value.deadline} onChange={(e) => set('deadline', e.target.value)} />}
        </Field>
      </div>
      {value.type === 'other' && (
        <Field label="Specify type">
          {(id) => <Input id={id} value={value.typeOther} onChange={(e) => set('typeOther', e.target.value)} placeholder="e.g. Booking website" />}
        </Field>
      )}
      <Field label="Description">
        {(id) => <Textarea id={id} rows={2} value={value.description} onChange={(e) => set('description', e.target.value)} placeholder="What are you building?" />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fee">
          {(id) => <MoneyInput id={id} value={value.fee || ''} onChange={(e) => set('fee', Number(e.target.value))} placeholder="0" />}
        </Field>
        <Field label="Downpayment" error={overDownpayment ? 'Downpayment is higher than the fee.' : undefined}>
          {(id) => <MoneyInput id={id} value={value.downpayment || ''} onChange={(e) => set('downpayment', Number(e.target.value))} placeholder="0" />}
        </Field>
      </div>
    </div>
  );
}

/** Searchable client combobox with inline "create new client". */
export function ClientPicker({
  clients,
  clientId,
  onSelect,
  onCreate,
}: {
  clients: Client[];
  clientId: string;
  onSelect: (c: Client) => void;
  onCreate: (name: string) => Client;
}) {
  const [query, setQuery] = useState(() => clients.find((c) => c.id === clientId)?.name ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => clients.filter((c) => c.name.toLowerCase().includes(q)), [clients, q]);
  const canCreate = q.length > 0 && !clients.some((c) => c.name.toLowerCase() === q);
  const total = filtered.length + (canCreate ? 1 : 0);
  const selected = clients.find((c) => c.id === clientId);

  function pick(c: Client) {
    onSelect(c);
    setQuery(c.name);
    setOpen(false);
  }
  function create() {
    pick(onCreate(query.trim()));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (total ? (i + 1) % total : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (total ? (i - 1 + total) % total : 0));
    } else if (e.key === 'Enter' && open && total) {
      e.preventDefault();
      if (active < filtered.length) pick(filtered[active]);
      else if (canCreate) create();
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <Field label="Client *">
      {(id) => (
        <div ref={wrapRef} className="relative">
          <input
            id={id}
            data-autofocus
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search or type a client name…"
            className={cn(inputBase, 'h-11 pr-10')}
          />
          <ChevronDown size={16} strokeWidth={1.75} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mute" />
          {open && (
            <ul id={`${id}-list`} role="listbox" className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-paper p-1.5 shadow-pop ring-1 ring-ink/[0.06]">
              {filtered.map((c, i) => (
                <li key={c.id} role="option" aria-selected={c.id === clientId}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(c)}
                    className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm', i === active && 'bg-brand-50')}
                  >
                    <Avatar name={c.name} photo={c.photo} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink"><PrivateText type="name">{c.name}</PrivateText></span>
                      {c.email && <span className="block truncate text-[11px] text-mute"><PrivateText type="name">{c.email}</PrivateText></span>}
                    </span>
                    {c.id === clientId && <Check size={15} className="text-brand-600" />}
                  </button>
                </li>
              ))}
              {canCreate && (
                <li role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(filtered.length)}
                    onClick={create}
                    className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-brand-700', active === filtered.length && 'bg-brand-50')}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Plus size={14} strokeWidth={2} /></span>
                    <span className="truncate">Create “{query.trim()}”</span>
                  </button>
                </li>
              )}
              {total === 0 && <li className="px-3 py-3 text-center text-xs text-mute">Type a name to create a client</li>}
            </ul>
          )}
          {selected && !open && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-brand-700"><Check size={12} strokeWidth={2.25} /> <PrivateText type="name">{selected.name}</PrivateText></p>
          )}
        </div>
      )}
    </Field>
  );
}

/** Status chips for the edit dialogs. */
export function StatusPicker({ value, onChange }: { value: ProjectStatus; onChange: (s: ProjectStatus) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-ink-2">Status</p>
      <Segmented
        ariaLabel="Project status"
        size="sm"
        value={value}
        onChange={onChange}
        options={(Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]).map(([v, label]) => ({ value: v, label }))}
      />
    </div>
  );
}
