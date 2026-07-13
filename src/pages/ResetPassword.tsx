import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function ResetPassword() {
  return (
    <AuthLayout
      icon={ShieldAlert}
      title="Reset havolasi qo‘llab-quvvatlanmaydi"
      subtitle="Swagger’da password reset endpointi mavjud emas"
      footer={(
        <Link to="/login" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Kirish sahifasiga qaytish
        </Link>
      )}
    >
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
        Xavfsizlik sababli frontend backendda yo‘q operatsiyani bajarilgandek ko‘rsatmaydi.
        Yordam uchun tizim administratoriga murojaat qiling.
      </div>
    </AuthLayout>
  );
}
