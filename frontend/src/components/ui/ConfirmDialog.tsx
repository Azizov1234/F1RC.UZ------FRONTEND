import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { backdropTransition, modalTransition } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Tasdiqlang',
  message = 'Ushbu amalni ortga qaytarib bo\'lmaydi. Davom etasizmi?',
  confirmLabel = 'Ha, davom etish',
  cancelLabel = 'Bekor qilish',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="confirm-backdrop"
            variants={backdropTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={loading ? undefined : onClose}
          />

          {/* Dialog */}
          <motion.div
            key="confirm-dialog"
            variants={modalTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            {/* Inner glass */}
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative">
              {/* Icon */}
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
                variant === 'danger' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
              )}>
                {variant === 'danger' ? (
                  <Trash2 className="w-5 h-5 text-red-400" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                )}
              </div>

              {/* Title */}
              <h2
                id="confirm-title"
                className="font-heading font-bold text-foreground text-lg mb-2"
              >
                {title}
              </h2>

              {/* Message */}
              <p
                id="confirm-message"
                className="text-sm text-muted-foreground font-body leading-relaxed mb-6"
              >
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-transparent text-sm font-heading text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-white/5 transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  {cancelLabel}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-heading font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
                    variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-500 shadow-[0_4px_14px_0_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_0_rgba(239,68,68,0.45)]'
                      : 'bg-yellow-600 hover:bg-yellow-500 shadow-[0_4px_14px_0_rgba(234,179,8,0.3)]'
                  )}
                >
                  {loading && (
                    <span
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {loading ? 'Jarayon...' : confirmLabel}
                </button>
              </div>
            </div>

            {/* Close top-right */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
