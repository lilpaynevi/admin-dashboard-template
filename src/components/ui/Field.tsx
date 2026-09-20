import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type FieldProps = {
  label?: string;
  /** Texte d'aide affiché sous le champ — masqué dès qu'une erreur apparaît. */
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /**
   * Reçoit les identifiants à recopier sur le champ. C'est ce câblage qui
   * relie le libellé et le message d'erreur au contrôle pour un lecteur
   * d'écran — sans lui, l'erreur est visible mais jamais annoncée.
   */
  children: (ids: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => ReactNode;
};

export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children({ id, describedBy, invalid: Boolean(error) })}

      {error ? (
        // `role="alert"` : le message est annoncé dès qu'il apparaît, sans
        // attendre que l'utilisateur revienne sur le champ.
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Styles partagés par `Input`, `Select` et `Textarea` — une seule définition. */
export const controlStyles = (invalid?: boolean) =>
  cn(
    'w-full rounded-lg border bg-surface px-3 text-sm text-foreground transition-colors',
    'placeholder:text-subtle',
    'disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-muted',
    invalid ? 'border-danger' : 'border-border hover:border-subtle',
  );
