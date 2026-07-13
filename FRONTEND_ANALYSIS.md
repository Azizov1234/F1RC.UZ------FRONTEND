# F1RC.UZ Frontend Loyihasi Arxitekturasi va Dizayni Tahlili

Ushbu hujjat **F1RC.UZ** frontend platformasining barcha texnik, arxitekturaviy va vizual jihatlarini to'liq va batafsil tahlil qilib beradi.

---

## 1. Umumiy Texnologik Stek (Tech Stack)

Loyihaning asosi zamonaviy, tezkor va xavfsiz texnologiyalar ustiga qurilgan:

*   **Dasturlash Tili:** `TypeScript` (`TSX`) — kod sifati, tiplar xavfsizligi va qulay refaktoring uchun.
*   **Asosiy Karkas:** `React 19` (`^19.2.6`) — dinamik interfeyslar va komponentlar yaratish uchun.
*   **Loyiha Yig'uvchi (Bundler):** `Vite 8` (`^8.0.12`) — tezkor yig'ish va ishlash jarayonidagi samaradorlik (Hot Module Replacement) uchun `@vitejs/plugin-react-swc` bilan birga.
*   **Dizayn va Styling:** `Tailwind CSS 3` (`^3.4.19`) va `PostCSS` — qulay, moslashuvchan va tezkor dizayn komponentlarini yaratish uchun.
*   **Marshrutlash (Routing):** `React Router DOM 7` (`^7.17.0`) — sahifalararo navigatsiya, himoyalangan yo'llar va rollarga asoslangan yo'naltirishlar uchun.
*   **Server bilan ishlash va State Management:** `TanStack React Query 5` (`^5.101.0`) — server ma'lumotlarini keshlash, sinxronizatsiya qilish va so'rovlar holatini boshqarish uchun.
*   **Animatsiyalar:** `Framer Motion` (`^12.40.0`) — interfeysdagi ravon o'tishlar va mikro-animatsiyalar uchun.
*   **Grafik va Diagrammalar:** `Recharts` (`^3.8.1`) — tahliliy ma'lumotlar va statistik grafiklar chizish uchun.

---

## 2. Kutubxonalar Ro'yxati (Dependencies)

`package.json` faylidan olingan asosiy kutubxonalar va ularning vazifalari:

### Asosiy Kutubxonalar (Dependencies)
| Kutubxona | Versiya | Vazifasi / Ishlatilish o'rni |
| :--- | :--- | :--- |
| `@tanstack/react-query` | `^5.101.0` | Asinxron so'rovlarni boshqarish va keshlash (React Query) |
| `react` / `react-dom` | `^19.2.6` | Ilovaning yadrosi (React v19) |
| `react-router-dom` | `^7.17.0` | Marshrutlash va URL boshqaruvi |
| `framer-motion` | `^12.40.0` | Animatsiyalar yaratish kutubxonasi |
| `recharts` | `^3.8.1` | Dashboard sahifalaridagi statistik vizual grafiklar |
| `lucide-react` | `^1.17.0` | Tizimdagi barcha piktogrammalar va ikonalar to'plami |
| `date-fns` / `moment` | `^4.4.0` / `^2.30.1` | Sana va vaqtlar bilan ishlash, formatlash |
| `react-hot-toast` | `^2.6.0` | Bildirishnomalar va pop-up ogohlantirishlar |
| `react-markdown` | `^10.1.0` | Markdown ko'rinishidagi matnlarni HTML formatga o'tkazib ko'rsatish |
| `lodash` | `^4.18.1` | Massiv va obyektlar ustida amallar bajarish uchun yordamchi funksiyalar |

### Ishlab Chiqish Muhiti Kutubxonalari (DevDependencies)
*   **TypeScript:** `^6.0.3` (kod tiplari tekshiruvi)
*   **Tailwind Merge / Clsx:** Class ismlarini dinamik birlashtirish va ziddiyatlarni hal qilish uchun.
*   **Autoprefixer / PostCSS:** CSS-ni turli brauzerlarga moslashtirish uchun.
*   **Eslint:** Kod standarti va xatoliklarni erta aniqlash tizimi.

