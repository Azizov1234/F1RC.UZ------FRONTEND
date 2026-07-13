import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function ForgotPassword() {
  return (
    <AuthLayout
      icon={KeyRound}
      title="Parolni tiklash mavjud emas"
      subtitle="Backend hozircha parolni tiklash endpointini taqdim etmaydi"
      footer={(
        <Link to="/login" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Kirish sahifasiga qaytish
        </Link>
      )}
    >
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-foreground">
        Hisobingizga kira olmasangiz, F1RC.UZ administratoriga murojaat qiling. Bu sahifa
        muvaffaqiyatli so‘rovni taqlid qilmaydi va hech qanday lokal ma’lumot yaratmaydi.
      </div>
    </AuthLayout>
  );
}
