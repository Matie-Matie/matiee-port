// Central route table. The working app lives under /app; the marketing
// page lives at / (and /welcome). Old top-level paths redirect (see App.tsx).
export const R = {
  home: '/',
  welcome: '/welcome',
  dashboard: '/app',
  clients: '/app/clients',
  client: (id: string) => `/app/clients/${id}`,
  projects: '/app/projects',
  attendance: '/app/attendance',
  money: '/app/money',
  files: '/app/files',
  knowledge: '/app/knowledge',
  insights: '/app/insights',
  savings: '/app/savings',
} as const;

// Legacy (pre-redesign) top-level paths → new locations.
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/clients': R.clients,
  '/projects': R.projects,
  '/attendance': R.attendance,
  '/calendar': R.attendance,
  '/money': R.money,
  '/files': R.files,
  '/knowledge': R.knowledge,
  '/insights': R.insights,
  '/savings': R.savings,
};
