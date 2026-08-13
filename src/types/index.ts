export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  notes: string;
  photo?: string;
  createdAt: string;
}

export type ProjectType = 'prescription' | 'lending' | 'inventory' | 'attendance' | 'other';
export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: ProjectType;
  typeOther?: string;
  description: string;
  deadline: string;
  progress: number; // 0–100
  status: ProjectStatus;
  fee: number;
  downpayment: number;
  downpaymentPaid: boolean;
  remainingPaid: boolean;
  reminder: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  notes: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  photo?: string;
  priority: boolean;
  bought: boolean;
  boughtAt?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
}

export interface ProjectAttachment {
  id: string;
  projectId: string;
  name: string;
  type: string; // MIME type (e.g. 'application/pdf', 'image/png')
  size: number; // bytes
  data: string; // base64-encoded content
  uploadedAt: string;
}

/* ══════════════════════════════════════════════════════════
   MATIEE VAULT — new domain models
   ══════════════════════════════════════════════════════════ */

// ── Attendance ────────────────────────────────────────────
export type AttendanceStatus = 'worked' | 'half-day' | 'absent' | 'rest' | 'holiday' | 'leave';

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  worked: 'Worked',
  'half-day': 'Half Day',
  absent: 'Absent',
  rest: 'Rest Day',
  holiday: 'Holiday',
  leave: 'Leave',
};

// Rate per status (fraction of a full day, used for salary calc)
export const ATTENDANCE_RATE_FACTOR: Record<AttendanceStatus, number> = {
  worked: 1,
  'half-day': 0.5,
  absent: 0,
  rest: 0,
  holiday: 0,
  leave: 0,
};

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD (unique per day)
  status: AttendanceStatus;
  note?: string;
}

// ── Money Hub ─────────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

export const INCOME_CATEGORIES = [
  'Salary',
  'Project Payment',
  'Downpayment',
  'Referral',
  'Other',
] as const;

export const EXPENSE_CATEGORIES = [
  'Tools',
  'Subscriptions',
  'Transport',
  'Food',
  'Equipment',
  'Client Meetings',
  'Utilities',
  'Other',
] as const;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: string;
}

// ── Bank accounts / money buckets ─────────────────────────
export type AccountIcon = 'bank' | 'wallet' | 'cash' | 'card';

export interface Account {
  id: string;
  name: string; // e.g. "BPI", "GCash", "Cash"
  balance: number;
  icon: AccountIcon;
  createdAt: string;
}

// ── Recurring monthly income / bills ──────────────────────
export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  type: TransactionType; // 'income' = fixed monthly income, 'expense' = bill
  category: string;
  active: boolean;
  createdAt: string;
}

// ── Files & Contracts Vault ───────────────────────────────
export type VaultFileCategory = 'contract' | 'receipt' | 'reference' | 'certificate' | 'other';

export const VAULT_FILE_CATEGORIES: Record<VaultFileCategory, string> = {
  contract: 'Contract',
  receipt: 'Receipt',
  reference: 'Reference',
  certificate: 'Certificate',
  other: 'Other',
};

export interface VaultFile {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  data: string; // base64
  category: VaultFileCategory;
  description?: string;
  uploadedAt: string;
}

// ── Knowledge Vault ───────────────────────────────────────
export type KnowledgeCategory = 'terms' | 'playbook' | 'design' | 'lessons' | 'other';

export const KNOWLEDGE_CATEGORIES: Record<KnowledgeCategory, string> = {
  terms: 'Terms',
  playbook: 'Playbook',
  design: 'Design',
  lessons: 'Lessons',
  other: 'Other',
};

export interface KnowledgeNote {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  prescription: 'Prescription Processing',
  lending: 'Lending System',
  inventory: 'Sale & Inventory',
  attendance: 'Attendance System',
  other: 'Other',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  'on-hold': 'On Hold',
};
