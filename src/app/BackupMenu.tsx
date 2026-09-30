import { useRef, useState } from 'react';
import { AlertCircle, Check, Download, GitMerge, RefreshCcw, Upload } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { buildHydrateData, downloadBackup, parseBackup } from '../lib/backup';
import { IconButton, Button } from '../ui/Button';
import { Popover } from '../ui/Popover';
import Modal from '../ui/Modal';
import { cn } from '../lib/cn';

type Status = 'idle' | 'exported' | 'imported' | 'error';

export function BackupMenu() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pending, setPending] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mergeBackup = useMatieeStore((s) => s.mergeBackup);
  const hydrate = useMatieeStore((s) => s.hydrate);

  function flash(next: Status, ms = 1600) {
    setStatus(next);
    setTimeout(() => setStatus('idle'), ms);
  }

  function handleExport() {
    try {
      downloadBackup();
      setOpen(false);
      flash('exported');
    } catch {
      flash('error', 2200);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        setPending(parseBackup(evt.target?.result as string));
        setOpen(false);
      } catch {
        flash('error', 2600);
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function finish() {
    setPending(null);
    flash('imported');
  }

  const counts = pending
    ? [
        ['Clients', pending.clients?.length ?? 0],
        ['Projects', pending.projects?.length ?? 0],
        ['Attendance', pending.attendance?.length ?? 0],
        ['Transactions', pending.transactions?.length ?? 0],
        ['Files', pending.vaultFiles?.length ?? 0],
        ['Notes', pending.knowledgeNotes?.length ?? 0],
      ]
    : [];

  return (
    <div className="relative">
      <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="hidden" aria-label="Choose backup file" />

      <IconButton
        label="Backup and restore"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          status === 'error' && '!bg-danger-100 !text-danger-700',
          (status === 'exported' || status === 'imported') && '!bg-brand-100 !text-brand-700',
        )}
      >
        {status === 'exported' || status === 'imported' ? <Check size={17} strokeWidth={1.75} /> : status === 'error' ? <AlertCircle size={17} strokeWidth={1.75} /> : <Download size={17} strokeWidth={1.5} />}
      </IconButton>

      <Popover open={open} onClose={() => setOpen(false)} className="w-64 p-1.5" label="Backup menu">
        <button type="button" onClick={handleExport} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-brand-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Download size={16} strokeWidth={1.75} /></span>
          <span>
            <span className="block text-[13px] font-medium text-ink">Export backup</span>
            <span className="block text-[11px] text-mute">Download everything as JSON</span>
          </span>
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-brand-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Upload size={16} strokeWidth={1.75} /></span>
          <span>
            <span className="block text-[13px] font-medium text-ink">Import backup</span>
            <span className="block text-[11px] text-mute">Merge or replace from a file</span>
          </span>
        </button>
      </Popover>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Import backup"
        description="Choose how to bring this file into your vault."
        footer={<Button variant="ghost" onClick={() => setPending(null)}>Cancel</Button>}
      >
        <div className="mb-4 grid grid-cols-2 gap-2">
          {counts.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-paper-2 px-3 py-2 ring-1 ring-ink/[0.05]">
              <span className="text-xs text-mute">{label}</span>
              <span className="text-sm font-semibold tabular-nums text-ink">{value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2.5">
          <button
            type="button"
            data-autofocus
            onClick={() => { mergeBackup(buildHydrateData(pending)); finish(); }}
            className="flex w-full items-start gap-3 rounded-2xl bg-brand-50/70 p-4 text-left ring-1 ring-brand-600/20 transition-[background-color,transform] duration-300 ease-matie hover:bg-brand-50 active:scale-[0.99]"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><GitMerge size={16} strokeWidth={1.75} /></span>
            <span>
              <span className="block text-sm font-semibold text-ink">Merge (recommended)</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-mute">Keeps your current data and adds anything new from the file. Nothing gets erased.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => { hydrate(buildHydrateData(pending)); finish(); }}
            className="flex w-full items-start gap-3 rounded-2xl bg-danger-100/50 p-4 text-left ring-1 ring-danger-500/20 transition-[background-color,transform] duration-300 ease-matie hover:bg-danger-100 active:scale-[0.99]"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-500 text-white"><RefreshCcw size={16} strokeWidth={1.75} /></span>
            <span>
              <span className="block text-sm font-semibold text-ink">Replace everything</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-mute">Erases current data and restores exactly this file. No undo.</span>
            </span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
