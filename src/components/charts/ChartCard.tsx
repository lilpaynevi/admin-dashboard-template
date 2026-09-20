import type { ReactNode } from 'react';

import { Card, CardHeader, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

export type ChartCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  isLoading?: boolean;
  /**
   * Hauteur du tracé, en pixels.
   *
   * Une valeur fixe et non un pourcentage : `ResponsiveContainer` mesure son
   * parent, et un parent en hauteur automatique mesure zéro — le graphique ne
   * s'affiche alors pas du tout. C'est le piège classique de Recharts.
   */
  height?: number;
  children: ReactNode;
  className?: string;
};

export function ChartCard({
  title,
  description,
  actions,
  isLoading = false,
  height = 280,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title={title} description={description} actions={actions} />

      <div className="p-2 pt-4" style={{ height }}>
        {isLoading ? (
          // Le squelette occupe exactement la même hauteur : sans ça, la carte
          // grandit d'un coup à l'arrivée des données et pousse tout le reste.
          <div className="flex h-full flex-col justify-end gap-2 p-3">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}
