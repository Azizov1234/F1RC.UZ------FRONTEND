import { useState } from 'react';
import { ChevronDown, ShieldQuestion } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: "F1RC.UZ nima?",
      a: "F1RC.UZ — bu Formula, Le Mans, Rally, GT, Supercar va Hypercar uslubidagi professional masofadan boshqariladigan (RC) motorsport platformasi. Ushbu platformada haqiqiy RC mashinalarini birinchi shaxsdan videouzatuv (FPV) texnologiyasi orqali masofadan professional darajada boshqarishingiz va poygalarda qatnashishingiz mumkin."
    },
    {
      q: "RC racing qanday ishlaydi?",
      a: "Ishtirokchi event va mavjud slotni tanlaydi, tashkilotchi ko'rsatgan RC boshqaruv usuli bilan poygada qatnashadi. Sessiya, lap va natija ma'lumotlari backendda mavjud bo'lsa platformada ko'rsatiladi."
    },
    {
      q: "FPV nima?",
      a: "FPV (First Person View) — birinchi shaxsdan ko'rinish deganidir. RC poyga avtomobillariga o'rnatilgan HD kameralar tasviri real vaqtda boshqaruvchiga (racer) uzatiladi. Bu haydovchiga o'zini xuddi haqiqiy poyga avtomobili kokpiti ichida o'tirgandek his qilish imkonini beradi."
    },
    {
      q: "O‘z vehicle’im bilan qatnasha olamanmi?",
      a: "Bu har bir event reglamenti va tashkilotchining talablariga bog'liq. Event sahifasida bunday ruxsat ko'rsatilmagan bo'lsa, bookingdan oldin administrator bilan aniqlashtiring."
    },
    {
      q: "Vehicle platforma tomonidan beriladimi?",
      a: "Public Vehicles sahifasi backendda mavjud transportlarni ko'rsatadi. Muayyan event uchun vehicle berilishi va uning mavjudligi booking shartlarida tasdiqlanishi kerak."
    },
    {
      q: "Booking qanday qilinadi?",
      a: "Public eventni tanlang va booking tugmasini bosing. Guest foydalanuvchi login sahifasiga qaytish manzili bilan yo'naltiriladi; autentifikatsiyadan keyin mavjud slotlar racer kabinetida tanlanadi."
    },
    {
      q: "To‘lov qanday amalga oshiriladi?",
      a: "To'lov usuli event va administrator belgilagan amaldagi tartibga bog'liq. Platforma tasdiqlanmagan onlayn checkout yoki to'lov provayderini va'da qilmaydi."
    },
    {
      q: "Kimlar qatnasha oladi?",
      a: "Qatnashish talablari event reglamenti, yosh yoki xavfsizlik cheklovlari va vehicle murakkabligiga bog'liq. Ro'yxatdan o'tishdan oldin tanlangan event tafsilotlarini tekshiring."
    },
    {
      q: "Race result qayerda ko‘rinadi?",
      a: "Backend e'lon qilgan umumiy natijalar Leaderboard sahifasida ko'rinadi. Shaxsiy sessiya va achievement ma'lumotlari login qilingan racer kabinetida mavjud bo'lishi mumkin."
    }
  ];

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title / SEO Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_20px_rgba(255,0,0,0.15)]">
          <ShieldQuestion className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl uppercase">
          Ko'p beriladigan savollar
        </h1>
        <p className="mt-3 text-muted-foreground text-sm tracking-wider uppercase font-mono">
          F1RC.UZ • FAQ center
        </p>
      </div>

      {/* Accordion container */}
      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:border-primary/30"
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                id={`faq-btn-${i}`}
                className="w-full flex items-center justify-between p-5 text-left font-display font-semibold text-white tracking-wide hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/45"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              <div
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-btn-${i}`}
                hidden={!isOpen}
                className="border-t border-border/50"
              >
                <div className="p-5 text-sm text-muted-foreground leading-relaxed font-body">
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
