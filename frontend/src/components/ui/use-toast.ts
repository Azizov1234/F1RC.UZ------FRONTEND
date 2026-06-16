import { toast as hotToast } from 'react-hot-toast';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function toast({ title, description, variant }: ToastProps) {
  const message = [title, description].filter(Boolean).join(': ');
  if (variant === 'destructive') {
    hotToast.error(message || 'Error occurred');
  } else {
    hotToast.success(message || 'Success');
  }
}
