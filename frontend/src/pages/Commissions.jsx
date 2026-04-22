import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Filter, LayoutGrid, List as ListIcon, Trello, Clock,
  Search, X, Edit3, Trash2, Eye, Lock, Globe, Key, AlertTriangle, CheckCircle2,
  DollarSign, Calendar, Hourglass
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchCommissions, fetchCommissionStats, deleteCommission, verifyDebutPassword
} from '../api';
import CommissionModal from '../components/CommissionModal';
import '../styles/theme.css';

const STATUSES = ['Requested', 'Waitlisted', 'Accepted', 'In Progress', 'Review', 'Completed'];
const STATUS_COLORS = {
  'Requested':    '#7E88B7',
  'Waitlisted':   '#B1EDE8',
  'Accepted':     '#066DF7',
  'In Progress':  '#E1B04A',
  'Review':       '#D477FF',
  'Completed':    '#4ADE80',
};
const PLATFORMS = ['All', 'Skeb', 'DA', 'VGen', 'Etsy', 'Fiverr', 'Twitter', 'Discord', 'Other'];
const TYPES = ['All', 'L2D', 'CG', 'Icon', 'Bust', 'Waist-Up', 'Thigh-Up', 'Full Body', 'Outfit', 'Skeb', 'Other'];
const RIGHTS = ['All', 'n/a', 'personal', 'streaming', 'merch', 'full_commercial'];
const VIEWS = [
  { id: 'kanban',   label: 'Kanban',   icon: Trello },
  { id: 'list',     label: 'List',     icon: ListIcon },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'gallery',  label: 'Gallery',  icon: LayoutGrid },
];

const TOKEN_KEY = 'veri_admin_token';

const visibilityBadge = (v) => {
  if (v === 'public')  return { label: 'Public', icon: Globe, color: 'text-[#B1EDE8] bg-[#B1EDE8]/10 border-[#B1EDE8]/30' };
  if (v === 'admin')   return { label: 'Admin',  icon: Lock,  color: 'text-[#E1B04A] bg-[#E1B04A]/10 border-[#E1B04A]/30' };
  return { label: 'Debut', icon: Key, color: 'text-[#D477FF] bg-[#D477FF]/10 border-[#D477FF]/30' };
};

const paidColor = {
  unpaid: 'bg-[#600612]/20 text-[#ff8095] border-[#600612]/40',
  partial: 'bg-[#E1B04A]/10 text-[#E1B04A] border-[#E1B04A]/30',
  paid: 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30',
};

const isOverdue = (c) => {
  if (!c.deadline || c.status === 'Completed') return false;
  try { return new Date(c.deadline) < new Date(); } catch { return false; }
};

const fmtMoney = (n, cur = 'USD') => {
  const v = Number(n || 0);
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0 }).format(v); }
  catch { return `$${v.toFixed(0)}`; }
};

const totalPaid = (c) => (c.payments || []).reduce((a, p) => a + (Number(p.amount) || 0), 0);

