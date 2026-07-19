import { ShieldCheck, Cpu, Target, Flag, Trophy, Compass } from 'lucide-react';
import { usePublicArenas } from '@/hooks/api/useArenas';
import { usePublicCategories } from '@/hooks/api/useCategories';
import { usePublicEvents } from '@/hooks/api/useEvents';

export default function AboutPage() {
  const arenasQuery = usePublicArenas({ limit: 1 });
  const categoriesQuery = usePublicCategories({ limit: 1 });
  const eventsQuery = usePublicEvents({ limit: 1 });
  const stats = [
    { label: 'Public arenas', value: arenasQuery.data?.meta?.total ?? arenasQuery.data?.data.length ?? 0 },
    { label: 'Racing categories', value: categoriesQuery.data?.meta?.total ?? categoriesQuery.data?.data.length ?? 0 },
    { label: 'Published events', value: eventsQuery.data?.meta?.total ?? eventsQuery.data?.data.length ?? 0 },
  ].filter((stat) => stat.value > 0);

  const values = [
    {
      icon: Cpu,
      title: 'Haqiqiy Telemetriya',
      desc: 'Platforma backendda mavjud poyga natijalari, lap time va sessiya ma\'lumotlarini yagona interfeysda ko\'rsatishga mo\'ljallangan.'
    },
    {
      icon: Target,
      title: 'FPV Haydash Tajribasi',
      desc: 'FPV — RC avtomobil kamerasidan birinchi shaxs ko\'rinishidagi boshqaruv tajribasi konsepti.'
    },
    {
      icon: Trophy,
      title: 'Chempionat va Mavsumlar',
      desc: 'Public mavsumlar, eventlar va backendda mavjud reyting natijalarini kuzatish imkoniyati.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* Hero section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase mb-4">
          <Flag className="w-3.5 h-3.5" /> F1RC.UZ loyihasi haqida
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
          RC poygalarining professional <br className="hidden sm:inline" />
          <span className="text-primary">motorsport dunyosi</span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
          F1RC.UZ masofadan boshqariladigan avtomobillar poygasi uchun event, arena, transport, stream va reyting ma'lumotlarini birlashtiruvchi platformadir.
        </p>
      </section>

      {/* Statistics are shown only when real public API totals are available. */}
      {stats.length > 0 && (
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-card border border-border p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(hsl(0 90% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 90% 50%) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {stats.map((s, idx) => (
          <div key={idx} className="text-center space-y-1 z-10">
            <p className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">{s.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono tracking-widest uppercase">{s.label}</p>
          </div>
        ))}
      </section>
      )}

      {/* Main content grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
            Platformaning asosiy missiyasi va imkoniyatlari
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-body">
            Loyiha RC motorsportni qulay, tushunarli va raqamli formatda namoyish qilishga yo'naltirilgan. Aniq event shartlari va mavjud imkoniyatlar har bir public event sahifasida backend ma'lumoti asosida ko'rsatiladi.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed font-body">
            Booking va boshqa shaxsiy amallar autentifikatsiyani talab qiladi; guest foydalanuvchilar esa public katalog va jonli efirlarni login qilmasdan ko'rishi mumkin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex items-center gap-2.5 bg-card border border-border p-3.5 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider leading-normal">
                Public ma'lumotlar — real API
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-card border border-border p-3.5 rounded-2xl">
              <Compass className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider leading-normal">
                Shaxsiy amallar — autentifikatsiya
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card via-background to-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <div className="absolute top-4 right-4 w-12 h-12 bg-primary/5 rounded-full blur-xl animate-pulse" />
          <h3 className="font-display text-xl font-bold text-white tracking-wide uppercase">Asosiy Qadriyatlarimiz</h3>
          <div className="space-y-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-wide">{v.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-body">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
