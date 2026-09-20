import { cn } from '@/lib/cn';

/**
 * Bloc gris pulsant affiché pendant le chargement.
 *
 * Il doit avoir **les dimensions du contenu réel**. Un squelette plus petit
 * fait sauter la page à l'arrivée des données — ce saut est précisément ce
 * qu'un squelette est censé éviter.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block animate-pulse rounded-md bg-surface-raised', className)}
    />
  );
}

/** Squelette de tableau — même gabarit que `DataTable`, pour éviter le saut. */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn('h-4', columnIndex === 0 ? 'w-40' : 'w-24')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
