import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CalendarCheck,
  Wallet,
  PiggyBank,
  LineChart,
  FolderLock,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { R } from '../routes';

export interface NavItem {
  key: string;
  label: string;
  short: string;
  icon: LucideIcon;
  path: string;
  /** Extra words the command palette should match. */
  keywords: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, path: R.dashboard, keywords: 'home overview' },
      { key: 'clients', label: 'Clients', short: 'Clients', icon: Users, path: R.clients, keywords: 'people customers contacts' },
      { key: 'projects', label: 'Projects', short: 'Projects', icon: FolderKanban, path: R.projects, keywords: 'work jobs deadlines' },
    ],
  },
  {
    title: 'Money',
    items: [
      { key: 'money', label: 'Money Hub', short: 'Money', icon: Wallet, path: R.money, keywords: 'income expenses transactions cash' },
      { key: 'savings', label: 'Savings Goal', short: 'Savings', icon: PiggyBank, path: R.savings, keywords: 'wishlist accounts bank gcash' },
      { key: 'insights', label: 'Insights', short: 'Insights', icon: LineChart, path: R.insights, keywords: 'charts analytics reports' },
    ],
  },
  {
    title: 'Vault',
    items: [
      { key: 'attendance', label: 'Attendance', short: 'Attendance', icon: CalendarCheck, path: R.attendance, keywords: 'salary days calendar work' },
      { key: 'files', label: 'Files & Contracts', short: 'Files', icon: FolderLock, path: R.files, keywords: 'documents upload receipts contract' },
      { key: 'knowledge', label: 'Knowledge Vault', short: 'Notes', icon: BookOpen, path: R.knowledge, keywords: 'notes terms playbook lessons' },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActivePath(itemPath: string, pathname: string): boolean {
  if (itemPath === R.dashboard) return pathname === R.dashboard || pathname === R.dashboard + '/';
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}

export function titleForPath(pathname: string): string {
  const hit = NAV_ITEMS.find((n) => isActivePath(n.path, pathname));
  return hit?.label ?? 'Dashboard';
}
