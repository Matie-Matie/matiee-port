import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppShell from './app/AppShell';
import { useMatieeStore } from './store/matieeStore';
import { LEGACY_REDIRECTS, R } from './routes';

const Landing = lazy(() => import('./landing/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const Attendance = lazy(() => import('./pages/Attendance'));
const MoneyHub = lazy(() => import('./pages/MoneyHub'));
const FilesVault = lazy(() => import('./pages/FilesVault'));
const KnowledgeVault = lazy(() => import('./pages/KnowledgeVault'));
const Insights = lazy(() => import('./pages/Insights'));
const SavingsGoal = lazy(() => import('./pages/SavingsGoal'));

function Fallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );
}

/** Has this browser already got a working vault? (seeded notes don't count) */
function hasVaultData(): boolean {
  try {
    const raw = localStorage.getItem('matieeport-storage');
    if (!raw) return false;
    const state = JSON.parse(raw)?.state;
    if (!state) return false;
    return ['clients', 'projects', 'payments', 'transactions', 'attendance', 'accounts', 'wishlist', 'vaultFiles'].some(
      (k) => Array.isArray(state[k]) && state[k].length > 0,
    );
  } catch {
    return false;
  }
}

/**
 * `/` is the marketing page for first-time visitors. Anyone who already has a
 * vault here (or opens the installed app) goes straight to their dashboard.
 * The landing page is always reachable at /welcome.
 */
function Entry() {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone || hasVaultData()) return <Navigate to={R.dashboard} replace />;
  return <Landing />;
}

/** Old bookmarks (/clients, /money …) keep working — they forward to /app/…  */
function LegacyRedirect() {
  const { pathname } = useLocation();
  const clientMatch = pathname.match(/^\/clients\/([^/]+)$/);
  if (clientMatch) return <Navigate to={R.client(clientMatch[1])} replace />;
  const target = LEGACY_REDIRECTS[pathname.replace(/\/$/, '')];
  return <Navigate to={target ?? R.dashboard} replace />;
}

export default function App() {
  // Seed the Knowledge Vault with core terms on first load
  useEffect(() => {
    useMatieeStore.getState().seedTerms();
  }, []);

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="money" element={<MoneyHub />} />
          <Route path="files" element={<FilesVault />} />
          <Route path="knowledge" element={<KnowledgeVault />} />
          <Route path="insights" element={<Insights />} />
          <Route path="savings" element={<SavingsGoal />} />
          <Route path="*" element={<Navigate to={R.dashboard} replace />} />
        </Route>
        <Route path="/" element={<Entry />} />
        <Route path="/welcome" element={<Landing />} />
        <Route path="*" element={<LegacyRedirect />} />
      </Routes>
    </Suspense>
  );
}
