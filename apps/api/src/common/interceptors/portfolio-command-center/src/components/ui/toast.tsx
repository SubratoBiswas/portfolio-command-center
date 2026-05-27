import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = React.createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, variant }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) => setToasts(t => t.filter(x => x.id !== id));

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const tones: Record<ToastVariant, string> = {
    success: 'bg-ok-bg border-ok/30 text-ok',
    error: 'bg-crit-bg border-crit/30 text-crit',
    info: 'bg-info-bg border-info/30 text-info',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
        {toasts.map(t => {
          const Icon = icons[t.variant];
          return (
            <div key={t.id} className={cn('flex items-start gap-3 px-4 py-3 rounded-md border shadow-pop text-sm animate-in slide-in-from-bottom-2', tones[t.variant])}>
              <Icon size={15} className="mt-0.5 shrink-0" />
              <span className="flex-1 text-ink text-xs">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-ink-muted hover:text-ink shrink-0 mt-0.5"><X size={13} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
