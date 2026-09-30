import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, CheckCircle2, Coins, Pencil, PiggyBank, Plus, ShoppingBag, Sparkles, Star, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import type { WishlistItem } from '../types';
import { projectFinance } from '../lib/finance';
import { fileToDataUrl } from '../lib/image';
import { fadeUp, stagger } from '../lib/motion';
import { R } from '../routes';
import { cn } from '../lib/cn';
import { PageHeader } from '../ui/PageHeader';
import { Button, IconButton, LinkButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Bar } from '../ui/Progress';
import { EmptyState } from '../ui/EmptyState';
import { Field, Input, MoneyInput } from '../ui/Field';
import { Money } from '../ui/Money';
import { Segmented } from '../ui/Segmented';
import { Toggle } from '../ui/Toggle';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/toast';

type View = 'all' | 'to-buy' | 'bought';

export default function SavingsGoal() {
  const projects = useMatieeStore((s) => s.projects);
  const wishlist = useMatieeStore((s) => s.wishlist);
  const accounts = useMatieeStore((s) => s.accounts);
  const addItem = useMatieeStore((s) => s.addWishlistItem);
  const updateItem = useMatieeStore((s) => s.updateWishlistItem);
  const deleteItem = useMatieeStore((s) => s.deleteWishlistItem);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState('');
  const [priority, setPriority] = useState(false);
  const [view, setView] = useState<View>('all');
  const [toDelete, setToDelete] = useState<WishlistItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Total saved = collected project revenue + money in accounts (unchanged definition)
  const projectSavings = useMemo(() => projectFinance(projects).totalRevenue, [projects]);
  const accountSavings = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalSaved = projectSavings + accountSavings;

  const bought = wishlist.filter((w) => w.bought);
  const toBuy = wishlist.filter((w) => !w.bought);
  const totalGoal = wishlist.reduce((s, w) => s + w.price, 0);
  const spent = bought.reduce((s, w) => s + w.price, 0);
  const affordable = toBuy.filter((w) => totalSaved >= w.price).length;
  const canBuyAll = wishlist.length > 0 && totalSaved >= totalGoal;

  const visible = useMemo(() => {
    const list = view === 'all' ? wishlist : view === 'bought' ? bought : toBuy;
    return [...list].sort((a, b) => (a.bought !== b.bought ? (a.bought ? 1 : -1) : a.priority !== b.priority ? (a.priority ? -1 : 1) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [view, wishlist, bought, toBuy]);

  function openEditor(item?: WishlistItem) {
    setEditing(item ?? null);
    setName(item?.name ?? '');
    setPrice(item ? String(item.price) : '');
    setPhoto(item?.photo ?? '');
    setPriority(item?.priority ?? false);
    setOpen(true);
  }

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setPhoto(await fileToDataUrl(file, 640, 0.84));
    } catch {
      toast('Could not read that image', 'danger');
    }
  }

  function save() {
    const p = parseFloat(price);
    if (!name.trim() || Number.isNaN(p) || p <= 0) return;
    const data = { name: name.trim(), price: p, photo: photo || undefined, priority };
    if (editing) {
      updateItem(editing.id, data);
      toast('Goal updated', 'success');
    } else {
      addItem(data);
      toast('Goal added', 'success');
    }
    setOpen(false);
  }

  function toggleBought(item: WishlistItem) {
    const next = !item.bought;
    updateItem(item.id, { bought: next, boughtAt: next ? new Date().toISOString() : undefined });
    if (next) toast(`Enjoy your ${item.name}!`, 'success');
  }

  const stats = [
    { icon: Wallet, label: 'Total saved', node: <Money value={totalSaved} animate />, sub: 'Collected revenue + accounts' },
    { icon: ShoppingBag, label: 'Wishlist items', node: <span className="tabular-nums">{wishlist.length}</span>, sub: affordable > 0 ? `${affordable} you can buy now` : `${toBuy.length} still saving for` },
    { icon: TrendingUp, label: 'Total goal price', node: <Money value={totalGoal} animate />, sub: canBuyAll ? 'You can afford everything' : bought.length ? <>Spent so far <Money value={spent} /></> : 'Across all items' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Savings goal"
        title="What you're saving for"
        description="Your inspiration board — every goal shows how close you are."
        actions={<Button size="lg" trailing={<Plus size={16} strokeWidth={2} />} onClick={() => openEditor()}>Add goal</Button>}
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={fadeUp} className="min-w-0 [&>*]:h-full">
              <Card bezel spotlight pad="md">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={17} strokeWidth={1.6} /></span>
                  <p className="text-[13px] text-mute">{s.label}</p>
                </div>
                <p className="text-[clamp(1.6rem,2.6vw,2rem)] font-semibold leading-none tracking-[-0.04em] text-ink">{s.node}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-mute">{canBuyAll && s.label === 'Total goal price' && <Sparkles size={12} className="text-brand-600" />}{s.sub}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <Card bezel tone="sand" pad="md">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-brand-600 shadow-soft"><Coins size={18} strokeWidth={1.6} /></span>
            <div>
              <p className="text-xs text-mute">Money in accounts</p>
              <p className="text-xl font-semibold tracking-[-0.03em] text-ink"><Money value={accountSavings} /></p>
            </div>
          </div>
          <ul className="flex flex-1 flex-wrap gap-2">
            {accounts.map((a) => (
              <li key={a.id} className="inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-1.5 text-[13px] shadow-hair ring-1 ring-ink/[0.06]">
                <span className="font-medium text-ink">{a.name}</span>
                <span className="font-semibold text-brand-700"><Money value={a.balance} /></span>
              </li>
            ))}
          </ul>
          <LinkButton to={R.money} variant="secondary" size="sm">Manage in Money Hub</LinkButton>
        </div>
      </Card>

      {wishlist.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Segmented<View> ariaLabel="Filter goals" value={view} onChange={setView} options={[{ value: 'all', label: 'All', count: wishlist.length }, { value: 'to-buy', label: 'To buy', count: toBuy.length }, { value: 'bought', label: 'Bought', count: bought.length }]} />
          {bought.length > 0 && <span className="ml-auto text-xs text-mute">Spent on buys <span className="font-semibold text-ink"><Money value={spent} /></span></span>}
        </div>
      )}

      {visible.length === 0 ? (
        <Card bezel pad="none">
          <EmptyState
            icon={PiggyBank}
            title={view === 'bought' ? 'Nothing bought yet' : view === 'to-buy' ? 'Nothing left to buy' : 'Your wishlist is empty'}
            description={view === 'bought' ? 'Items you mark as bought land here.' : view === 'to-buy' ? 'Everything is bought — or the list is clear.' : "Add something you're saving up for — a phone, a trip, a gadget."}
            action={view === 'all' ? <Button trailing={<Plus size={16} strokeWidth={2} />} onClick={() => openEditor()}>Add your first goal</Button> : undefined}
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => {
              const canBuy = totalSaved >= item.price;
              const progress = item.price > 0 ? Math.min(100, (totalSaved / item.price) * 100) : 100;
              return (
                <motion.li key={item.id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.04 }} className="min-w-0 [&>*]:h-full">
                  <Card bezel spotlight pad="none" className="group" coreClassName="flex flex-col">
                    <div className={cn('relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-paper-2 to-sand-100', item.bought && 'saturate-50')}>
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} className="h-full w-full object-cover transition-transform duration-[900ms] ease-matie group-hover:scale-[1.06]" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-faint shadow-soft"><ShoppingBag size={24} strokeWidth={1.4} /></span>
                          <span className="text-xs text-mute">No photo</span>
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />

                      <button
                        type="button"
                        onClick={() => updateItem(item.id, { priority: !item.priority })}
                        aria-pressed={item.priority}
                        aria-label={item.priority ? `Remove priority from ${item.name}` : `Mark ${item.name} as priority`}
                        className={cn('absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-[background-color,transform] duration-300 ease-matie active:scale-90', item.priority ? 'bg-warn-500 text-white' : 'bg-white/75 text-mute hover:text-warn-700')}
                      >
                        <Star size={15} strokeWidth={1.75} fill={item.priority ? 'currentColor' : 'none'} />
                      </button>

                      <div className="absolute right-3 top-3">
                        {item.bought ? <Badge tone="ink"><CheckCircle2 size={12} /> Bought</Badge> : canBuy ? <Badge tone="brand" className="bg-white/90 shadow-hair"><Sparkles size={12} /> Can buy</Badge> : null}
                      </div>

                      <div className="absolute bottom-3 right-3 flex gap-1.5 md:translate-y-1 md:opacity-0 md:transition-[opacity,transform] md:duration-500 md:ease-matie md:focus-within:translate-y-0 md:focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                        {!item.bought && <IconButton size="sm" label={`Mark ${item.name} as bought`} className="!bg-white/90 backdrop-blur-md" onClick={() => toggleBought(item)}><CheckCircle2 size={15} strokeWidth={1.75} /></IconButton>}
                        <IconButton size="sm" label={`Edit ${item.name}`} className="!bg-white/90 backdrop-blur-md" onClick={() => openEditor(item)}><Pencil size={14} strokeWidth={1.75} /></IconButton>
                        <IconButton size="sm" label={`Delete ${item.name}`} className="!bg-white/90 backdrop-blur-md !text-danger-700" onClick={() => setToDelete(item)}><Trash2 size={14} strokeWidth={1.75} /></IconButton>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className={cn('truncate text-[15px] font-semibold tracking-tight text-ink', item.bought && 'text-mute line-through decoration-ink/25')}>{item.name}</h3>
                      <div className="mt-1 flex items-baseline justify-between text-[13px]">
                        <span className="text-mute">Price</span>
                        <span className="font-semibold text-ink"><Money value={item.price} /></span>
                      </div>
                      <div className="mt-3">
                        <Bar value={progress} height={7} tone={item.bought || canBuy ? 'brand' : 'warn'} label={`${item.name} saved`} />
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-mute">
                          <span className="tabular-nums">{progress.toFixed(0)}% saved</span>
                          {!item.bought && !canBuy && <span><Money value={item.price - totalSaved} /> to go</span>}
                        </div>
                      </div>
                      {item.bought && (
                        <Button variant="soft" size="sm" className="mt-3 w-full" onClick={() => toggleBought(item)}>Undo bought</Button>
                      )}
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit goal' : 'New goal'}
        size="sm"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!name.trim() || !price || parseFloat(price) <= 0}>{editing ? 'Save changes' : 'Add goal'}</Button></>}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium text-ink-2">Photo</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink/20 bg-paper-2 transition-colors duration-300 hover:border-brand-600/50 hover:bg-brand-50/50"
            >
              {photo ? (
                <>
                  <img src={photo} alt="Preview" className="h-full w-full object-contain p-3" />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition-[background-color,opacity] duration-300 group-hover:bg-ink/35 group-hover:opacity-100"><Camera size={22} strokeWidth={1.5} /></span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 text-mute">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-brand-600 shadow-soft"><Camera size={22} strokeWidth={1.5} /></span>
                  <span className="text-sm font-medium text-ink">Add a photo</span>
                  <span className="text-xs">Resized to keep your vault light</span>
                </span>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} aria-label="Choose photo" />
            {photo && <button type="button" onClick={() => setPhoto('')} className="mt-1.5 text-xs font-medium text-danger-700 hover:underline">Remove photo</button>}
          </div>
          <Field label="Item name">{(id) => <Input id={id} data-autofocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. iPhone 17 Pro" />}</Field>
          <Field label="Price">{(id) => <MoneyInput id={id} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="89990" />}</Field>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-paper-2 p-4 ring-1 ring-ink/[0.06]">
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-ink"><Star size={15} strokeWidth={1.75} className="text-warn-500" /> Priority savings</span>
              <span className="mt-0.5 block text-xs text-mute">Shows on your dashboard</span>
            </span>
            <Toggle label="Priority savings" checked={priority} onChange={setPriority} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Remove “${toDelete?.name ?? 'item'}”?`}
        description="It will be removed from your wishlist."
        confirmLabel="Remove"
        onConfirm={() => { if (toDelete) deleteItem(toDelete.id); toast('Goal removed'); }}
      />
    </div>
  );
}
