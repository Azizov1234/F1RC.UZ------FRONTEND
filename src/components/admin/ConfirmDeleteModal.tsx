import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  deleting: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Foydalanuvchini o'chirish",
  message = "Haqiqatan ham ushbu foydalanuvchini o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.",
  deleting
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl relative animate-scale-up">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={deleting}
          className="absolute right-4 top-4 p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-white text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-heading px-2">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-white hover:border-white/30 transition-all font-heading disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-550 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg text-sm text-white font-heading font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-655/20"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                O'chirilmoqda...
              </>
            ) : (
              "O'chirish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
