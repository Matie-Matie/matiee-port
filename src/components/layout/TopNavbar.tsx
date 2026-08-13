import { Search, Mail, Bell, Eye, EyeOff } from 'lucide-react';
import { useMatieeStore } from '../../store/matieeStore';
import BackupManager from '../BackupManager';

export default function TopNavbar() {
  const privacyMode = useMatieeStore((s) => s.privacyMode);
  const togglePrivacyMode = useMatieeStore((s) => s.togglePrivacyMode);
  return (
    <header className="flex items-center justify-between bg-white rounded-[999px] h-[72px] px-6 shadow-card">
      {/* ── Search ── */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search size={18} className="text-gray-500 shrink-0" />
        <input
          type="text"
          placeholder="Search task"
          className="flex-1 bg-transparent text-sm text-navy-900 placeholder:text-gray-500 outline-none min-w-0"
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-[11px] font-medium text-gray-500 shrink-0">
          <span>⌘</span> F
        </kbd>
      </div>

      {/* ── Right side ── */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Backup / Restore */}
        <BackupManager />

        {/* Privacy Toggle */}
        <button
          onClick={togglePrivacyMode}
          className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
            privacyMode
              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
              : 'bg-gray-100 text-gray-500 hover:text-navy-900 hover:bg-gray-200'
          }`}
          title={privacyMode ? 'Show sensitive data' : 'Hide sensitive data'}
        >
          {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-navy-900 hover:bg-gray-200 transition-all">
          <Mail size={18} />
        </button>
        <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-navy-900 hover:bg-gray-200 transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-status-pending ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-brand-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-navy-900 leading-tight">Matmat Edra</p>
            <p className="text-[11px] text-gray-500">reymartedra8@gmail.com</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-primary to-green-dark flex items-center justify-center text-white text-xs md:text-sm font-semibold shrink-0">
            ME
          </div>
        </div>
      </div>
    </header>
  );
}
