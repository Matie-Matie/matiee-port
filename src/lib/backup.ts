import { useMatieeStore } from '../store/matieeStore';

const LAST_BACKUP_KEY = 'matieeport-last-backup';

// Fields we keep from a backup (both merge + replace)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildHydrateData(data: any) {
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

/** Download the whole vault as JSON. Same file format as before (version 3). */
export function downloadBackup(): void {
  const state = useMatieeStore.getState();
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

  try {
    localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function getLastBackup(): number | null {
  try {
    const v = localStorage.getItem(LAST_BACKUP_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

/** Parse + validate a backup file's text. Throws on invalid structure. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseBackup(text: string): any {
  const data = JSON.parse(text);
  if (!data.clients || !data.projects || !data.payments) throw new Error('Invalid backup file');
  return data;
}
