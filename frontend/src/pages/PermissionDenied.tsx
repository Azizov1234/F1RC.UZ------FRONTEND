import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PermissionDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative w-full max-w-md text-center">
        {/* Animated Brand Header */}
        <div className="mb-6">
          <span className="font-display text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
            F1RC.UZ
          </span>
        </div>

        {/* Content Card */}
        <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl racing-glow">
          {/* F1 Speed Line Decoration */}
          <div className="absolute top-0 left-0 w-full h-[3px] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <ShieldAlert className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>

          <h1 className="text-xl font-heading font-bold text-foreground mb-2 tracking-wide uppercase">
            Ruxsat berilmadi (403)
          </h1>
          
          <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
            Ushbu bo&apos;limga kirish uchun sizda yetarli ruxsat huquqi mavjud emas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Bosh sahifa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
