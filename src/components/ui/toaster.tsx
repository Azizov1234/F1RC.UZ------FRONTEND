import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(0 0% 10%)',
          color: '#fff',
          border: '1px solid hsl(0 0% 20%)',
          fontSize: '14px',
          borderRadius: '10px',
        },
        success: {
          iconTheme: { primary: 'hsl(0 90% 50%)', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />
  );
}
