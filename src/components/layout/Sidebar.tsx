import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  Wallet,
  FolderOpen,
  BookOpen,
  LineChart,
  PiggyBank,
} from 'lucide-react';
import { useMatieeStore } from '../../store/matieeStore';
import logo from '../../assets/user profile.jpg';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Clients', icon: ClipboardList, path: '/clients' },
  { label: 'Projects', icon: BarChart3, path: '/projects' },
  { label: 'Attendance', icon: CalendarCheck, path: '/attendance' },
  { label: 'Money Hub', icon: Wallet, path: '/money' },
  { label: 'Files & Contracts', icon: FolderOpen, path: '/files' },
  { label: 'Knowledge Vault', icon: BookOpen, path: '/knowledge' },
  { label: 'Insights', icon: LineChart, path: '/insights' },
  { label: 'Savings Goal', icon: PiggyBank, path: '/savings' },
];

export default function Sidebar() {
  const location = useLocation();
  const clientCount = useMatieeStore((s) => s.clients.length);
  const attendanceCount = useMatieeStore((s) => s.attendance.length);

  const isActive = (path: string) => {
    if (path === '#') return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-[260px] min-h-full flex flex-col bg-white rounded-[26px] p-8 shrink-0">
      {/* ── Logo ── */}
      <Link to="/" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
          <img src={logo} alt="Matie Port" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <span className="text-xl font-semibold text-navy-900 tracking-tight block leading-tight">Matie Port</span>
          <span className="text-[10px] font-medium text-green-primary tracking-wide">Business Vault</span>
        </div>
      </Link>

      {/* ── Nav ── */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${active
                  ? 'text-navy-900 bg-green-mint/40'
                  : 'text-gray-500 hover:text-navy-900 hover:bg-gray-100/60'
                }
              `}
            >
              {active && (
                <span className="absolute left-0 w-[3px] h-5 bg-green-primary rounded-full -translate-x-3" />
              )}
              <Icon size={18} className={active ? 'text-green-primary' : ''} />
              <span>{item.label}</span>
              {item.label === 'Clients' && clientCount > 0 && (
                <span className="ml-auto text-[11px] font-semibold bg-green-primary text-white px-2 py-0.5 rounded-full">
                  {clientCount}
                </span>
              )}
              {item.label === 'Attendance' && attendanceCount > 0 && (
                <span className="ml-auto text-[11px] font-semibold bg-green-mint text-green-dark px-2 py-0.5 rounded-full">
                  {attendanceCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile ── */}
      <div className="flex items-center gap-3 pt-6 mt-6 border-t border-brand-50">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-primary to-green-dark flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          ME
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-900 leading-tight truncate">Matmat Edra</p>
          <p className="text-[11px] text-gray-500 truncate">reymartedra8@gmail.com</p>
        </div>
      </div>
    </aside>
  );
}
