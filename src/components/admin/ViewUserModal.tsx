import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, Phone, Calendar, Clock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import type { User } from '@/types';
import { usersApi } from '@/api/users.api';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { getFileUrl } from '@/lib/getFileUrl';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Ma\u2019lumotlarni yuklashda xatolik yuz berdi';
}

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | number | null;
}

export default function ViewUserModal({ isOpen, onClose, userId }: ViewUserModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = async (id: string | number) => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getOneUser(id);
      const userData = res.data;
      if (userData) {
        setUser(userData);
      } else {
        throw new Error('Foydalanuvchi ma’lumotlari topilmadi');
      }
    } catch (error: unknown) {
      console.error(error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser(userId);
    } else {
      setUser(null);
      setError('');
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative transition-all duration-300 transform scale-100">
        
        {/* Header/Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-heading">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h4 className="font-heading font-bold text-white text-lg">Xatolik yuz berdi</h4>
            <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
            <button
              onClick={() => userId && fetchUser(userId)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-heading font-semibold transition-all"
            >
              Qayta urinish
            </button>
          </div>
        ) : user ? (
          <div>
            {/* Top Header Card Background */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-10 pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-2xl font-heading font-bold text-primary shadow-lg shadow-primary/5 overflow-hidden flex-shrink-0">
                  {user.avatarUrl ? (
                    <img src={getFileUrl(user.avatarUrl)} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    (user.fullName || user.email || '?')[0].toUpperCase()
                  )}
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading font-bold text-white text-xl leading-tight">
                    {user.fullName || 'Nomsiz'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={String(user.role).toUpperCase()} />
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
                  </div>
                </div>
              </div>
            </div>

            {/* Info details */}
            <div className="p-6 space-y-5">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted/40 rounded-lg text-primary flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-heading block">Telefon raqam</span>
                  <span className="text-sm text-white font-medium">{user.phone || '—'}</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted/40 rounded-lg text-primary flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-heading block">Email manzili</span>
                  <span className="text-sm text-white font-medium">{user.email || '—'}</span>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted/40 rounded-lg text-primary flex-shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-heading block">Tizimdagi roli</span>
                  <span className="text-sm text-white font-medium">{String(user.role).toUpperCase()}</span>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted/40 rounded-lg text-primary flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-heading block">Ro'yxatdan o'tgan</span>
                  <span className="text-sm text-white font-medium">
                    {user.createdAt ? format(new Date(user.createdAt), 'dd.MM.yyyy HH:mm') : '—'}
                  </span>
                </div>
              </div>

              {/* Last Login */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted/40 rounded-lg text-primary flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-heading block">Oxirgi kirish vaqti</span>
                  <span className="text-sm text-white font-medium">
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), 'dd.MM.yyyy HH:mm')
                      : 'Noma’lum (Tizimga yaqinda kirilmagan)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-muted/10 px-6 py-4 border-t border-border/40 flex flex-wrap justify-end gap-2">
              <Link
                to={`/admin/profiles/${user.id}`}
                onClick={onClose}
                className="px-5 py-2 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-heading font-medium transition-all"
              >
                Racer profilini ko‘rish
              </Link>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-muted hover:bg-muted/80 text-white rounded-lg text-sm font-heading font-medium transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
