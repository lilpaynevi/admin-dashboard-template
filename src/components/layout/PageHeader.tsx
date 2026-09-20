import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Actions principales de l'écran : « Nouvel utilisateur », « Exporter »… */
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-wrap items-start justify-between gap-4',
        className,
      )}
    >
      <div className="min-w-0">
        {/* Un seul `h1` par page : c'est le point d'entrée de la navigation
            par titres, et le repère qu'annonce un lecteur d'écran à l'arrivée. */}
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
