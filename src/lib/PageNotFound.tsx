import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = location.pathname.substring(1);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/20 select-none">
            404
          </h1>
          <div className="absolute inset-0 text-8xl font-black text-primary/5 blur-xl select-none">
            404
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
              Sahifa topilmadi
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {`"${pageName}"`} mavjud emas
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            So&apos;ralgan sahifa topilmadi yoki o&apos;chirilgan bo&apos;lishi mumkin.
          </p>
        </div>

        {/* Admin note */}
        {user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superadmin' ? (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-left">
            <p className="text-xs font-semibold text-orange-400 mb-1">Admin eslatma</p>
            <p className="text-xs text-muted-foreground">
              Bu sahifa hali yaratilmagan bo&apos;lishi mumkin.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
          >
            ← Orqaga
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Bosh sahifa
          </button>
        </div>
      </div>
    </div>
  );
}
