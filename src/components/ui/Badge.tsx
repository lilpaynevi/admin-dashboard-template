import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-raised text-muted',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
};

export type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  /**
   * Ajoute une pastille de couleur devant le texte. Utile en liste dense, où
   * l'œil balaie une colonne d'états : la pastille se repère plus vite que la
   * nuance du fond.
   */
  dot?: boolean;
  className?: string;
};

/**
 * Le statut est porté par le **texte**, la couleur ne fait que le renforcer.
 * Une pastille verte seule est illisible pour un daltonien, et invisible en
 * impression noir et blanc.
 */
export function Badge({ children, tone = 'neutral', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
