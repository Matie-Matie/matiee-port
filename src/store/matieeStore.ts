import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Client, Project, Payment, Note, WishlistItem, ProjectAttachment,
  AttendanceRecord, AttendanceStatus, Transaction, VaultFile, KnowledgeNote,
  Account, RecurringItem,
} from '../types';

// ═══════════════════════════════════════════════════════════════════
// API sync helper — fires requests in the background (optional).
// If json-server isn't running, it silently fails — no data loss.
// ═══════════════════════════════════════════════════════════════════
import * as api from '../api';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── State type ──
interface MatieeState {
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  notes: Note[];
  wishlist: WishlistItem[];
  attachments: ProjectAttachment[];
  customSavings: number;
  privacyMode: boolean;

  // ── Matiee Vault ──
  attendance: AttendanceRecord[];
  dailyRate: number; // expected salary per worked day (₱)
  transactions: Transaction[];
  vaultFiles: VaultFile[];
  knowledgeNotes: KnowledgeNote[];
  accounts: Account[];
  recurring: RecurringItem[];

  // Backup / restore
  hydrate: (data: {
    clients: Client[];
    projects: Project[];
    payments: Payment[];
    notes: Note[];
    wishlist: WishlistItem[];
    attachments: ProjectAttachment[];
    customSavings: number;
    privacyMode: boolean;
    attendance: AttendanceRecord[];
    dailyRate: number;
    transactions: Transaction[];
    vaultFiles: VaultFile[];
    knowledgeNotes: KnowledgeNote[];
    accounts: Account[];
    recurring: RecurringItem[];
  }) => void;

  // Merge backup into existing data (keeps everything, adds/updates from file)
  mergeBackup: (data: {
    clients: Client[];
    projects: Project[];
    payments: Payment[];
    notes: Note[];
    wishlist: WishlistItem[];
    attachments: ProjectAttachment[];
    customSavings?: number;
    privacyMode?: boolean;
    attendance: AttendanceRecord[];
    dailyRate?: number;
    transactions: Transaction[];
    vaultFiles: VaultFile[];
    knowledgeNotes: KnowledgeNote[];
    accounts?: Account[];
    recurring?: RecurringItem[];
  }) => void;

  // Local prefs
  setCustomSavings: (amount: number) => void;
  togglePrivacyMode: () => void;

