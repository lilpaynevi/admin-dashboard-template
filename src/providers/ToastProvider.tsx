import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
};

type ToastOptions = {
  description?: string;
  /** En millisecondes. `0` garde la notification jusqu'au clic. */
  duration?: number;
};

type ToastContextValue = {
  success: (title: string, options?: ToastOptions) => void;
  error: (title: string, options?: ToastOptions) => void;
  warning: (title: string, options?: ToastOptions) => void;
  info: (title: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;
/** Une erreur reste plus longtemps : elle demande souvent de relire l'écran. */
const ERROR_DURATION = 8000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Un compteur, pas `Math.random()` : deux notifications déclenchées dans la
  // même milliseconde doivent avoir des clés React distinctes.
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, options?: ToastOptions) => {
      const id = nextId.current++;
      setToasts((current) => {
        const next = [...current, { id, variant, title, description: options?.description }];
        // Au-delà de trois, la pile masque le contenu de la page. On garde les
        // plus récentes, qui correspondent à la dernière action.
        return next.slice(-3);
      });

      const duration =
        options?.duration ?? (variant === 'error' ? ERROR_DURATION : DEFAULT_DURATION);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (title, options) => push('success', title, options),
      error: (title, options) => push('error', title, options),
      warning: (title, options) => push('warning', title, options),
      info: (title, options) => push('info', title, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être appelé sous un <ToastProvider>.');
  }
  return context;
}

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: XCircle, className: 'text-danger' },
  warning: { icon: AlertTriangle, className: 'text-warning' },
  info: { icon: Info, className: 'text-info' },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  /**
   * Monté dans un portail sur `<body>` : à l'intérieur de l'arbre, un parent
   * avec `overflow: hidden` ou un `transform` rognerait les notifications ou
   * casserait leur positionnement fixe.
   */
  return createPortal(
    <div
      // `polite` et non `assertive` : une confirmation d'enregistrement ne doit
      // pas couper la lecture en cours d'un lecteur d'écran.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:flex-col-reverse"
    >
      {toasts.map((toast) => {
        const { icon: Icon, className } = VARIANT_STYLES[toast.variant];

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-slide-in-right items-start gap-3 rounded-card border border-border bg-surface p-3 shadow-popover"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', className)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-sm text-muted">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fermer la notification"
              className="-m-1 rounded p-1 text-subtle transition-colors hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
