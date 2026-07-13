import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modalTransition, backdropTransition } from '@/lib/motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Tashqariga bosib yopilmasin */
  preventOutsideClose?: boolean;
  /** ESC bilan yopilmasin */
  preventEscClose?: boolean;
  /** Footer area (action tugmalar) */
  footer?: React.ReactNode;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  preventOutsideClose = false,
  preventEscClose = false,
  footer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Modal ochilganda focus tuzatish va ESC listener qo'shish
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus modalni ichiga
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);

      if (!preventEscClose) {
        const handleEsc = (e: KeyboardEvent) => {
          if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
      }
    } else {
      // Modal yopilganda focus'ni qaytarish
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, onClose, preventEscClose]);

  // Focus trap — tabbing modal ichida qolsin
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            variants={backdropTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={preventOutsideClose ? undefined : onClose}
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            key="modal-panel"
            ref={modalRef}
            variants={modalTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            className={cn(
              'relative w-full bg-card/95 backdrop-blur-xl border border-border/80',
              'rounded-2xl shadow-2xl overflow-hidden outline-none',
              sizeMap[size],
              className
            )}
          >
            {/* Inner glass highlight */}
            <div
              className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/5 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            {/* Header */}
            {(title || description) && (
              <div className="relative flex items-start justify-between p-5 border-b border-border/80">
                <div>
                  {title && (
                    <h2
                      id="modal-title"
                      className="font-heading font-bold text-foreground text-lg tracking-wide"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="text-sm text-muted-foreground mt-0.5 font-body"
                    >
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 ml-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
                  aria-label="Yopish"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="relative p-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="relative px-5 pb-5 pt-0 border-t border-border/50 flex justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