---

## 3. Loyiha Arxitekturasi va Papkalar Tuzilishi

Loyiha toza qatlamli arxitekturaga (Layered Architecture) asoslangan. Kodlar vazifasiga ko'ra quyidagicha taqsimlangan:

```
frontend/
├── public/                 # Statik fayllar (rasmlar, ikonalar, shriftlar)
├── src/
│   ├── api/                # API so'rovlari va mijoz sozlamalari (Fetch/Axios wrapperlar)
│   ├── components/         # Qayta ishlatiladigan umumiy UI komponentlar va layoutlar
│   │   ├── admin/          # Admin sahifalariga xos maxsus komponentlar
│   │   ├── layout/         # Rollarga mos asosiy karkas (Sidebar, Header, Nav)
│   │   └── ui/             # Kichik atomar komponentlar (Button, Input, Badge va h.k.)
│   ├── hooks/              # Maxsus React hooklari va React Query so'rovlari
│   │   └── api/            # API bilan ishlovchi shaxsiy hooklar (useVehicles, useUsers...)
│   ├── lib/                # Global Context (Auth, Theme), i18n localization va sozlamalar
│   ├── mocks/              # Offline ishlash va testlash uchun simulyatsiya ma'lumotlari (Mock)
│   ├── pages/              # Tizimdagi barcha sahifalar (rollar bo'yicha ajratilgan)
│   ├── types/              # TypeScript interfeyslari va turlari (models/schemas)
│   ├── App.tsx             # Marshrutlar (Routes) va provayderlarni birlashtiruvchi bosh fayl
│   ├── main.tsx            # Ilovani ishga tushiruvchi yadro fayl
│   └── index.css           # Global uslublar, Tailwind sozlamalari va CSS o'zgaruvchilari
├── tailwind.config.js      # Tailwind CSS mavzulari va rang sozlamalari
├── vite.config.ts          # Vite sozlamalari va proxy qoidalari
└── tsconfig.json           # TypeScript sozlamalari
```

### 3.1. Marshrutlash va Rollarga Asoslangan Himoya (Authentication & RBAC)
*   **Marshrutlar (Routes):** `/src/App.tsx` faylida barcha sahifalar to'plangan va tizimli boshqariladi.
*   **Himoyalangan yo'llar (ProtectedRoute):** Foydalanuvchi tizimdan o'tganligini (`AuthContext` orqali) va roli to'g'ri kelishini tekshiradi.
*   **Rollar tizimi (User Roles):**
    1.  `SUPERADMIN` / `ADMIN` — To'liq boshqaruv (Dashboard, Users, Events, Bookings, Race Sessions, Leaderboard, Teams, Seasons, Streams, Payments, Audit Logs, Vehicles, Categories, Settings va h.k.).
    2.  `OPERATOR` — Poygalarni boshqarish va mijozlarni ro'yxatdan o'tkazish (Check-In, Race Sessions, Bookings).
    3.  `RACER` — Poygachilar portali (Dashboard, Events, Leaderboard, Challenges, Profile).
    4.  `TEAM_MANAGER` — Jamoa menejeri boshqaruvi (Team Dashboard, Standings, Events).
    5.  `VIEWER` — Tomoshabinlar sahifasi (Streams, Leaderboard, Dashboard).

### 3.2. API So'rovlar Tizimi (Data Fetching Layer)
*   **`ApiClient` (`src/api/api.ts`):** JavaScriptning standart `fetch` API-si ustiga qurilgan xususiy sinf bo'lib, quyidagi vazifalarni avtomatlashtiradi:
    *   Sarlavhaga `Authorization: Bearer <token>` parametrini avtomatik qo'shish.
    *   **Avtomatik Token Yangilash (401 Interceptor):** Agar so'rov 401 (Ruxsatsiz) xatoligi bilan qaytsa va refresh token mavjud bo'lsa, tizim avtomatik tarzda `/auth/refresh` so'rovini yuboradi va yangi token bilan eski so'rovlarni navbat bo'yicha qayta bajaradi (`failedQueue` yordamida).
