import { useState, useRef } from 'react';
import { Download, Upload, Check, AlertCircle, Merge, RefreshCcw } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';

// Fields we keep from a backup (both merge + replace)
function buildHydrateData(data: any) {
  return {
    clients: data.clients ?? [],
    projects: data.projects ?? [],
    payments: data.payments ?? [],
    notes: data.notes ?? [],
    wishlist: data.wishlist ?? [],
    attachments: data.attachments ?? [],
    customSavings: data.customSavings ?? 0,
    privacyMode: data.privacyMode ?? false,
    attendance: data.attendance ?? [],
    dailyRate: data.dailyRate ?? 500,
    transactions: data.transactions ?? [],
    vaultFiles: data.vaultFiles ?? [],
    knowledgeNotes: data.knowledgeNotes ?? [],
    accounts: data.accounts ?? [],
    recurring: data.recurring ?? [],
  };
}

export default function BackupManager() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'exported' | 'imported' | 'error'>('idle');
  const [pendingImport, setPendingImport] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const state = useMatieeStore();

  function handleExport() {
    try {
      const data = {
        clients: state.clients,
        projects: state.projects,
        payments: state.payments,
        notes: state.notes,
        wishlist: state.wishlist,
        attachments: state.attachments,
        customSavings: state.customSavings,
        privacyMode: state.privacyMode,
        attendance: state.attendance,
        dailyRate: state.dailyRate,
        transactions: state.transactions,
        vaultFiles: state.vaultFiles,
        knowledgeNotes: state.knowledgeNotes,
        accounts: state.accounts,
        recurring: state.recurring,
        exportedAt: new Date().toISOString(),
        version: 3,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matieeport-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus('exported');
      setTimeout(() => { setStatus('idle'); setOpen(false); }, 1500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);

        // Validate basic structure
        if (!data.clients || !data.projects || !data.payments) {
          throw new Error('Invalid backup file');
        }

        // Show the merge / replace choice instead of importing immediately
        setPendingImport(data);
      } catch {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be re-imported
    if (fileRef.current) fileRef.current.value = '';
  }

  function doMerge() {
    if (!pendingImport) return;
    state.mergeBackup(buildHydrateData(pendingImport));
    setPendingImport(null);
    finishImport();
  }

  function doReplace() {
    if (!pendingImport) return;
    state.hydrate(buildHydrateData(pendingImport));
    setPendingImport(null);
    finishImport();
  }

  function finishImport() {
    setStatus('imported');
    setTimeout(() => { setStatus('idle'); setOpen(false); }, 1500);
  }

  // Counts for the confirmation modal
  const importedCounts = pendingImport ? {
    clients: pendingImport.clients?.length ?? 0,
    projects: pendingImport.projects?.length ?? 0,
    attendance: pendingImport.attendance?.length ?? 0,
    transactions: pendingImport.transactions?.length ?? 0,
    files: pendingImport.vaultFiles?.length ?? 0,
    notes: pendingImport.knowledgeNotes?.length ?? 0,
  } : null;

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
          status === 'error'
            ? 'bg-red-100 text-red-500'
            : status === 'exported' || status === 'imported'
              ? 'bg-green-mint text-green-primary'
              : 'bg-gray-100 text-gray-500 hover:text-navy-900 hover:bg-gray-200'
        }`}
        title="Backup / Restore data"
      >
        {status === 'exported' || status === 'imported' ? (
          <Check size={18} />
        ) : status === 'error' ? (
          <AlertCircle size={18} />
        ) : (
          <Download size={18} />
        )}
      </button>

      {open && status === 'idle' && !pendingImport && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-40 w-52 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200/60 py-2 overflow-hidden">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-900 hover:bg-brand-50 transition-colors text-left"
            >
              <Download size={16} className="text-green-primary shrink-0" />
              <div>
                <p className="font-medium">Export Backup</p>
                <p className="text-[11px] text-gray-500">Download all data as JSON</p>
              </div>
            </button>
            <div className="h-px bg-brand-100 mx-4" />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-900 hover:bg-brand-50 transition-colors text-left"
            >
              <Upload size={16} className="text-green-primary shrink-0" />
              <div>
                <p className="font-medium">Import Backup</p>
                <p className="text-[11px] text-gray-500">Merge or replace from a JSON file</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* ── Merge / Replace confirmation modal ── */}
      {pendingImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[22px] p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-navy-900 mb-1">Import Backup</h2>
            <p className="text-sm text-gray-500 mb-5">This file contains:</p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              <SummaryChip label="Clients" value={importedCounts?.clients ?? 0} />
              <SummaryChip label="Projects" value={importedCounts?.projects ?? 0} />
              <SummaryChip label="Attendance" value={importedCounts?.attendance ?? 0} />
              <SummaryChip label="Transactions" value={importedCounts?.transactions ?? 0} />
              <SummaryChip label="Files" value={importedCounts?.files ?? 0} />
              <SummaryChip label="Knowledge" value={importedCounts?.notes ?? 0} />
            </div>

            <div className="space-y-3">
              <button
                onClick={doMerge}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border-2 border-green-primary/30 bg-green-mint/20 hover:bg-green-mint/40 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-green-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Merge size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">Merge (recommended)</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Keeps your current data, adds anything new from the file. Nothing gets erased.
                  </p>
                </div>
              </button>

              <button
                onClick={doReplace}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <RefreshCcw size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">Replace everything</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Erases current data and restores exactly this file. Careful — no undo.
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setPendingImport(null)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-brand-50">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-bold text-navy-900">{value}</span>
    </div>
  );
}
