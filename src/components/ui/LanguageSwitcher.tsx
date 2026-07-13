import { useState, useRef, useEffect } from 'react';
import { useI18n, LOCALES, type Locale } from '@/lib/i18n';
import { ChevronDown, Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find(l => l.code === locale)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/80 backdrop-blur-md text-xs font-heading font-semibold text-white hover:border-primary/50 shadow-md transition-all duration-300 active:scale-95"
        title="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white" />
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="hidden sm:inline tracking-wider font-bold uppercase">{current.code}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="absolute inset-0.5 rounded-[inherit] bg-gradient-to-b from-white/5 to-white/0 pointer-events-none" />
          <div className="p-1 space-y-0.5 relative">
            {LOCALES.map(loc => (
              <button
                key={loc.code}
                onClick={() => handleSelect(loc.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium tracking-wide transition-all duration-200
                  ${loc.code === locale
                    ? 'bg-primary/20 text-white border border-primary/30'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
              >
                <span className="text-sm">{loc.flag}</span>
                <span>{loc.label}</span>
                {loc.code === locale && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

