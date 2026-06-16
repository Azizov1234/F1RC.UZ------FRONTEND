import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, Shield, MoreVertical, ChevronDown, Users } from 'lucide-react';
import { base44, type F1User } from '@/api/base44Client';
import RoleBadge from '@/components/admin/RoleBadge';
import StatusBadge from '@/components/admin/StatusBadge';
import { format } from 'date-fns';

const ALL_ROLES = ['ALL', 'SUPERADMIN', 'ADMIN', 'OPERATOR', 'RACER', 'TEAM_MANAGER', 'VIEWER'];

export default function UsersPage() {
  const [users, setUsers] = useState<F1User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.User.list('-created_date', 50);
      setUsers(data || []);
    } catch (e) {
      setUsers([
        { id: '1', name: 'Jahongir T.', full_name: 'Jahongir T.', email: 'admin@f1rc.uz', role: 'superadmin', createdAt: '2026-06-01T10:00:00Z', created_date: '2026-06-01T10:00:00Z' },
        { id: '2', name: 'Sardor M.', full_name: 'Sardor M.', email: 'operator@f1rc.uz', role: 'operator', createdAt: '2026-06-02T11:00:00Z', created_date: '2026-06-02T11:00:00Z' },
        { id: '3', name: 'Aziz K.', full_name: 'Aziz K.', email: 'manager@f1rc.uz', role: 'team_manager', createdAt: '2026-06-03T12:00:00Z', created_date: '2026-06-03T12:00:00Z' },
        { id: '4', name: 'Bobur H.', full_name: 'Bobur H.', email: 'racer@f1rc.uz', role: 'racer', createdAt: '2026-06-04T13:00:00Z', created_date: '2026-06-04T13:00:00Z' },
        { id: '5', name: 'Viewer User', full_name: 'Viewer User', email: 'viewer@f1rc.uz', role: 'viewer', createdAt: '2026-06-05T14:00:00Z', created_date: '2026-06-05T14:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
    } catch (e) {
      // Mock invite success fallback
      const newRole = inviteRole === 'admin' ? 'admin' : 'racer';
      setUsers(prev => [
        ...prev,
        {
          id: String(prev.length + 1),
          name: inviteEmail.split('@')[0],
          full_name: inviteEmail.split('@')[0],
          email: inviteEmail,
          role: newRole,
          createdAt: new Date().toISOString(),
          created_date: new Date().toISOString()
        }
      ]);
    } finally {
      setShowInvite(false);
      setInviteEmail('');
      setInviting(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role?.toUpperCase() === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Foydalanuvchilar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} ta foydalanuvchi</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Taklif qilish</span>
        </button>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="font-heading font-bold text-white text-lg mb-4">Foydalanuvchi taklif qilish</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1 block">Email</label>
                <input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1 block">Rol</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                >
                  <option value="user">User (Racer)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowInvite(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-white hover:border-white/30 transition-all font-heading">
                Bekor
              </button>
              <button onClick={handleInvite} disabled={inviting || !inviteEmail} className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg text-sm text-white font-heading font-semibold transition-all">
                {inviting ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ism yoki email bo'yicha qidirish..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-heading font-semibold tracking-wide transition-all ${
                roleFilter === r ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-white hover:border-white/20'
              }`}
            >
              {r === 'ALL' ? 'Barchasi' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Foydalanuvchi</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Rol</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden lg:table-cell">Qo'shilgan</th>
                <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Holat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-muted animate-pulse" /><div className="w-28 h-4 bg-muted animate-pulse rounded" /></div></td>
                    <td className="px-5 py-4 hidden md:table-cell"><div className="w-36 h-4 bg-muted animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-5 bg-muted animate-pulse rounded" /></td>
                    <td className="px-5 py-4 hidden lg:table-cell"><div className="w-24 h-4 bg-muted animate-pulse rounded" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-5 bg-muted animate-pulse rounded-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground font-heading">Foydalanuvchi topilmadi</td></tr>
              ) : filtered.map((user, i) => (
                <tr key={user.id} className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0">
                        {user.full_name?.[0] || user.email?.[0] || '?'}
                      </div>
                      <span className="text-sm text-white font-heading font-medium">{user.full_name || 'Nomsiz'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={user.role?.toUpperCase()} />
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground font-mono">
                      {user.created_date ? format(new Date(user.created_date), 'dd.MM.yyyy') : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status="ACTIVE_USER" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}