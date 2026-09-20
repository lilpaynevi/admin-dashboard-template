import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  /**
   * Doit dire quoi faire, pas seulement constater le vide. « Aucun résultat »
   * laisse l'utilisateur bloqué ; « Aucun résultat pour « dupont » — essayez
   * un autre terme » lui donne la sortie.
   */
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon && (
        <span className="flex size-11 items-center justify-center rounded-full bg-surface-raised text-subtle">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}

      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>

      {action}
    </div>
  );
}
