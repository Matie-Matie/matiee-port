import { useLocation } from 'react-router-dom';
import { Eye, EyeOff, Menu, Search } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import { OWNER } from '../config';
import { IconButton } from '../ui/Button';
import { Kbd } from '../ui/Kbd';
import { Avatar } from '../ui/Avatar';
import { BackupMenu } from './BackupMenu';
import { NotificationsMenu } from './NotificationsMenu';
import { titleForPath } from './nav';
import { cn } from '../lib/cn';

export function TopBar({ onSearch, onMenu }: { onSearch: () => void; onMenu: () => void }) {
  const { pathname } = useLocation();
  const privacy = useMatieeStore((s) => s.privacyMode);
  const toggle = useMatieeStore((s) => s.togglePrivacyMode);
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

  return (
    <header className="sticky top-3 z-30 pt-3">
      <div className="flex h-14 items-center gap-2 rounded-full bg-paper/80 pl-2 pr-2 shadow-soft ring-1 ring-ink/[0.07] backdrop-blur-xl sm:pl-3">
        <IconButton label="Open menu" tone="soft" onClick={onMenu} className="lg:hidden">
          <Menu size={18} strokeWidth={1.5} />
        </IconButton>

        <div className="hidden min-w-0 items-center gap-2 pl-2 lg:flex">
          <span className="text-[13px] text-mute">Matie Port</span>
          <span className="text-faint">/</span>
          <span className="truncate text-[13px] font-medium text-ink">{titleForPath(pathname)}</span>
        </div>
        <span className="truncate pl-1 text-[15px] font-semibold tracking-tight text-ink lg:hidden">{titleForPath(pathname)}</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search or jump to (command palette)"
            className="group hidden h-10 w-[min(28vw,300px)] items-center gap-2.5 rounded-full bg-ink/[0.045] px-4 text-left text-[13px] text-mute ring-1 ring-transparent transition-[background-color,box-shadow] duration-300 ease-matie hover:bg-ink/[0.07] hover:ring-ink/10 md:flex"
          >
            <Search size={16} strokeWidth={1.5} />
            <span className="flex-1 truncate">Search or jump to…</span>
            <Kbd>{isMac ? '⌘' : 'Ctrl'} K</Kbd>
          </button>
          <IconButton label="Search" onClick={onSearch} className="md:hidden">
            <Search size={17} strokeWidth={1.5} />
          </IconButton>

          <IconButton
            label={privacy ? 'Privacy mode on — show amounts' : 'Hide amounts and names'}
            aria-pressed={privacy}
            onClick={toggle}
            className={cn(privacy && '!bg-warn-100 !text-warn-700 !ring-warn-500/30')}
          >
            {privacy ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
          </IconButton>
          <NotificationsMenu />
          <div className="hidden sm:block">
            <BackupMenu />
          </div>
          <div className="ml-1 hidden items-center gap-2.5 border-l border-ink/[0.08] pl-3 xl:flex">
            <div className="text-right leading-tight">
              <p className="text-[13px] font-semibold text-ink">{OWNER.name}</p>
              <p className="text-[11px] text-mute">{OWNER.email}</p>
            </div>
          </div>
          <Avatar name={OWNER.name} size={38} className="ml-0.5" />
        </div>
      </div>
    </header>
  );
}
