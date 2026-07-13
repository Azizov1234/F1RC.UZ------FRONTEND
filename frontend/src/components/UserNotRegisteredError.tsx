import React from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, Mail, RefreshCw } from 'lucide-react';

const UserNotRegisteredError: React.FC = () => {
  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-orange-400" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-foreground mb-2">Kirish taqiqlangan</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Siz bu ilovadan foydalanish uchun ro&apos;yxatdan o&apos;tmagan foydalanuvchisiz.
            Kirish uchun administrator bilan bog&apos;laning.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 text-left mb-6 space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Nima qilish mumkin:
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                To&apos;g&apos;ri hisob bilan kirganingizni tekshiring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                Administrator bilan bog&apos;lang
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                Chiqib qayta kiring
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:admin@f1rc.uz"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              admin@f1rc.uz
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Qayta kirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
