import React, { useState } from 'react';
import { base44, type F1User } from '@/api/base44Client';
import {
  Crown,
  Settings,
  Wrench,
  Flag,
  Users,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
interface DemoRole {
  key: F1User['role'];
  label: string;
  description: string;
  icon: React.ReactNode;
  email: string;
  accent: string; // Tailwind bg class for glow
}

/* ─── Role definitions ───────────────────────────────── */
const DEMO_ROLES: DemoRole[] = [
  {
    key: 'superadmin',
    label: 'SUPERADMIN',
    description: 'Full system control',
    icon: <Crown className="w-4 h-4" />,
    email: 'superadmin@f1rc.uz',
    accent: 'rgba(239,68,68,0.18)',
  },
  {
    key: 'admin',
    label: 'ADMIN',
    description: 'Manages platform content',
    icon: <Settings className="w-4 h-4" />,
    email: 'admin@f1rc.uz',
    accent: 'rgba(239,68,68,0.12)',
  },
  {
    key: 'operator',
    label: 'OPERATOR',
    description: 'Controls race sessions',
    icon: <Wrench className="w-4 h-4" />,
    email: 'operator@f1rc.uz',
    accent: 'rgba(239,68,68,0.10)',
  },
  {
    key: 'racer',
    label: 'RACER',
    description: 'Racer profile & bookings',
    icon: <Flag className="w-4 h-4" />,
    email: 'racer@f1rc.uz',
    accent: 'rgba(239,68,68,0.10)',
  },
  {
    key: 'team_manager',
    label: 'TEAM MANAGER',
    description: 'Manages team & members',
    icon: <Users className="w-4 h-4" />,
    email: 'manager@f1rc.uz',
    accent: 'rgba(239,68,68,0.10)',
  },
];

/* ─── Component ──────────────────────────────────────── */
export default function DemoLoginSection() {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleDemoLogin = async (role: DemoRole) => {
    if (loadingRole) return;
    setLoadingRole(role.key);
    try {
      await base44.auth.loginViaEmailPassword(role.email, 'demo1234');
      window.location.href = '/';
    } catch {
      setLoadingRole(null);
    }
  };

  return (
    <div className="mt-6">
      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span
          className="text-[10px] font-heading tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border border-primary/25 text-primary/70"
          style={{ background: 'rgba(239,68,68,0.06)' }}
        >
          Demo sifatida kirish
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Role cards grid */}
      <div className="grid grid-cols-1 gap-2">
        {DEMO_ROLES.map((role) => {
          const isLoading = loadingRole === role.key;
          const isDisabled = !!loadingRole && !isLoading;

          return (
            <button
              key={role.key}
              type="button"
              onClick={() => handleDemoLogin(role)}
              disabled={isDisabled}
              aria-label={`Demo kirish: ${role.label}`}
              style={{
                background: isLoading
                  ? 'rgba(239,68,68,0.10)'
                  : 'rgba(255,255,255,0.02)',
                borderColor: isLoading
                  ? 'rgba(239,68,68,0.5)'
                  : 'rgba(255,255,255,0.06)',
                transition:
                  'background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s',
                boxShadow: isLoading
                  ? `0 0 16px ${role.accent}`
                  : '0 1px 3px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                if (isDisabled) return;
                const el = e.currentTarget;
                el.style.background = role.accent;
                el.style.borderColor = 'rgba(239,68,68,0.35)';
                el.style.transform = 'translateY(-1px)';
                el.style.boxShadow = `0 6px 20px ${role.accent}`;
              }}
              onMouseLeave={(e) => {
                if (isLoading) return;
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.02)';
                el.style.borderColor = 'rgba(255,255,255,0.06)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.985)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              {/* Icon box */}
              <div
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                style={{
                  background: isLoading
                    ? 'rgba(239,68,68,0.25)'
                    : 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                  transition: 'background 0.2s',
                }}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  role.icon
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-heading font-bold tracking-widest"
                    style={{ color: '#ef4444' }}
                  >
                    {role.label}
                  </span>
                  {role.key === 'superadmin' && (
                    <span
                      className="text-[9px] font-heading tracking-widest px-1.5 py-px rounded-full"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)',
                      }}
                    >
                      ROOT
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground font-heading truncate mt-0.5">
                  {role.description}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] text-muted-foreground/40 font-heading tracking-widest mt-3">
        DEMO MODE · DEV ONLY
      </p>
    </div>
  );
}