  // Wishlist
  addWishlistItem: (w: Omit<WishlistItem, 'id' | 'createdAt' | 'bought' | 'boughtAt'>) => WishlistItem;
  updateWishlistItem: (id: string, data: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;

  // Client
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;

  // Project
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  getProjectsByClient: (clientId: string) => Project[];

  // Payment
  addPayment: (p: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  deletePayment: (id: string) => void;
  getPaymentsByProject: (projectId: string) => Payment[];

  // Note
  addNote: (n: Omit<Note, 'id' | 'createdAt'>) => Note;
  deleteNote: (id: string) => void;
  getNotesByClient: (clientId: string) => Note[];

  // Attachment
  addAttachment: (projectId: string, file: { name: string; type: string; size: number; data: string }) => ProjectAttachment;
  deleteAttachment: (id: string) => void;
  getAttachmentsByProject: (projectId: string) => ProjectAttachment[];

  // ── Attendance ──
  setAttendance: (date: string, status: AttendanceStatus, note?: string) => void;
  clearAttendance: (date: string) => void;
  getAttendance: (date: string) => AttendanceRecord | undefined;
  setDailyRate: (rate: number) => void;

  // ── Transactions (Money Hub) ──
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  deleteTransaction: (id: string) => void;

  // ── Vault Files ──
  addVaultFile: (f: Omit<VaultFile, 'id' | 'uploadedAt'>) => VaultFile;
  deleteVaultFile: (id: string) => void;

  // ── Knowledge Notes ──
  addKnowledgeNote: (n: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => KnowledgeNote;
  updateKnowledgeNote: (id: string, data: Partial<KnowledgeNote>) => void;
  deleteKnowledgeNote: (id: string) => void;
  seedTerms: () => void;

  // ── Accounts (bank accounts / money buckets) ──
  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => Account;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // ── Recurring (fixed monthly income / bills) ──
  addRecurring: (r: Omit<RecurringItem, 'id' | 'createdAt'>) => RecurringItem;
  updateRecurring: (id: string, data: Partial<RecurringItem>) => void;
  deleteRecurring: (id: string) => void;

  // Derived
  getTotalRevenue: () => number;
  getOutstandingBalance: () => number;
  getUpcomingDeadlines: (days?: number) => Project[];
  getClientsWithProjectCount: () => (Client & { projectCount: number })[];
}

export const useMatieeStore = create<MatieeState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──
      clients: [],
      projects: [],
      payments: [],
      notes: [],
      wishlist: [],
      attachments: [],
      customSavings: 0,
      privacyMode: false,

      // ── Matiee Vault initial ──
      attendance: [],
      dailyRate: 500,
      transactions: [],
      vaultFiles: [],
      knowledgeNotes: [],
      accounts: [],
      recurring: [],

      // ── Backup / restore ──
      hydrate: (data) => {
        set({
          clients: data.clients,
          projects: data.projects,
          payments: data.payments,
          notes: data.notes,
          wishlist: data.wishlist,
          attachments: data.attachments,
          customSavings: data.customSavings,
          privacyMode: data.privacyMode,
          attendance: data.attendance ?? [],
          dailyRate: data.dailyRate ?? 500,
          transactions: data.transactions ?? [],
          vaultFiles: data.vaultFiles ?? [],
          knowledgeNotes: data.knowledgeNotes ?? [],
          accounts: data.accounts ?? [],
          recurring: data.recurring ?? [],
        });
      },

      // Merge backup into existing data.
      // For arrays: existing items are kept, imported items are added if
      // their id is new, or override if the same id already exists.
      // Attendance is keyed by `date` instead of `id`.
      // For scalars (savings, rate, privacy): imported value only used if
      // there's nothing local yet, so an older backup can't wipe a newer value.
      mergeBackup: (data) => {
        const mergeById = <T extends { id: string }>(existing: T[], incoming: T[]) => {
          const map = new Map<string, T>();
          existing.forEach((item) => map.set(item.id, item));
          incoming.forEach((item) => map.set(item.id, item)); // imported wins on same id
          return [...map.values()];
        };

        const mergeAttendance = (existing: AttendanceRecord[], incoming: AttendanceRecord[]) => {
          const map = new Map<string, AttendanceRecord>();
          existing.forEach((a) => map.set(a.date, a));
          incoming.forEach((a) => map.set(a.date, a)); // imported wins on same date
          return [...map.values()];
        };

        set((s) => ({
          clients: mergeById(s.clients, data.clients ?? []),
          projects: mergeById(s.projects, data.projects ?? []),
          payments: mergeById(s.payments, data.payments ?? []),
          notes: mergeById(s.notes, data.notes ?? []),
          wishlist: mergeById(s.wishlist, data.wishlist ?? []),
          attachments: mergeById(s.attachments, data.attachments ?? []),
          attendance: mergeAttendance(s.attendance, data.attendance ?? []),
          transactions: mergeById(s.transactions, data.transactions ?? []),
          vaultFiles: mergeById(s.vaultFiles, data.vaultFiles ?? []),
          knowledgeNotes: mergeById(s.knowledgeNotes, data.knowledgeNotes ?? []),
          accounts: mergeById(s.accounts, data.accounts ?? []),
          recurring: mergeById(s.recurring, data.recurring ?? []),
          customSavings: s.customSavings || data.customSavings || 0,
          privacyMode: s.privacyMode || data.privacyMode || false,
          dailyRate: s.dailyRate || data.dailyRate || 500,
        }));
      },

      // ── Local preferences ──
      setCustomSavings: (amount) => set({ customSavings: amount }),

      togglePrivacyMode: () => set((s) => ({ privacyMode: !s.privacyMode })),

      // ── Wishlist ──
      addWishlistItem: (data) => {
        const item: WishlistItem = { ...data, id: genId(), bought: false, createdAt: new Date().toISOString() };
        set((s) => ({ wishlist: [...s.wishlist, item] }));
        api.create('wishlist', item).catch(() => {});
        return item;
      },

      updateWishlistItem: (id, data) => {
        set((s) => ({
          wishlist: s.wishlist.map((w) => (w.id === id ? { ...w, ...data } : w)),
        }));
        api.update('wishlist', id, data).catch(() => {});
      },

      deleteWishlistItem: (id) => {
        set((s) => ({ wishlist: s.wishlist.filter((w) => w.id !== id) }));
        api.remove('wishlist', id).catch(() => {});
      },

      // ── Client ──
      addClient: (data) => {
        const client: Client = { ...data, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ clients: [...s.clients, client] }));
        api.create('clients', client).catch(() => {});
        return client;
      },

