import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDelta, formatNumber, formatPercent } from '@/lib/format';

import type { Metric } from './dashboard.types';

export type StatCardProps = {
  metric?: Metric;
  icon?: LucideIcon;
  isLoading?: boolean;
  /** Période couverte, rappelée sous la variation (« vs 30 jours précédents »). */
  comparisonLabel?: string;
};

function formatMetric(metric: Metric): string {
  switch (metric.format) {
    case 'currency':
      return formatCurrency(metric.value);
    case 'percent':
      return formatPercent(metric.value);
    default:
      return formatNumber(metric.value);
  }
}

export function StatCard({ metric, icon: Icon, isLoading, comparisonLabel }: StatCardProps) {
  if (isLoading || !metric) {
    return (
      <Card className="p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-32" />
        <Skeleton className="mt-3 h-3 w-40" />
      </Card>
    );
  }

  const isImprovement = metric.delta >= 0 === metric.higherIsBetter;
  const DeltaIcon = metric.delta >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted">{metric.label}</p>
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-subtle">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Chiffres proportionnels (pas de `tabular-nums`) : rien n'est aligné
          verticalement ici, et les chiffres tabulaires y sont moins lisibles. */}
      <p className="mt-2 text-2xl font-semibold text-foreground">{formatMetric(metric)}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
        {/*
          Trois signaux portent la variation : la flèche, le signe et la
          couleur. La couleur seule exclurait un lecteur daltonien — et une
          hausse n'est pas toujours une bonne nouvelle, d'où `higherIsBetter`
          plutôt qu'un simple test sur le signe.
        */}
        <span
          className={cn(
            'inline-flex items-center gap-0.5 font-medium',
            isImprovement ? 'text-success' : 'text-danger',
          )}
        >
          <DeltaIcon className="size-3.5" aria-hidden="true" />
          {formatDelta(metric.delta)}
        </span>
        {comparisonLabel && <span className="text-subtle">{comparisonLabel}</span>}
      </div>
    </Card>
  );
}
