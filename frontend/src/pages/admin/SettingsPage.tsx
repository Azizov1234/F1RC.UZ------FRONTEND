import { useState } from 'react';
import {
  Settings, Shield, Bell, Globe, Palette, Database,
  Save, ChevronRight, Sun, Moon, Monitor, Eye, EyeOff,
  Key, Mail, Phone, Clock, Flag, Zap
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { useI18n, LOCALES } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';

type SettingsTab = 'general' | 'security' | 'notifications' | 'appearance';

const tabs: { id: SettingsTab; icon: typeof Settings; label: string }[] = [
  { id: 'general',       icon: Globe,    label: 'Umumiy' },
  { id: 'security',      icon: Shield,   label: 'Xavfsizlik' },
  { id: 'notifications', icon: Bell,     label: 'Bildirishnomalar' },
  { id: 'appearance',    icon: Palette,  label: 'Ko\'rinish' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-heading font-semibold text-foreground tracking-wide">{title}</h2>
      {description && <p className="text-xs text-muted-foreground mt-0.5 font-heading">{description}</p>}
    </div>
  );
}

function SettingRow({
  label, description, children
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm font-heading font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showApiKey, setShowApiKey] = useState(false);

  // Notification toggles
  const [notifs, setNotifs] = useState({
    newBooking:   true,
    cancelBooking: true,
    raceStart:    true,
    newUser:      false,
    payment:      true,
    systemAlert:  true,
  });

  // Security state
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  // General settings
  const [arenaName, setArenaName]     = useState('F1RC.UZ Arena');
  const [arenaEmail, setArenaEmail]   = useState('info@f1rc.uz');
  const [arenaPhone, setArenaPhone]   = useState('+998 90 123 4567');
  const [timezone, setTimezone]       = useState('Asia/Tashkent');
  const [currency, setCurrency]       = useState('USD');
  const [maxSlots, setMaxSlots]       = useState('20');
  const [bookingAdvance, setBookingAdvance] = useState('7');

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.settings}
        subtitle="Tizim sozlamalarini boshqaring"
        icon={Settings}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" />
            {t.save}
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-2 space-y-1 lg:sticky lg:top-20">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-heading font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <>
              {/* Arena info */}
              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="Arena Ma'lumotlari" description="Platformaning asosiy ma'lumotlari" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Arena Nomi', value: arenaName,    set: setArenaName,     icon: Flag,  placeholder: 'F1RC.UZ Arena' },
                    { label: 'Email',      value: arenaEmail,   set: setArenaEmail,    icon: Mail,  placeholder: 'info@f1rc.uz' },
                    { label: 'Telefon',    value: arenaPhone,   set: setArenaPhone,    icon: Phone, placeholder: '+998 90 000 0000' },
                    { label: 'Timezone',   value: timezone,     set: setTimezone,      icon: Clock, placeholder: 'Asia/Tashkent' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{f.label}</label>
                      <div className="relative">
                        <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          value={f.value}
                          onChange={e => f.set(e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking settings */}
              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="Booking Sozlamalari" description="Bron qilish qoidalari" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Valyuta', value: currency, set: setCurrency, options: ['USD', 'UZS', 'EUR', 'RUB'] },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{f.label}</label>
                      <select
                        value={f.value}
                        onChange={e => f.set(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                      >
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Max Slot (event)</label>
                    <input
                      type="number"
                      value={maxSlots}
                      onChange={e => setMaxSlots(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">Oldindan bron (kun)</label>
                    <input
                      type="number"
                      value={bookingAdvance}
                      onChange={e => setBookingAdvance(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* API */}
              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="API Kalitlari" description="Backend integratsiyasi uchun kalitlar (ishlab chiqarishda yashiring)" />
                <div>
                  <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">API Base URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        defaultValue={import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}
                        readOnly
                        className="w-full pr-10 pl-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground font-mono focus:outline-none"
                      />
                      <button onClick={() => setShowApiKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="px-3 py-2 rounded-lg border border-border text-xs font-heading text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> Yangilash
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 font-heading">
                    .env faylda VITE_API_BASE_URL orqali o'rnatiladi. Hech qachon frontend kodiga hardcode qilinmasin.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <>
              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="Kirish Xavfsizligi" />
                <SettingRow label="Ikki faktorli autentifikatsiya (2FA)" description="SMS yoki authenticator orqali qo'shimcha himoya">
                  <Toggle checked={twoFA} onChange={setTwoFA} />
                </SettingRow>
                <SettingRow label="Sessiya vaqti (daqiqa)" description="Harakatsizlikdan keyin avtomatik chiqish">
                  <select
                    value={sessionTimeout}
                    onChange={e => setSessionTimeout(e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {['15', '30', '60', '120', '480'].map(v => (
                      <option key={v} value={v}>{v} daqiqa</option>
                    ))}
                  </select>
                </SettingRow>
                <SettingRow label="IP filtrlash" description="Faqat ruxsat etilgan IP manzillardan kirish">
                  <Toggle checked={false} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Audit log" description="Barcha admin harakatlarini loglash">
                  <Toggle checked={true} onChange={() => {}} />
                </SettingRow>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="Parolni o'zgartirish" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Joriy parol', 'Yangi parol', 'Yangi parolni tasdiqlang'].map(label => (
                    <div key={label} className={label.includes('Joriy') ? '' : ''}>
                      <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest mb-1.5">{label}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <button className="mt-4 px-4 py-2 rounded-lg bg-primary/15 border border-primary/30 text-sm font-heading font-semibold text-primary hover:bg-primary/25 transition-colors">
                  Parolni yangilash
                </button>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="bg-card border border-border rounded-xl p-5">
              <SectionHeader title="Email Bildirishnomalar" description="Qaysi hodisalar uchun email olasiz" />
              {[
                { key: 'newBooking',     label: 'Yangi booking',             desc: 'Yangi bron qilinganida' },
                { key: 'cancelBooking',  label: 'Bekor qilingan booking',    desc: 'Bron bekor bo\'lganida' },
                { key: 'raceStart',      label: 'Poyga boshlanishi',         desc: 'Race session boshlanganida' },
                { key: 'newUser',        label: 'Yangi foydalanuvchi',       desc: 'Yangi user ro\'yxatdan o\'tganida' },
                { key: 'payment',        label: 'To\'lov',                   desc: 'Muvaffaqiyatli to\'lov amalga oshirilganida' },
                { key: 'systemAlert',    label: 'Tizim xabardorliklari',     desc: 'Xato yoki muammo yuz berganda' },
              ].map(n => (
                <SettingRow key={n.key} label={n.label} description={n.desc}>
                  <Toggle
                    checked={notifs[n.key as keyof typeof notifs]}
                    onChange={v => setNotifs(p => ({ ...p, [n.key]: v }))}
                  />
                </SettingRow>
              ))}
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <>
              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="Mavzu" description="Interfeys rangini tanlang" />
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: 'dark',  label: 'Dark',  icon: Moon,    preview: 'bg-zinc-900' },
                    { value: 'light', label: 'Light', icon: Sun,     preview: 'bg-zinc-100' },
                    { value: 'night', label: 'Night', icon: Monitor, preview: 'bg-black' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value as 'dark' | 'light' | 'night')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all w-28
                        ${theme === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                    >
                      <div className={`w-12 h-8 rounded-lg ${opt.preview} border border-white/10 flex items-center justify-center`}>
                        <opt.icon className="w-4 h-4 text-white/60" />
                      </div>
                      <span className="text-xs font-heading font-semibold">{opt.label}</span>
                      {theme === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="Til" description="Interfeys tilini tanlang" />
                <div className="flex gap-3 flex-wrap">
                  {LOCALES.map(loc => (
                    <button
                      key={loc.code}
                      onClick={() => setLocale(loc.code)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all
                        ${locale === loc.code
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                    >
                      <span className="text-xl">{loc.flag}</span>
                      <span className="text-sm font-heading font-semibold">{loc.label}</span>
                      {locale === loc.code && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <SectionHeader title="Sidebar" />
                <SettingRow label="Compact sidebar" description="Kichikroq va ixchamroq sidebar ko'rinishi">
                  <Toggle checked={false} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Animatsiyalar" description="UI animatsiya va o'tishlarni yoqish">
                  <Toggle checked={true} onChange={() => {}} />
                </SettingRow>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
