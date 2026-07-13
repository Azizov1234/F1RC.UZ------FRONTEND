import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Eye, EyeOff, X, Image as ImageIcon } from 'lucide-react';
import type { UpdateUserDto } from '@/api/users.api';
import type { User, UserRole, UserStatus } from '../../types';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_RULES_LABEL, validateUploadedFile } from '@/lib/security';
import { getFileUrl } from '@/lib/getFileUrl';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (payload: UpdateUserDto) => Promise<void>;
  updating: boolean;
}

const editableRoles: readonly UserRole[] = ['ADMIN', 'OPERATOR', 'RACER', 'TEAM_MANAGER'];
const userStatuses: readonly UserStatus[] = ['ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'];

function isUserRole(value: string): value is UserRole {
  return editableRoles.some(role => role === value);
}

function isUserStatus(value: string): value is UserStatus {
  return userStatuses.some(status => status === value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Xatolik yuz berdi';
}

export default function EditUserModal({ isOpen, onClose, user, onUpdate, updating }: EditUserModalProps) {
  const { user: currentUser } = useAuth();
  const currentUserRole = currentUser?.role?.toUpperCase() || 'SUPERADMIN';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Avatar uploading states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      setEmail(user.email || '');
      setRole(user.role);
      setStatus(user.status);
      setPassword('');
      setAvatarFile(null);
      setAvatarPreview(user.avatarUrl ? getFileUrl(user.avatarUrl) : null);
      setValidationError('');
    }
  }, [user, isOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!isOpen || !user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateUploadedFile(file);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Rasm yuklashda xatolik');
        e.currentTarget.value = '';
        return;
      }
      setValidationError('');
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError("To'liq ism kiritilishi shart");
      return;
    }
    if (!phone.trim()) {
      setValidationError('Telefon raqam kiritilishi shart');
      return;
    }
    if (password.trim() && password.length < 8) {
      setValidationError("Parol kamida 8 ta belgidan iborat bo'lishi shart");
      return;
    }

    try {
      await onUpdate({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password: password.trim() ? password : undefined,
        role: role,
        status: status,
        avatarUrl: avatarFile || undefined
      });
      onClose();
    } catch (error: unknown) {
      setValidationError(getErrorMessage(error));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-heading font-bold text-white text-lg mb-4">Foydalanuvchini tahrirlash</h3>
        
        {validationError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 mb-4 text-xs text-red-400 font-heading">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5 block">
              Foydalanuvchi rasmi
            </label>
            <div className="flex items-center gap-4 bg-background border border-border rounded-xl p-3">
              <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept={IMAGE_UPLOAD_ACCEPT}
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="edit-avatar-file"
                />
                <label htmlFor="edit-avatar-file" className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white/5 border border-border hover:bg-white/10 text-xs font-semibold text-white cursor-pointer transition-all">
                  Rasm tanlash
                </label>
                <p className="text-[9px] text-muted-foreground mt-1">{IMAGE_UPLOAD_RULES_LABEL}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5 block">
              To'liq ism *
            </label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ali Valiyev"
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5 block">
              Telefon raqam *
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998901234567"
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5 block">
              Email (ixtiyoriy)
            </label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ali@gmail.com"
              type="email"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5 block">
              Yangi Parol (ixtiyoriy, o'zgartirmaslik uchun bo'sh qoldiring)
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                minLength={8}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5 block">
                Rol *
              </label>
              <select
                value={role}
                onChange={e => {
                  if (isUserRole(e.target.value)) setRole(e.target.value);
                }}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="OPERATOR">Operator</option>
                <option value="TEAM_MANAGER">Team Manager</option>
                <option value="RACER">Racer</option>
                {currentUserRole === 'SUPERADMIN' && (
                  <option value="ADMIN">Admin</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5 block">
                Holat *
              </label>
              <select
                value={status}
                onChange={e => {
                  if (isUserStatus(e.target.value)) setStatus(e.target.value);
                }}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Nofaol</option>
                <option value="BANNED">Bloklangan</option>
                <option value="DELETED">O'chirilgan</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-white hover:border-white/30 transition-all font-heading disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg text-sm text-white font-heading font-semibold transition-all"
            >
              {updating ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
