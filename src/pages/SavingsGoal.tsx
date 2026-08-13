import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
  Camera,
  X,
  Wallet,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Star,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { useMatieeStore } from '../store/matieeStore';
import type { WishlistItem } from '../types';
import Reveal from '../components/Reveal';

export default function SavingsGoal() {
  const navigate = useNavigate();
  const projects = useMatieeStore((s) => s.projects);
  const wishlist = useMatieeStore((s) => s.wishlist);
  const accounts = useMatieeStore((s) => s.accounts);
  const addWishlistItem = useMatieeStore((s) => s.addWishlistItem);
  const updateWishlistItem = useMatieeStore((s) => s.updateWishlistItem);
  const deleteWishlistItem = useMatieeStore((s) => s.deleteWishlistItem);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalPrice, setModalPrice] = useState('');
  const [modalPhoto, setModalPhoto] = useState('');
  const [modalPriority, setModalPriority] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View filter: all / to-buy / bought
  const [view, setView] = useState<'all' | 'to-buy' | 'bought'>('all');

  // Total saved = project payments + money in bank accounts
  const projectSavings = useMemo(
    () =>
      projects.reduce((sum, p) => {
        let rev = 0;
        if (p.downpaymentPaid) rev += p.downpayment;
        if (p.remainingPaid) rev += p.fee - p.downpayment;
        return sum + rev;
      }, 0),
    [projects],
  );
  const accountSavings = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalSaved = projectSavings + accountSavings;

  // Stats
  const boughtItems = wishlist.filter((w) => w.bought);
  const toBuyItems = wishlist.filter((w) => !w.bought);
  const totalGoalPrice = wishlist.reduce((sum, w) => sum + w.price, 0);
  const totalBoughtSpent = boughtItems.reduce((sum, w) => sum + w.price, 0);
  const affordableCount = toBuyItems.filter((w) => totalSaved >= w.price).length;
  const canBuyAll = totalSaved >= totalGoalPrice;

  // Visible items based on view
  const visibleItems = view === 'all' ? wishlist : view === 'bought' ? boughtItems : toBuyItems;

  // ── Modal handlers ──
  const openAdd = () => {
    setEditingItem(null);
    setModalName('');
    setModalPrice('');
    setModalPhoto('');
    setModalPriority(false);
    setShowModal(true);
  };

  const openEdit = (item: WishlistItem) => {
    setEditingItem(item);
    setModalName(item.name);
    setModalPrice(String(item.price));
    setModalPhoto(item.photo || '');
    setModalPriority(item.priority);
    setShowModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setModalPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const price = parseFloat(modalPrice);
    if (!modalName.trim() || isNaN(price) || price <= 0) return;

    const data = { name: modalName.trim(), price, photo: modalPhoto || undefined, priority: modalPriority };

    if (editingItem) {
      updateWishlistItem(editingItem.id, data);
    } else {
      addWishlistItem(data);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this item from your wishlist?')) {
      deleteWishlistItem(id);
    }
  };

  const toggleBought = (item: WishlistItem) => {
    const bought = !item.bought;
    updateWishlistItem(item.id, { bought, boughtAt: bought ? new Date().toISOString() : undefined });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2D2D2D]">Wishlist</h1>
            <p className="text-[#6B7280] mt-1">Your inspiration board — add things you're saving up for</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1C6F45] text-white rounded-xl hover:bg-[#155835] transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={18} />
            Add Goal
          </button>
        </div>
      </Reveal>

      {/* ── Top Stats Bar ── */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[22px] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C6F45]/10 flex items-center justify-center">
                <Wallet size={20} className="text-[#1C6F45]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Saved</p>
                <p className="text-xl font-bold text-[#2D2D2D]">₱{totalSaved.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[22px] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <ShoppingBag size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Wishlist Items</p>
                <p className="text-xl font-bold text-[#2D2D2D]">
                  {wishlist.length}
                  {affordableCount > 0 && (
                    <span className="text-sm font-normal text-[#1C6F45] ml-2">
                      ({affordableCount} can buy!)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[22px] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Total Goal Price</p>
                <p className="text-xl font-bold text-[#2D2D2D]">₱{totalGoalPrice.toLocaleString()}</p>
              </div>
            </div>
            {canBuyAll && (
              <div className="mt-2 flex items-center gap-1 text-xs text-[#1C6F45] font-medium">
                <Sparkles size={12} />
                You can afford everything! 🎉
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* ── View Filter ── */}
      <Reveal delay={0.08}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${view === 'all' ? 'bg-[#1C6F45] text-white' : 'bg-white text-[#6B7280] border border-gray-100 hover:bg-gray-50'}`}
          >
            All ({wishlist.length})
          </button>
          <button
            onClick={() => setView('to-buy')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${view === 'to-buy' ? 'bg-[#1C6F45] text-white' : 'bg-white text-[#6B7280] border border-gray-100 hover:bg-gray-50'}`}
          >
            To Buy ({toBuyItems.length})
          </button>
          <button
            onClick={() => setView('bought')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${view === 'bought' ? 'bg-[#1C6F45] text-white' : 'bg-white text-[#6B7280] border border-gray-100 hover:bg-gray-50'}`}
          >
            Bought ({boughtItems.length})
          </button>
          {boughtItems.length > 0 && (
            <span className="ml-auto text-xs font-medium text-[#6B7280]">
              Spent on buys: <span className="font-bold text-[#2D2D2D]">₱{totalBoughtSpent.toLocaleString()}</span>
            </span>
          )}
        </div>
      </Reveal>

      {/* ── Accounts Card ── */}
      <Reveal delay={0.1}>
        <div className="bg-white rounded-[22px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Coins size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Money in Accounts</p>
                <p className="text-xl font-bold text-[#2D2D2D]">
                  ₱{accountSavings.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/money')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl text-[#6B7280] hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Manage in Money Hub
            </button>
          </div>

          {accounts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {accounts.map((a) => (
                <span key={a.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-50 text-sm">
                  <span className="font-medium text-[#2D2D2D]">{a.name}</span>
                  <span className="font-bold text-[#1C6F45]">₱{a.balance.toLocaleString()}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* ── Wishlist Grid ── */}
      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {[...visibleItems]
              .sort((a, b) => {
                if (a.bought !== b.bought) return a.bought ? 1 : -1;
                if (a.priority !== b.priority) return a.priority ? -1 : 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((item, i) => {
                const canBuy = totalSaved >= item.price;
                const progress = Math.min(100, (totalSaved / item.price) * 100);
                const remaining = Math.max(0, item.price - totalSaved);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className={`bg-white rounded-[22px] overflow-hidden shadow-sm border border-gray-100 group ${item.bought ? 'opacity-90' : ''}`}
                  >
                    {/* Photo area */}
                    <div className={`relative aspect-[4/5] bg-gradient-to-br from-[#F0F2F5] via-[#F6F6F6] to-gray-100 overflow-hidden ${item.bought ? 'grayscale-[0.6]' : ''}`}>
                      {item.photo ? (
                        <>
                          {/* Image */}
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-[0.5deg]"
                          />
                          {/* Gradient vignette for depth */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                          {/* Subtle inner border ring */}
                          <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.03] rounded-none pointer-events-none" />
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2.5">
                          <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center">
                            <ShoppingBag size={28} className="text-gray-300" />
                          </div>
                          <span className="text-xs text-gray-300 font-medium tracking-wide">No Photo</span>
                        </div>
                      )}

                      {/* Bought! badge */}
                      {item.bought ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C6F45] text-white text-xs font-bold rounded-full shadow-lg shadow-[#1C6F45]/20">
                          <CheckCircle2 size={12} />
                          Bought!
                        </div>
                      ) : (
                        canBuy && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C6F45] text-white text-xs font-bold rounded-full shadow-lg shadow-[#1C6F45]/20">
                            <Sparkles size={12} />
                            Can Buy!
                          </div>
                        )
                      )}

                      {/* Priority star */}
                      <button
                        onClick={() => updateWishlistItem(item.id, { priority: !item.priority })}
                        className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-sm shadow-sm transition-all ${
                          item.priority
                            ? 'bg-amber-400/90 text-white hover:bg-amber-500'
                            : 'bg-white/70 text-gray-300 hover:text-amber-400 hover:bg-white/90 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Star size={14} fill={item.priority ? 'currentColor' : 'none'} />
                      </button>

                      {/* Action buttons (bottom-right on hover) */}
                      <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[4px] group-hover:translate-y-0">
                        {!item.bought && (
                          <button
                            onClick={() => toggleBought(item)}
                            className="p-2 bg-[#1C6F45]/90 backdrop-blur-sm rounded-xl text-white hover:bg-[#1C6F45] shadow-sm transition-all"
                            title="Mark as bought"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-[#6B7280] hover:text-[#2D2D2D] hover:bg-white shadow-sm transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-400 hover:text-red-600 hover:bg-white shadow-sm transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <h3 className={`font-bold text-[#2D2D2D] truncate ${item.bought ? 'line-through text-gray-400' : ''}`}>{item.name}</h3>

                      {/* Price row */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B7280]">Price</span>
                        <span className="font-semibold text-[#2D2D2D]">₱{item.price.toLocaleString()}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6B7280]">Saved</span>
                          <span className={`font-medium ${canBuy ? 'text-[#1C6F45]' : 'text-[#2D2D2D]'}`}>
                            ₱{totalSaved.toLocaleString()} / ₱{item.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              item.bought ? 'bg-[#1C6F45]' : canBuy ? 'bg-[#1C6F45]' : 'bg-amber-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Remaining / Can Buy / Undo */}
                      <div className="pt-1">
                        {item.bought ? (
                          <button
                            onClick={() => toggleBought(item)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-mint/40 rounded-xl text-[#155C39] text-sm font-semibold hover:bg-green-mint/70 transition-colors"
                          >
                            <CheckCircle2 size={14} />
                            Marked as bought — undo
                          </button>
                        ) : canBuy ? (
                          <div className="flex items-center justify-center gap-1.5 py-2 bg-[#1C6F45]/5 rounded-xl text-[#1C6F45] text-sm font-semibold">
                            <Sparkles size={14} />
                            You can buy this!
                          </div>
                        ) : (
                          <p className="text-xs text-[#6B7280] text-center">
                            ₱{remaining.toLocaleString()} more to go
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      ) : (
        /* ── Empty State ── */
        <Reveal delay={0.1}>
          <div className="bg-white rounded-[22px] p-16 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F6F6F6] flex items-center justify-center mb-4">
              <PiggyBank size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">
              {view === 'bought' ? 'Nothing bought yet' : view === 'to-buy' ? 'Nothing to buy — nice!' : 'Your wishlist is empty'}
            </h3>
            <p className="text-sm text-[#6B7280] max-w-sm mb-6">
              {view === 'bought'
                ? 'When you mark an item as bought, it lands here with your spending record.'
                : view === 'to-buy'
                  ? 'Everything is bought or the list is clear. Enjoy the peace of mind!'
                  : "Add something you're saving up for — a new phone, a trip, a gadget, anything that inspires you!"}
            </p>
            {view === 'all' && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-6 py-3 bg-[#1C6F45] text-white rounded-xl hover:bg-[#155835] transition-colors text-sm font-medium shadow-sm"
              >
                <Plus size={18} />
                Add Your First Goal
              </button>
            )}
          </div>
        </Reveal>
      )}

      {/* ── Add/Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[22px] p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[#2D2D2D]">
                  {editingItem ? 'Edit Goal' : 'New Goal'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-[#6B7280]" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Photo</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-[#F0F2F5] via-[#F6F6F6] to-gray-100 flex items-center justify-center cursor-pointer hover:border-[#1C6F45]/30 hover:from-[#1C6F45]/5 hover:via-[#1C6F45]/3 transition-all overflow-hidden group"
                  >
                    {modalPhoto ? (
                      <>
                        <img
                          src={modalPhoto}
                          alt="Preview"
                          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <Camera size={18} className="text-[#6B7280]" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 text-[#9CA3AF]">
                        <div className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center">
                          <Camera size={22} className="text-gray-300" />
                        </div>
                        <span className="text-sm font-medium">Tap to add photo</span>
                        <span className="text-xs">Any size works — we'll fit it perfectly</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  {modalPhoto && (
                    <button
                      onClick={() => setModalPhoto('')}
                      className="mt-1.5 text-xs text-red-400 hover:text-red-600 hover:underline transition-colors"
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1.5">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="e.g. iPhone 17 Pro Max"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#2D2D2D] bg-white outline-none focus:ring-2 focus:ring-[#1C6F45]/30 focus:border-transparent transition-all"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1.5">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    value={modalPrice}
                    onChange={(e) => setModalPrice(e.target.value)}
                    placeholder="e.g. 89990"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#2D2D2D] bg-white outline-none focus:ring-2 focus:ring-[#1C6F45]/30 focus:border-transparent transition-all"
                  />
                </div>

                {/* Priority toggle */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1.5">
                    Priority
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalPriority(!modalPriority)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all ${
                      modalPriority
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-white text-[#6B7280] hover:border-gray-300'
                    }`}
                  >
                    <Star
                      size={18}
                      className={modalPriority ? 'text-amber-500' : 'text-gray-300'}
                      fill={modalPriority ? 'currentColor' : 'none'}
                    />
                    <span className="text-sm font-medium">
                      {modalPriority ? 'Priority savings — shows on Dashboard' : 'Set as priority savings'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-[#6B7280] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!modalName.trim() || !modalPrice || parseFloat(modalPrice) <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-[#1C6F45] text-white text-sm font-medium hover:bg-[#155835] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingItem ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
