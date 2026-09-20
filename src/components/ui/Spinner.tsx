import { cn } from '@/lib/cn';

/**
 * Indicateur d'activité.
 *
 * `currentColor` plutôt qu'une couleur figée : le même composant s'affiche
 * correctement sur un bouton primaire (blanc) et sur un fond clair (indigo),
 * sans variante à maintenir.
 */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <svg
        className={cn('size-4 animate-spin text-current', className)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {/* Le texte est toujours présent pour les lecteurs d'écran ; sans lui,
          un chargement est parfaitement silencieux. */}
      <span className={label ? 'text-sm text-muted' : 'sr-only'}>
        {label ?? 'Chargement…'}
      </span>
    </span>
  );
}
