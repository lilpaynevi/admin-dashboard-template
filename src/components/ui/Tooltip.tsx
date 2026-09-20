import { useId, useState, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
};

/**
 * Bulle d'aide au survol **et au focus**.
 *
 * Le focus n'est pas un détail : sans lui, l'information n'existe que pour
 * qui utilise une souris. Une bulle ne doit donc jamais porter une
 * information indispensable — seulement la préciser.
 */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {/* `w-full` : l'enveloppe ne doit pas rétrécir ce qu'elle entoure. Sans
          ça, une entrée de menu emballée dans une bulle perd sa pleine
          largeur et son fond actif s'arrête au texte. */}
      <span className="w-full" aria-describedby={isVisible ? id : undefined}>
        {children}
      </span>

      {isVisible && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-50 w-max max-w-xs -translate-x-1/2 animate-fade-in rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-popover',
            side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
