import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, FolderPlus, Plus, UserPlus, Wallet } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Popover } from '../../ui/Popover';
import { R } from '../../routes';

const ITEMS = [
  { label: 'New project', hint: 'Fee, deadline, downpayment', icon: FolderPlus, to: `${R.projects}?new=1` },
  { label: 'New client', hint: 'Contact details and notes', icon: UserPlus, to: `${R.clients}?new=1` },
  { label: 'Log transaction', hint: 'Income or expense', icon: Wallet, to: `${R.money}?new=1` },
  { label: 'Mark attendance', hint: 'Open this month', icon: CalendarCheck, to: R.attendance },
];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative">
      <Button size="lg" trailing={<Plus size={16} strokeWidth={2} />} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        Quick add
      </Button>
      <Popover open={open} onClose={() => setOpen(false)} className="w-72 p-1.5" label="Quick add">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              type="button"
              onClick={() => { setOpen(false); navigate(it.to); }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-brand-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={16} strokeWidth={1.6} /></span>
              <span>
                <span className="block text-[13px] font-medium text-ink">{it.label}</span>
                <span className="block text-[11px] text-mute">{it.hint}</span>
              </span>
            </button>
          );
        })}
      </Popover>
    </div>
  );
}
