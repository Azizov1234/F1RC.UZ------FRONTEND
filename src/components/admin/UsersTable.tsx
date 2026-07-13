import { useState } from 'react';
import type { User } from '@/types';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { getFileUrl } from '@/lib/getFileUrl';

interface UsersTableProps {
  usersList: User[];
  isLoading: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({ usersList, isLoading, onView, onEdit, onDelete }: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Foydalanuvchi</th>
              <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden md:table-cell">Email</th>
              <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden sm:table-cell">Telefon</th>
              <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Rol</th>
              <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase hidden lg:table-cell">Qo'shilgan</th>
              <th className="text-left px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Holat</th>
              <th className="text-right px-5 py-3 text-[11px] font-heading text-muted-foreground tracking-widest uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                      <div className="w-28 h-4 bg-muted animate-pulse rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="w-36 h-4 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="w-28 h-4 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-20 h-5 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-16 h-5 bg-muted animate-pulse rounded-full" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="w-8 h-8 bg-muted animate-pulse rounded-full ml-auto" />
                  </td>
                </tr>
              ))
            ) : usersList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground font-heading">
                  Foydalanuvchi topilmadi
                </td>
              </tr>
            ) : (
              usersList.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-border/50 hover:bg-white/2 transition-colors ${
                    i === usersList.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary flex-shrink-0 overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={getFileUrl(user.avatarUrl)} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          (user.fullName || user.email || '?')[0].toUpperCase()
                        )}
                      </div>
                      <span className="text-sm text-white font-heading font-medium">
                        {user.fullName || 'Nomsiz'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{user.email || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{user.phone || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={String(user.role).toUpperCase()} />
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground font-heading font-semibold tracking-wider">
                      {user.createdAt ? format(new Date(user.createdAt), 'dd.MM.yyyy') : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={
                        user.status === 'ACTIVE'
                          ? 'ACTIVE_USER'
                          : user.status === 'INACTIVE'
                          ? 'INACTIVE_USER'
                          : user.status === 'BANNED'
                          ? 'BANNED_USER'
                          : user.status === 'DELETED'
                          ? 'DELETED_USER'
                          : 'INACTIVE_USER'
                      }
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-5 mt-1 w-36 bg-card border border-border rounded-lg shadow-xl py-1 z-20 text-left">
                          <button
                            onClick={() => {
                              onView(user);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-white hover:bg-muted font-heading flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            Ko'rish
                          </button>
                          <button
                            onClick={() => {
                              onEdit(user);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-white hover:bg-muted font-heading flex items-center gap-2"
                          >
                            <Edit className="w-3.5 h-3.5 text-yellow-500" />
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => {
                              onDelete(user);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 font-heading flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            O'chirish
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
