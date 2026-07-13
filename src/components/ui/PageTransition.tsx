import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  /** Unique key — sahifa o'zgarganda animation triggerlash uchun */
  pageKey: string;
}

export function PageTransition({ children, className, pageKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn('w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Simpler — wrapper without exit animation (for content inside same page) */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
