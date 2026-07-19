import { useState, type FormEvent, type ReactNode, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import { useRegister } from '@/hooks/api/useAuth';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { resolveAuthRedirect } from '@/lib/auth-routing';
import { isSafeRedirectUrl } from '@/lib/security';

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Ro‘yxatdan o‘tib bo‘lmadi.';
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const register = useRegister();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectUrl = searchParams.get('redirect');
      const target = resolveAuthRedirect(redirectUrl, user.role);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Parollar bir xil emas.'); return; }
    if (password.length < 6) { setError('Parol kamida 6 ta belgidan iborat bo‘lsin.'); return; }
    register.mutate(
      { fullName: fullName.trim(), phone: phone.trim(), email: email.trim() || undefined, password },
      { onSuccess: async response => {
        const redirectUrl = searchParams.get('redirect');
        if (response.accessToken) await checkUserAuth();
        const dest = response.accessToken
          ? resolveAuthRedirect(redirectUrl, response.user?.role)
          : redirectUrl && isSafeRedirectUrl(redirectUrl)
            ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
            : '/login';
        navigate(dest, { replace: true });
      }, onError: requestError => setError(messageOf(requestError)) },
    );
  };

  return <AuthLayout icon={UserPlus} title="Akkaunt yaratish" subtitle="F1RC.UZ poygalariga qo‘shiling" footer={<>Akkauntingiz bormi? <Link to="/login" className="font-medium text-primary hover:underline">Kirish</Link></>}>
    {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
    <form onSubmit={submit} className="space-y-4">
      <Field id="register-name" label="To‘liq ism" icon={User}><Input id="register-name" required value={fullName} onChange={event => setFullName(event.target.value)} className="h-12 pl-10" autoComplete="name" /></Field>
      <Field id="register-phone" label="Telefon" icon={Phone}><Input id="register-phone" required type="tel" value={phone} onChange={event => setPhone(event.target.value)} className="h-12 pl-10" placeholder="+998901234567" autoComplete="tel" /></Field>
      <Field id="register-email" label="Email (ixtiyoriy)" icon={Mail}><Input id="register-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="h-12 pl-10" autoComplete="email" /></Field>
      <Field id="register-password" label="Parol" icon={Lock}><Input id="register-password" required type="password" value={password} onChange={event => setPassword(event.target.value)} className="h-12 pl-10" autoComplete="new-password" /></Field>
      <Field id="register-password-confirm" label="Parolni tasdiqlang" icon={Lock}><Input id="register-password-confirm" required type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="h-12 pl-10" autoComplete="new-password" /></Field>
      <Button type="submit" className="h-12 w-full" disabled={register.isPending}>{register.isPending ? 'Yaratilmoqda…' : 'Akkaunt yaratish'}</Button>
    </form>
    <p className="mt-5 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Backendda OTP va Google OAuth endpointlari mavjud emas. Registratsiya to‘g‘ridan-to‘g‘ri real <span className="font-mono text-foreground">/auth/register</span> endpointi orqali bajariladi.</p>
  </AuthLayout>;
}

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof User; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><div className="relative"><Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />{children}</div></div>;
}
