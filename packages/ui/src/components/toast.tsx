'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastOptions = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  /** Durée en ms avant fermeture automatique (0 = pas d'auto-dismiss). */
  duration?: number;
};

type ToastRecord = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  toast: (options: ToastOptions | string) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;

const variantStyles: Record<ToastVariant, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-100',
  error:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-100',
  info: 'border-atg-border bg-atg-elevated text-atg-fg',
};

const variantAriaLive: Record<ToastVariant, 'polite' | 'assertive'> = {
  success: 'polite',
  error: 'assertive',
  info: 'polite',
};

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: string) => void }) {
  const variant = toast.variant ?? 'info';

  return (
    <div
      role="status"
      aria-live={variantAriaLive[variant]}
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 shadow-lg shadow-black/10 dark:shadow-black/30',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-atg-surface',
        variantStyles[variant],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
          <p className={cn('text-sm', toast.title && 'mt-0.5')}>{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={cn(
            'shrink-0 rounded-md p-1 text-sm opacity-70 transition-opacity hover:opacity-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
          aria-label="Fermer la notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions | string) => {
      const payload: ToastOptions =
        typeof options === 'string' ? { message: options } : options;
      const id = crypto.randomUUID();
      const record: ToastRecord = { ...payload, id };
      setToasts((prev) => [...prev, record]);

      const duration = payload.duration ?? DEFAULT_DURATION;
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div
              aria-label="Notifications"
              className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
            >
              {toasts.map((item) => (
                <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
