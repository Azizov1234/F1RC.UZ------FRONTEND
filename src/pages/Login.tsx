import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Shield, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { resolveAuthRedirect } from '@/lib/auth-routing';

// Simple utility — no external validation library needed
function validatePhone(value: string): string | null {
  if (!value.trim()) return 'Telefon raqamini kiriting';
  return null;
}

function validatePassword(value: string): string | null {
  if (!value) return 'Parolni kiriting';
  if (value.length < 4) return 'Parol juda qisqa';
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkUserAuth, user, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; password?: string }>({});

  // Auto-redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const redirectUrl = searchParams.get('redirect');
      const target = resolveAuthRedirect(redirectUrl, user.role);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  // Prevent duplicate submit
  const submittingRef = useRef(false);

  const validate = (): boolean => {
    const errors: { phone?: string; password?: string } = {};
    const phoneErr = validatePhone(phone);
    const passErr = validatePassword(password);
    if (phoneErr) errors.phone = phoneErr;
    if (passErr) errors.password = passErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!validate()) return;

    setError('');
    setLoading(true);
    submittingRef.current = true;

    try {
      const result = await base44.auth.loginViaEmailPassword(phone, password);
      if (result?.error) {
        setError(result.error ?? 'Telefon raqami yoki parol noto\'g\'ri');
        setLoading(false);
        submittingRef.current = false;
      } else {
        // Update user state in AuthContext before navigation
        await checkUserAuth();

        // Role-based redirect
        const redirectUrl = searchParams.get('redirect');
        const target = resolveAuthRedirect(
          redirectUrl,
          result?.user?.role,
        );
        navigate(target, { replace: true });
      }
    } catch {
      setError('Tarmoq xatoligi yuz berdi. Qaytadan urinib ko\'ring.');
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const clearFieldError = (field: 'phone' | 'password') => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: 'linear-gradient(hsl(0 90% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 90% 50%) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 mb-4 shadow-[0_0_30px_rgba(255,0,0,0.2)]">
            <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-widest">F1RC.UZ</h1>
          <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-1">
            RC Motorsport Arena Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Inner glass highlight */}
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/4 to-transparent pointer-events-none" aria-hidden="true" />

          <div className="relative">
            <h2 className="font-heading font-semibold text-white text-lg mb-5 tracking-wide">
              Tizimga kirish
            </h2>

            {/* Server error */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 flex items-start gap-2.5 text-sm text-red-400 font-heading"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Phone field */}
              <div>
                <label
                  htmlFor="login-phone"
                  className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5"
                >
                  Telefon raqami
                </label>
                <input
                  id="login-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); clearFieldError('phone'); }}
                  onBlur={() => { if (phone) { const err = validatePhone(phone); if (err) setFieldErrors(p => ({ ...p, phone: err })); } }}
                  placeholder="+998 90 000 00 01"
                  aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                  aria-invalid={!!fieldErrors.phone}
                  className={`min-h-11 w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${
                    fieldErrors.phone ? 'border-red-500/60 focus:ring-red-500/30' : 'border-border focus:border-primary'
                  }`}
                />
                {fieldErrors.phone && (
                  <p
                    id="phone-error"
                    role="alert"
                    className="mt-1 text-xs text-red-400 font-heading"
                  >
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5"
                >
                  Parol
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                    placeholder="••••••••"
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    aria-invalid={!!fieldErrors.password}
                    className={`min-h-11 w-full bg-background border rounded-lg px-4 py-2.5 pr-12 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${
                      fieldErrors.password ? 'border-red-500/60 focus:ring-red-500/30' : 'border-border focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-white transition-colors"
                    aria-label={showPass ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1 text-xs text-red-400 font-heading"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="min-h-11 w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-heading font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-2 active:scale-[0.97] shadow-[0_4px_14px_0_rgba(255,0,0,0.3)] hover:shadow-[0_6px_20px_0_rgba(255,0,0,0.4)]"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    <span>Kirish...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" aria-hidden="true" />
                    <span>Kirish</span>
                  </>
                )}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Akkauntingiz yo‘qmi?{' '}
              <Link to="/register" className="font-heading font-semibold text-primary hover:underline">
                Ro‘yxatdan o‘tish
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-heading">
          F1RC.UZ · RC Motorsport Arena Platform
        </p>
      </div>
    </div>
  );
}