// ---------------- Admin Login Modal ----------------
const AdminLoginModal = ({ open, onClose, onAuth }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await verifyDebutPassword(password);
      localStorage.setItem(TOKEN_KEY, token);
      onAuth(token);
      toast.success('Admin mode unlocked');
      onClose();
    } catch {
      toast.error('Incorrect password');
    } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="glass-card rounded-[35px] p-8 w-full max-w-md" data-testid="admin-login-modal">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-[#E1B04A]/10 border border-[#E1B04A]/30"><Lock className="w-5 h-5 text-[#E1B04A]" /></div>
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Admin Access</h3>
        </div>
        <p className="text-sm text-[#7E88B7] mb-5">Unlock to view admin/debut commissions and manage entries.</p>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          data-testid="admin-password-input"
          className="w-full px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] transition-all mb-4"
        />
        <button type="submit" disabled={loading} data-testid="admin-login-submit"
          className="w-full py-3 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white font-semibold transition-all hover:shadow-[0_0_20px_rgba(6,109,247,0.4)] disabled:opacity-50">
          {loading ? 'Verifying…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
};

// ---------------- Commission Card ----------------
const CommissionCard = ({ c, onEdit, onDelete, canEdit, compact = false }) => {
  const v = visibilityBadge(c.visibility);
  const Vi = v.icon;
  const overdue = isOverdue(c);
  const paid = totalPaid(c);
  const pct = c.budget > 0 ? Math.min(100, Math.round((paid / c.budget) * 100)) : 0;

  return (
    <div className="glass-card rounded-[22px] p-5 group transition-all hover:ring-1 hover:ring-white/10" data-testid={`commission-card-${c.id}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>{c.title || 'Untitled'}</h4>
          <p className="text-xs text-[#7E88B7] truncate mt-0.5">{c.artist?.name || 'Unknown artist'} · {c.platform || '—'}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border ${v.color}`} title={v.label}>
          <Vi className="w-3 h-3" />{!compact && v.label}
        </span>
      </div>

      {c.reference_urls?.[0] && (
        <div className="rounded-[14px] overflow-hidden mb-3 aspect-video bg-black/30">
          <img src={c.reference_urls[0]} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="flex items-center flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 text-[10px] rounded-full border bg-white/5 border-white/10 text-[#B1EDE8]">{c.type || '—'}</span>
        <span className="px-2 py-0.5 text-[10px] rounded-full border" style={{ color: STATUS_COLORS[c.status] || '#B1EDE8', borderColor: (STATUS_COLORS[c.status] || '#B1EDE8') + '55', background: (STATUS_COLORS[c.status] || '#B1EDE8') + '15' }}>{c.status}</span>
        <span className={`px-2 py-0.5 text-[10px] rounded-full border ${paidColor[c.payment_status] || paidColor.unpaid}`}>{c.payment_status}</span>
        {overdue && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border bg-[#600612]/25 text-[#ff8095] border-[#600612]/40">
            <AlertTriangle className="w-3 h-3" />Overdue
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-[#7E88B7] flex items-center gap-1"><DollarSign className="w-3 h-3" />{fmtMoney(paid, c.currency)} / {fmtMoney(c.budget, c.currency)}</span>
        {c.deadline && (
          <span className={`flex items-center gap-1 ${overdue ? 'text-[#ff8095]' : 'text-[#7E88B7]'}`}><Calendar className="w-3 h-3" />{c.deadline}</span>
        )}
      </div>
      <div className="h-1 rounded-full overflow-hidden bg-white/5">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#066DF7 0%,#3086AE 100%)' }} />
      </div>

      {canEdit && (
        <div className="flex items-center justify-end gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(c)} data-testid={`edit-${c.id}`} className="p-1.5 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] hover:bg-white/10"><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(c)} data-testid={`delete-${c.id}`} className="p-1.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] hover:bg-[#600612]/30"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
};

// ---------------- Views ----------------
const KanbanView = ({ items, onEdit, onDelete, canEdit }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar" data-testid="view-kanban">
    {STATUSES.map((s) => {
      const col = items.filter((i) => i.status === s);
      return (
        <div key={s} className="shrink-0 w-[300px] flex flex-col gap-3">
          <div className="glass-card rounded-full px-4 py-2 flex items-center justify-between" style={{ borderColor: (STATUS_COLORS[s] || '#B1EDE8') + '44' }}>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: STATUS_COLORS[s] }}>{s}</span>
            <span className="text-xs text-[#7E88B7]">{col.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {col.map((c) => <CommissionCard key={c.id} c={c} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} compact />)}
            {col.length === 0 && <div className="text-xs text-[#7E88B7] italic text-center py-6 border border-dashed border-white/10 rounded-[18px]">No entries</div>}
          </div>
        </div>
      );
    })}
  </div>
);

const ListView = ({ items, onEdit, onDelete, canEdit }) => (
  <div className="glass-card rounded-[28px] overflow-hidden" data-testid="view-list">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] border-b border-white/5">
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Artist</th>
            <th className="px-5 py-3">Platform</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Budget</th>
            <th className="px-5 py-3">Paid</th>
            <th className="px-5 py-3">Deadline</th>
            <th className="px-5 py-3">Rights</th>
            <th className="px-5 py-3 text-right">Vis.</th>
            {canEdit && <th className="px-5 py-3"></th>}
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const v = visibilityBadge(c.visibility);
            const Vi = v.icon;
            const paid = totalPaid(c);
            const overdue = isOverdue(c);
            return (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors" data-testid={`row-${c.id}`}>
                <td className="px-5 py-3 font-medium text-[#E1DBC2]">{c.title || '—'}</td>
                <td className="px-5 py-3 text-[#B1EDE8]">{c.artist?.name || '—'}</td>
                <td className="px-5 py-3 text-[#7E88B7]">{c.platform || '—'}</td>
                <td className="px-5 py-3 text-[#7E88B7]">{c.type || '—'}</td>
                <td className="px-5 py-3"><span style={{ color: STATUS_COLORS[c.status] }}>{c.status}</span></td>
                <td className="px-5 py-3 text-[#E1DBC2]">{fmtMoney(c.budget, c.currency)}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${paidColor[c.payment_status]}`}>{fmtMoney(paid, c.currency)}</span>
                </td>
                <td className={`px-5 py-3 ${overdue ? 'text-[#ff8095]' : 'text-[#7E88B7]'}`}>{c.deadline || '—'}</td>
                <td className="px-5 py-3 text-[#7E88B7]">{c.usage_rights}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border ${v.color}`}><Vi className="w-3 h-3" />{v.label}</span>
                </td>
                {canEdit && (
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button onClick={() => onEdit(c)} className="p-1.5 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] hover:bg-white/10" data-testid={`row-edit-${c.id}`}><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete(c)} className="p-1.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] hover:bg-[#600612]/30" data-testid={`row-delete-${c.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={canEdit ? 11 : 10} className="px-5 py-10 text-center text-[#7E88B7] text-sm italic">No commissions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const TimelineView = ({ items, onEdit, onDelete, canEdit }) => {
  const sorted = [...items].sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
  return (
    <div className="relative pl-8" data-testid="view-timeline">
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#066DF7]/80 via-[#3086AE]/40 to-transparent" />
      <div className="flex flex-col gap-4">
        {sorted.map((c) => {
          const overdue = isOverdue(c);
          return (
            <div key={c.id} className="relative" data-testid={`timeline-${c.id}`}>
              <div className="absolute -left-[26px] top-5 w-3 h-3 rounded-full ring-2 ring-[#171718]" style={{ background: overdue ? '#ff8095' : (STATUS_COLORS[c.status] || '#066DF7') }} />
              <div className="flex items-center gap-3 mb-2 text-xs">
                <span className={`font-semibold ${overdue ? 'text-[#ff8095]' : 'text-[#B1EDE8]'}`}>{c.deadline || 'No deadline'}</span>
                {overdue && <span className="text-[10px] uppercase tracking-wider text-[#ff8095]">Overdue</span>}
              </div>
              <CommissionCard c={c} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} />
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-sm italic text-[#7E88B7]">Nothing scheduled.</p>}
      </div>
    </div>
  );
};

const GalleryView = ({ items, onEdit, onDelete, canEdit }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="view-gallery">
    {items.map((c) => <CommissionCard key={c.id} c={c} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} />)}
    {items.length === 0 && <p className="col-span-full text-center text-sm italic text-[#7E88B7] py-10">No commissions match your filters.</p>}
  </div>
);

// ---------------- Main Page ----------------
const Commissions = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('kanban');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editing, setEditing] = useState(null); // object or 'new'
  const [filters, setFilters] = useState({
    status: 'All', platform: 'All', type: 'All', usage_rights: 'All', visibility: 'All',
    artist: '', price_min: '', price_max: '', date_from: '', date_to: '', search: ''
  });

  const canEdit = !!token;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.platform !== 'All') params.platform = filters.platform;
      if (filters.type !== 'All') params.type = filters.type;
      if (filters.usage_rights !== 'All') params.usage_rights = filters.usage_rights;
      if (filters.visibility !== 'All' && token) params.visibility = filters.visibility;
      if (filters.artist) params.artist = filters.artist;
      if (filters.price_min) params.price_min = filters.price_min;
      if (filters.price_max) params.price_max = filters.price_max;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const [list, st] = await Promise.all([
        fetchCommissions(token, params),
        fetchCommissionStats(token),
      ]);
      setItems(list);
      setStats(st);
    } catch (e) {
      toast.error('Failed to load commissions');
      console.error(e);
    } finally { setLoading(false); }
  }, [token, filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete commission "${c.title}"?`)) return;
    try {
      await deleteCommission(token, c.id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    toast.info('Admin mode locked');
  };

  const searched = useMemo(() => {
    if (!filters.search) return items;
    const q = filters.search.toLowerCase();
    return items.filter((c) =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.artist?.name || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q) ||
      (c.type || '').toLowerCase().includes(q)
    );
  }, [items, filters.search]);

  return (
    <div className="p-8 lg:p-12 pb-32" data-testid="commissions-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Commissions</h1>
          <p className="text-xl text-[#B1EDE8] tracking-wide">Artist collaborations · deadlines · budgets</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <>
              <button onClick={() => setEditing('new')} data-testid="new-commission-btn"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.3)] hover:shadow-[0_0_30px_rgba(6,109,247,0.5)] transition-all">
                <Plus className="w-4 h-4" />New Commission
              </button>
              <button onClick={logout} data-testid="admin-logout-btn"
                className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] text-sm hover:bg-white/10 transition-all">
                Lock
              </button>
            </>
          ) : (
            <button onClick={() => setLoginOpen(true)} data-testid="admin-unlock-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[#E1B04A] text-sm font-semibold hover:bg-[#E1B04A]/10 transition-all">
              <Lock className="w-4 h-4" />Admin
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-5xl" data-testid="stats-row">
          <div className="glass-card rounded-[22px] p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] mb-1">Total</div>
            <div className="text-2xl font-bold text-[#E1DBC2]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stats.count}</div>
          </div>
          <div className="glass-card rounded-[22px] p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] mb-1">Budget</div>
            <div className="text-2xl font-bold text-[#E1DBC2]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{fmtMoney(stats.total_budget)}</div>
          </div>
          <div className="glass-card rounded-[22px] p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] mb-1">Paid</div>
            <div className="text-2xl font-bold text-[#4ADE80]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{fmtMoney(stats.total_paid)}</div>
          </div>
          <div className="glass-card rounded-[22px] p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] mb-1">Outstanding</div>
            <div className="text-2xl font-bold text-[#E1B04A]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{fmtMoney(stats.total_outstanding)}</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 max-w-5xl">
        <div className="flex items-center gap-1.5 glass-card rounded-full p-1" data-testid="view-switcher">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setView(v.id)} data-testid={`view-${v.id}`}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${view === v.id ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_15px_rgba(6,109,247,0.35)]' : 'text-[#B1EDE8] hover:bg-white/5'}`}>
                <Icon className="w-3.5 h-3.5" />{v.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#7E88B7]" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search…"
              data-testid="search-input"
              className="w-full pl-11 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] transition-all"
            />
          </div>
          <button onClick={() => setShowFilters((s) => !s)} data-testid="toggle-filters"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${showFilters ? 'bg-[#066DF7]/20 border-[#066DF7]/40 text-white' : 'bg-white/5 border-white/10 text-[#B1EDE8] hover:bg-white/10'}`}>
            <Filter className="w-3.5 h-3.5" />Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card rounded-[28px] p-6 mb-6 max-w-5xl" data-testid="filters-panel">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select label="Status" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={['All', ...STATUSES]} />
            <Select label="Platform" value={filters.platform} onChange={(v) => setFilters({ ...filters, platform: v })} options={PLATFORMS} />
            <Select label="Type" value={filters.type} onChange={(v) => setFilters({ ...filters, type: v })} options={TYPES} />
            <Select label="Usage Rights" value={filters.usage_rights} onChange={(v) => setFilters({ ...filters, usage_rights: v })} options={RIGHTS} />
            {canEdit && <Select label="Visibility" value={filters.visibility} onChange={(v) => setFilters({ ...filters, visibility: v })} options={['All', 'public', 'admin', 'debut']} />}
            <Text label="Artist" value={filters.artist} onChange={(v) => setFilters({ ...filters, artist: v })} placeholder="Name contains…" />
            <Num label="Min price" value={filters.price_min} onChange={(v) => setFilters({ ...filters, price_min: v })} />
            <Num label="Max price" value={filters.price_max} onChange={(v) => setFilters({ ...filters, price_max: v })} />
            <DateInput label="From" value={filters.date_from} onChange={(v) => setFilters({ ...filters, date_from: v })} />
            <DateInput label="To" value={filters.date_to} onChange={(v) => setFilters({ ...filters, date_to: v })} />
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => setFilters({ status: 'All', platform: 'All', type: 'All', usage_rights: 'All', visibility: 'All', artist: '', price_min: '', price_max: '', date_from: '', date_to: '', search: '' })}
              data-testid="clear-filters"
              className="text-xs text-[#7E88B7] hover:text-white underline underline-offset-4">Clear all</button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-5xl">
        {loading ? (
          <div className="text-center py-20 text-[#7E88B7] text-sm" data-testid="loading-state">Loading commissions…</div>
        ) : (
          <>
            {view === 'kanban'   && <KanbanView   items={searched} onEdit={setEditing} onDelete={handleDelete} canEdit={canEdit} />}
            {view === 'list'     && <ListView     items={searched} onEdit={setEditing} onDelete={handleDelete} canEdit={canEdit} />}
            {view === 'timeline' && <TimelineView items={searched} onEdit={setEditing} onDelete={handleDelete} canEdit={canEdit} />}
            {view === 'gallery'  && <GalleryView  items={searched} onEdit={setEditing} onDelete={handleDelete} canEdit={canEdit} />}
          </>
        )}
      </div>

      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onAuth={setToken} />
      {editing && (
        <CommissionModal
          token={token}
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
};

// Helpers
const Select = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7]">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]">
      {options.map((o) => <option key={o} value={o} className="bg-[#171718]">{o}</option>)}
    </select>
  </label>
);
const Text = ({ label, value, onChange, placeholder }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7]">{label}</span>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
  </label>
);
const Num = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7]">{label}</span>
    <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
  </label>
);
const DateInput = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7]">{label}</span>
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
  </label>
);

export default Commissions;
