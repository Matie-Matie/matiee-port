import { Link } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useMatieeStore } from '../../store/matieeStore';
import { Card, CardHeader } from '../../ui/Card';
import { Bar } from '../../ui/Progress';
import { Money } from '../../ui/Money';
import { EmptyState } from '../../ui/EmptyState';
import { LinkButton } from '../../ui/Button';
import { R } from '../../routes';

export function SavingsCard({ totalSaved }: { totalSaved: number }) {
  const wishlist = useMatieeStore((s) => s.wishlist);
  const items = wishlist.filter((w) => w.priority && !w.bought).slice(0, 3);

  return (
    <Card bezel spotlight pad="md">
      <CardHeader
        title="Priority savings"
        description="Starred wishlist items"
        action={
          <Link to={R.savings} aria-label="Open savings goal" className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.05] text-ink-2 transition-[background-color,transform] duration-300 ease-matie hover:bg-brand-600 hover:text-white active:scale-90">
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState compact icon={Star} title="Nothing starred" description="Star a wishlist item and track how close you are to buying it." action={<LinkButton to={R.savings} variant="soft" size="sm">Open wishlist</LinkButton>} />
      ) : (
        <ul className="space-y-4">
          {items.map((it) => {
            const canBuy = totalSaved >= it.price;
            const progress = it.price > 0 ? Math.min(100, (totalSaved / it.price) * 100) : 100;
            return (
              <li key={it.id} className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-paper-2 ring-1 ring-ink/[0.06]">
                  {it.photo ? <img src={it.photo} alt="" className="h-full w-full object-cover" /> : <ShoppingBag size={18} strokeWidth={1.5} className="text-faint" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 truncate text-[13.5px] font-medium text-ink">
                      <span className="truncate">{it.name}</span>
                      {canBuy && <Sparkles size={13} className="shrink-0 text-brand-600" />}
                    </span>
                    <span className="shrink-0 text-[13px] font-semibold text-ink"><Money value={it.price} /></span>
                  </span>
                  <Bar value={progress} height={6} tone={canBuy ? 'brand' : 'warn'} label={`${it.name} savings progress`} />
                  <span className={`mt-1 block text-[11px] ${canBuy ? 'font-medium text-brand-700' : 'text-mute'}`}>
                    {canBuy ? 'You can buy this now' : <><Money value={it.price - totalSaved} /> to go</>}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
