/**
 * motion.ts — F1RC.UZ Framer Motion Presetlari
 *
 * Barcha animatsiyalar shu yerdan import qilinsin.
 * prefers-reduced-motion foydalanuvchilari uchun animatsiyalar
 * avtomatik ravishda kamaytirilib, faqat opacity-dan foydalaniladi.
 *
 * Foydalanish:
 *   import { fadeIn, slideUp, modalTransition } from '@/lib/motion';
 *   <motion.div {...fadeIn}>...</motion.div>
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Transition Easing ──────────────────────────────────────────

export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,
  enter: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  spring: { type: 'spring', stiffness: 400, damping: 28 },
  springGentle: { type: 'spring', stiffness: 250, damping: 24 },
} as const;

// ─── Duration tokens ────────────────────────────────────────────
// UI javobini sekinlashtirmasligi uchun 120-320ms oraligida
export const duration = {
  fast: 0.12,    // 120ms — press feedback, hover
  normal: 0.2,   // 200ms — fadein, subtle
  medium: 0.25,  // 250ms — modal, drawer, page
  slow: 0.32,    // 320ms — enter animations
  decorative: 0.6, // 600ms — background, dekorative
} as const;

// ─── Base Transition ────────────────────────────────────────────
const base: Transition = {
  duration: duration.medium,
  ease: easing.smooth,
};

// ─── Page Transition ────────────────────────────────────────────
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { ...base, duration: duration.slow } },
  exit: { opacity: 0, y: -4, transition: { duration: duration.fast, ease: easing.exit } },
};

// ─── Modal Transition ────────────────────────────────────────────
export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { ...base } },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: duration.fast } },
};

export const backdropTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.normal } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

// ─── Drawer/Sheet Transition ─────────────────────────────────────
export const drawerBottomTransition: Variants = {
  initial: { y: '100%', opacity: 0.6 },
  animate: { y: 0, opacity: 1, transition: easing.springGentle },
  exit: { y: '100%', opacity: 0, transition: { duration: duration.fast, ease: easing.exit } },
};

export const drawerSideTransition: Variants = {
  initial: { x: '-100%', opacity: 0.6 },
  animate: { x: 0, opacity: 1, transition: easing.springGentle },
  exit: { x: '-100%', opacity: 0, transition: { duration: duration.fast, ease: easing.exit } },
};

// ─── Common Animations ───────────────────────────────────────────
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.normal } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { ...base } },
  exit: { opacity: 0, y: 8, transition: { duration: duration.fast } },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { ...base } },
  exit: { opacity: 0, y: -8, transition: { duration: duration.fast } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { ...base } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: duration.fast } },
};

// ─── Stagger Container ───────────────────────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { ...base, duration: duration.slow } },
};

// ─── Interactive Feedback ─────────────────────────────────────────
export const buttonPress = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.02 },
  transition: { duration: duration.fast, ease: easing.smooth },
} as const;

export const listItemTransition: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: duration.normal } },
};

// ─── Skeleton Pulse (CSS-based) ──────────────────────────────────
// Framer Motion o'rniga CSS animation ishlatiladi (performance uchun)

// ─── Reduced Motion Helper ───────────────────────────────────────
/**
 * prefers-reduced-motion foydalanuvchilari uchun animatsiya o'chiriladi.
 * Faqat opacity transition qoladi.
 * CSS'dagi @media (prefers-reduced-motion: reduce) ham sozlangan.
 */
export function getReducedMotionVariants(variants: Variants): Variants {
  // Bu funksiya React component ichida ishlatiladi, media query serverda
  // dinamik aniqlanadi. CSS prefers-reduced-motion uchun index.css da ham qoida bor.
  return Object.fromEntries(
    Object.entries(variants).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [key, { ...value, y: 0, x: 0, scale: 1 }];
      }
      return [key, value];
    })
  );
}

// ─── Dropdown Transition ─────────────────────────────────────────
export const dropdownTransition: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: duration.fast } },
};

// ─── Tab Content Transition ──────────────────────────────────────
export const tabContentTransition: Variants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: duration.normal } },
  exit: { opacity: 0, x: -8, transition: { duration: duration.fast } },
};
