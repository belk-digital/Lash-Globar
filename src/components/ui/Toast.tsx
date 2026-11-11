'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'error';

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms before auto-dismiss (default 5000; errors 7000). */
  duration?: number;
};

type ToastItem = Required<Pick<ToastInput, 'title' | 'variant'>> &
  Pick<ToastInput, 'description'> & { id: number };

type ToastContextValue = { toast: (input: ToastInput) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

/** Fire a toast from any client component: `const { toast } = useToast()`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const KIND_LABEL: Record<ToastVariant, string> = {
  default: 'Notice',
  success: 'Done',
  error: 'Error',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration }: ToastInput) => {
      const id = nextId.current++;
      // Keep at most 3 on screen.
      setToasts((all) => [...all.slice(-2), { id, title, description, variant }]);
      const ms = duration ?? (variant === 'error' ? 7000 : 5000);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), ms),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Polite live region: announced by screen readers without stealing focus. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-frame"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.5, ease: EASE }}
              role={t.variant === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-md items-start gap-4 border border-ink bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p
                  className={cn('label', t.variant === 'error' ? 'text-red-700' : 'text-ink-soft')}
                >
                  {KIND_LABEL[t.variant]}
                </p>
                <p className="mt-2 text-sm font-bold">{t.title}</p>
                {t.description ? (
                  <p className="mt-1 text-sm text-ink-soft">{t.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="-m-2 flex size-10 shrink-0 items-center justify-center text-ink transition-colors hover:bg-lavender"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
