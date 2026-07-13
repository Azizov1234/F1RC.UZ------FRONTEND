import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import { useRegister } from '@/hooks/api/useAuth';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Ro‘yxatdan o‘tib bo‘lmadi.';
}

export default function Register() {
  const navigate = useNavigate();
  const register = useRegister();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Parollar bir xil emas.'); return; }
    if (password.length < 6) { setError('Parol kamida 6 ta belgidan iborat bo‘lsin.'); return; }
    register.mutate(
      { fullName: fullName.trim(), phone: phone.trim(), email: email.trim() || undefined, password },
      { onSuccess: response => navigate(response.accessToken ? '/' : '/login', { replace: true }), onError: requestError => setError(messageOf(requestError)) },
    );
  };

  return <AuthLayout icon={UserPlus} title="Akkaunt yaratish" subtitle="F1RC.UZ poygalariga qo‘shiling" footer={<>Akkauntingiz bormi? <Link to="/login" className="font-medium text-primary hover:underline">Kirish</Link></>}>
    {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
    <form onSubmit={submit} className="space-y-4">
      <Field label="To‘liq ism" icon={User}><Input required value={fullName} onChange={event => setFullName(event.target.value)} className="h-12 pl-10" autoComplete="name" /></Field>
      <Field label="Telefon" icon={Phone}><Input required type="tel" value={phone} onChange={event => setPhone(event.target.value)} className="h-12 pl-10" placeholder="+998901234567" autoComplete="tel" /></Field>
      <Field label="Email (ixtiyoriy)" icon={Mail}><Input type="email" value={email} onChange={event => setEmail(event.target.value)} className="h-12 pl-10" autoComplete="email" /></Field>
      <Field label="Parol" icon={Lock}><Input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="h-12 pl-10" autoComplete="new-password" /></Field>
      <Field label="Parolni tasdiqlang" icon={Lock}><Input required type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="h-12 pl-10" autoComplete="new-password" /></Field>
      <Button type="submit" className="h-12 w-full" disabled={register.isPending}>{register.isPending ? 'Yaratilmoqda…' : 'Akkaunt yaratish'}</Button>
    </form>
    <p className="mt-5 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Backendda OTP va Google OAuth endpointlari mavjud emas. Registratsiya to‘g‘ridan-to‘g‘ri real <span className="font-mono text-foreground">/auth/register</span> endpointi orqali bajariladi.</p>
  </AuthLayout>;
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof User; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="relative"><Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />{children}</div></div>;
}