      updateClient: (id, data) => {
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        api.update('clients', id, data).catch(() => {});
      },

      deleteClient: (id) => {
        const relatedProjects = get().projects.filter((p) => p.clientId === id);
        const relatedProjectIds = relatedProjects.map((p) => p.id);
        const relatedPayments = get().payments.filter((py) => relatedProjectIds.includes(py.projectId));
        const relatedNotes = get().notes.filter((n) => n.clientId === id);

        set((s) => ({
          clients: s.clients.filter((c) => c.id !== id),
          projects: s.projects.filter((p) => p.clientId !== id),
          payments: s.payments.filter((py) => !relatedProjectIds.includes(py.projectId)),
          notes: s.notes.filter((n) => n.clientId !== id),
          attachments: s.attachments.filter((a) => !relatedProjectIds.includes(a.projectId)),
        }));

        // Sync deletions to API (fire-and-forget)
        Promise.all([
          api.remove('clients', id),
          ...relatedProjects.map((p) => api.remove('projects', p.id)),
          ...relatedPayments.map((py) => api.remove('payments', py.id)),
          ...relatedNotes.map((n) => api.remove('notes', n.id)),
        ]).catch(() => {});
      },

      getClient: (id) => get().clients.find((c) => c.id === id),

      // ── Project ──
      addProject: (data) => {
        const project: Project = { ...data, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ projects: [...s.projects, project] }));
        api.create('projects', project).catch(() => {});
        return project;
      },

      updateProject: (id, data) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
        api.update('projects', id, data).catch(() => {});
      },

      deleteProject: (id) => {
        const relatedPayments = get().payments.filter((p) => p.projectId === id);
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          payments: s.payments.filter((py) => py.projectId !== id),
          attachments: s.attachments.filter((a) => a.projectId !== id),
        }));
        Promise.all([
          api.remove('projects', id),
          ...relatedPayments.map((py) => api.remove('payments', py.id)),
        ]).catch(() => {});
      },

      getProject: (id) => get().projects.find((p) => p.id === id),

      getProjectsByClient: (clientId) =>
        get().projects.filter((p) => p.clientId === clientId),

      // ── Payment ──
      addPayment: (data) => {
        const payment: Payment = { ...data, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ payments: [...s.payments, payment] }));
        api.create('payments', payment).catch(() => {});
        return payment;
      },

      deletePayment: (id) => {
        set((s) => ({ payments: s.payments.filter((p) => p.id !== id) }));
        api.remove('payments', id).catch(() => {});
      },

      getPaymentsByProject: (projectId) =>
        get().payments.filter((p) => p.projectId === projectId),

      // ── Note ──
      addNote: (data) => {
        const note: Note = { ...data, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ notes: [...s.notes, note] }));
        api.create('notes', note).catch(() => {});
        return note;
      },

      deleteNote: (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        api.remove('notes', id).catch(() => {});
      },

      getNotesByClient: (clientId) =>
        get().notes.filter((n) => n.clientId === clientId),

      // ── Attachment ──
      addAttachment: (projectId, file) => {
        const attachment: ProjectAttachment = {
          ...file,
          id: genId(),
          projectId,
          uploadedAt: new Date().toISOString(),
        };
        set((s) => ({ attachments: [...s.attachments, attachment] }));
        return attachment;
      },

      deleteAttachment: (id) => {
        set((s) => ({ attachments: s.attachments.filter((a) => a.id !== id) }));
      },

      getAttachmentsByProject: (projectId) =>
        get().attachments.filter((a) => a.projectId === projectId),

      // ── Attendance ──
      setAttendance: (date, status, note) => {
        set((s) => {
          const existing = s.attendance.find((a) => a.date === date);
          if (existing) {
            return {
              attendance: s.attendance.map((a) => (a.date === date ? { ...a, status, note } : a)),
            };
          }
          return { attendance: [...s.attendance, { date, status, note }] };
        });
      },

      clearAttendance: (date) => {
        set((s) => ({ attendance: s.attendance.filter((a) => a.date !== date) }));
      },

      getAttendance: (date) => get().attendance.find((a) => a.date === date),

      setDailyRate: (rate) => set({ dailyRate: Math.max(0, rate) }),

      // ── Transactions (Money Hub) ──
      addTransaction: (data) => {
        const tx: Transaction = { ...data, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ transactions: [...s.transactions, tx] }));
        return tx;
      },

      deleteTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
      },

      // ── Vault Files ──
      addVaultFile: (data) => {
        const file: VaultFile = { ...data, id: genId(), uploadedAt: new Date().toISOString() };
        set((s) => ({ vaultFiles: [...s.vaultFiles, file] }));
        return file;
      },

      deleteVaultFile: (id) => {
        set((s) => ({ vaultFiles: s.vaultFiles.filter((f) => f.id !== id) }));
      },

      // ── Knowledge Notes ──
      addKnowledgeNote: (data) => {
        const now = new Date().toISOString();
        const note: KnowledgeNote = { ...data, id: genId(), createdAt: now, updatedAt: now };
        set((s) => ({ knowledgeNotes: [...s.knowledgeNotes, note] }));
        return note;
      },

      updateKnowledgeNote: (id, data) => {
        set((s) => ({
          knowledgeNotes: s.knowledgeNotes.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n,
          ),
        }));
      },

      deleteKnowledgeNote: (id) => {
        set((s) => ({ knowledgeNotes: s.knowledgeNotes.filter((n) => n.id !== id) }));
      },

      seedTerms: () => {
        const existing = get().knowledgeNotes;
        if (existing.some((n) => n.category === 'terms')) return;
        const now = new Date().toISOString();
        const terms: KnowledgeNote = {
          id: genId(),
          title: 'My DORY PH Terms',
          content: [
            '• Junior Software Engineer — Web team',
            '• Hired: Aug 5, 2026 (1 of 2 from 10 applicants)',
            '• Rate: ₱500/day (provincial minimum)',
            '• Probation: 3–6 months',
            '• CTO handles me personally — cleared as front-end/design dev',
            '• First assignment: "the Website for Universe"',
          ].join('\n'),
          category: 'terms',
          tags: ['dory', 'employment', 'salary'],
          pinned: true,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ knowledgeNotes: [...s.knowledgeNotes, terms] }));
      },

      // ── Accounts ──
      addAccount: (data) => {
        const account: Account = { ...data, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ accounts: [...s.accounts, account] }));
        return account;
      },

      updateAccount: (id, data) => {
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }));
      },

      deleteAccount: (id) => {
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
      },

      // ── Recurring ──
      addRecurring: (data) => {
        const item: RecurringItem = { ...data, id: genId(), createdAt: new Date().toISOString() };
        set((s) => ({ recurring: [...s.recurring, item] }));
        return item;
      },

      updateRecurring: (id, data) => {
        set((s) => ({
          recurring: s.recurring.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },

      deleteRecurring: (id) => {
        set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) }));
      },

      // ── Derived ──
      getTotalRevenue: () =>
        get().payments.reduce((sum, p) => sum + p.amount, 0),

      getOutstandingBalance: () =>
        get().projects.reduce((sum, p) => sum + (p.fee - p.downpayment), 0),

      getUpcomingDeadlines: (days = 30) => {
        const now = new Date();
        const future = new Date(now.getTime() + days * 86_400_000);
        return get().projects.filter((p) => {
          if (!p.deadline) return false;
          const d = new Date(p.deadline);
          return d >= now && d <= future && p.status !== 'completed';
        });
      },

      getClientsWithProjectCount: () =>
        get().clients.map((c) => ({
          ...c,
          projectCount: get().projects.filter((p) => p.clientId === c.id).length,
        })),
    }),
    {
      name: 'matieeport-storage',
      version: 3,
      migrate: (persisted: any, version) => {
        // v2 → v3: move customSavings into a Cash account if user had one
        if (version < 3) {
          const p = persisted as any;
          const custom = typeof p?.customSavings === 'number' ? p.customSavings : 0;
          if (custom > 0) {
            return {
              ...p,
              customSavings: 0,
              accounts: [{ id: 'seed-cash', name: 'Cash', balance: custom, icon: 'cash', createdAt: new Date().toISOString() }],
            };
          }
        }
        return persisted as any;
      },
    },
  ),
);