*   **`base44` Mijoz ko'prigi (`src/api/base44Client.ts`):** Agar `.env` faylida `VITE_API_URL` ko'rsatilmagan bo'lsa, ilova avtomatik tarzda lokal mock ma'lumotlarga (`src/mocks/base44ClientMock.ts`) ulanadi. Bu loyihani backend-siz ham to'liq test qilish imkonini beradi.

### 3.3. Ko'p tillilik tizimi (i18n)
Loyihada `/src/lib/i18n.tsx` orqali Context asosidagi shaxsiy localization tizimi yaratilgan bo'lib, u quyidagi tillarni qo'llab-quvvatlaydi:
*   `uz` — O'zbekcha (bayrog'i: 🇺🇿)
*   `ru` — Русский (bayrog'i: 🇷🇺)
*   `en` — English (bayrog'i: 🇬🇧)

---

## 4. Dizayn va Vizual Estetika (Design System & Colors)

Loyiha poygalarga (Formula 1, Go-Kart) moslashgan **futuristik va premium to'q dizayn** (Dark/Cyberpunk Racing aesthetic) uslubida ishlangan.

### 4.1. Shriftlar (Typography)
Matnlar o'qilishini vizual jihatdan boyitish maqsadida Google Fonts kutubxonasidan quyidagi shriftlar yuklab olingan va ishlatilgan:
1.  **Sarlavhalar va Displey elementlari (Heading / Display):** `Rajdhani` va `Orbitron` — futuristik, sport uslubidagi qalin va burchakli shriftlar.
2.  **Tana matnlari (Body):** `Inter` — juda toza, o'qishga oson va zamonaviy sans-serif shrifti.
3.  **Kodlar va raqamlar (Monospace):** `JetBrains Mono` — ma'lumotlar va statistik raqamlarning tartibli ko'rinishi uchun.

### 4.2. Ranglar Palitrasi (HSL formatida)
Loyiha 3 xil rejimda (Mavzuda) ishlay oladi. Ranglar `tailwind.config.js` da HSL o'zgaruvchilari orqali bog'langan:

#### Asosiy Poyga Ranglari (Racing Brand Colors)
*   **Racing Red (Asosiy brend rangi):** `hsl(0 90% 50%)` — yorqin qizil rang. Barcha faol tugmalar, asosiy neon chiziqlar va muhim joylarda ishlatiladi.
*   **Accent Red:** `hsl(0 75% 45%)` — bir oz to'qroq qizil, hover (sichqoncha ustiga kelgandagi) effektlar uchun.

#### 1. Qorong'u Mavzu (Standard Dark Mode - Root `:root`)
*   **Fon rang (Background):** `hsl(0 0% 4%)` (to'q kulrang/qora)
*   **Karta foni (Card Background):** `hsl(0 0% 7%)`
*   **Matn rangi (Foreground):** `hsl(0 0% 96%)`
*   **Chegaralar (Border):** `hsl(0 0% 14%)`

#### 2. Tungi OLED Mavzu (AMOLED Night Mode - `.night`)
*   **Fon rang (Background):** `hsl(0 0% 0%)` (mutloq qora, batareyani tejovchi va kontrastli)
*   **Karta foni (Card Background):** `hsl(0 0% 3%)`
*   **Chegaralar (Border):** `hsl(0 0% 8%)`

#### 3. Yorug' Mavzu (Light Mode - `.light`)
*   **Fon rang (Background):** `hsl(0 0% 96%)` (och kulrang)
*   **Karta foni (Card Background):** `hsl(0 0% 100%)` (oq rang)
*   **Matn rangi (Foreground):** `hsl(0 0% 9%)` (to'q kulrang/qora)
*   **Chegaralar (Border):** `hsl(0 0% 84%)`

### 4.3. Maxsus Vizual Effektlar va Animatsiyalar (`src/index.css`)
Interfeys oddiy bo'lib qolmasligi va "Wow" effektini berishi uchun bir qancha vizual metodlar qo'llangan:

*   **Radial Gradiyent Fon:** Orqa fonda ko'zga tashlanmas yorqin qizil nurlar porlashi simulyatsiyasi qilingan:
    ```css
    radial-gradient(ellipse at 20% 50%, hsl(0 90% 50% / 0.04) 0%, transparent 60%)
    ```
*   **Neon Nur Effekti (`racing-glow`):** Kartalar va muhim panellar atrofida qizil chiroq taralishi:
    ```css
    box-shadow: 0 0 20px hsl(0 90% 50% / 0.3), 0 0 40px hsl(0 90% 50% / 0.1);
    ```
*   **Tezkor Qizil Chiziq (`speed-line`):** Foydalanuvchi interfeysidagi panellarda chapdan o'ngga qarab yugurib o'tadigan, poyga tezligini ifodalovchi chiziq animatsiyasi:
    ```css
    background: linear-gradient(90deg, transparent 0%, hsl(0 90% 50%) 50%, transparent 100%);
    animation: speedLine 2s ease-in-out infinite;
    ```
*   **Pulsatsiyalovchi Qizil Doira (`pulse-red`):** Aktiv holat yoki jonli (live) oqimlarni ifodalovchi yorug'lik pulsi.
*   **Premium Glassmorphism:** Tizimdagi asosiy kartalar shaffof qilib ishlangan bo'lib, orqa fonni xiralashtirish texnologiyasiga ega (`backdrop-blur-md bg-card/60 border border-border/80`).
*   **Maxsus Scrollbar:** O'ng tomondagi varaqlash chizig'i standart ko'rinishdan yupqa va qizil neon rangga moslashtirilgan.
*   **Light Mode Contrast Helper:** Yorug' rejimga o'tganda matnlar oq rangda qolib ketib, ko'rinmas bo'lib qolishining oldini oluvchi maxsus CSS qatlamlari yozilgan (`.light .text-white` klasslarini avtomatik to'q rangga o'tkazadi).

---

## 5. Loyihaning Kuchsiz va Kuchli Tomonlari

### Kuchli tomonlari:
1.  **Dizayn sifati:** Animatsiyalar va neon effektlar orqali juda premium ko'rinishga ega. OLED/Light/Dark rejimlari mavjudligi.
2.  **Avtomatik token yangilash (Fetch Interceptor):** Foydalanuvchining sessiyasi uzilib qolmaydi, token o'zi yangilanadi.
3.  **Mocking tizimi:** Backend yo'qligida ham loyihaning barcha sahifalari to'liq ishlaydi, bu tezkor prototiplash imkonini beradi.
4.  **Moslashuvchanlik (Responsive):** Mobil qurilmalar uchun maxsus pastki menyu (`MobileBottomNav`) yaratilgan bo'lib, kichik ekranlarda ham qulay ishlaydi.

### Kamchiliklari (Yaxshilash mumkin bo'lgan joylar):
1.  API mijozda `axios` o'rniga oddiy `fetch` ishlatilganligi sababli, interceptorlar va xatoliklar bilan ishlash mantiqiy kodlari bir oz murakkabroq yozilgan.
2.  Lokalizatsiya `i18n` tizimi maxsus kutubxona (`react-i18next`) orqali emas, balki shaxsiy Context yordamida sodda shakllantirilgan.

---
*Ushbu hisobot F1RC.UZ frontend loyihasi fayllarini to'liq o'rganish va tahlil qilish natijasida tayyorlandi.*
