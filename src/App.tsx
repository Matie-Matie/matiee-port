import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { useMatieeStore } from './store/matieeStore';

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
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-2 border-[#1C6F45] border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  // Seed the Knowledge Vault with core terms on first load
  useEffect(() => {
    useMatieeStore.getState().seedTerms();
  }, []);

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/calendar" element={<Navigate to="/attendance" replace />} />
          <Route path="/money" element={<MoneyHub />} />
          <Route path="/files" element={<FilesVault />} />
          <Route path="/knowledge" element={<KnowledgeVault />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/savings" element={<SavingsGoal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
