import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreditCard, Percent, ShoppingCart, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { ChartCard } from '@/components/charts/ChartCard';
import { TrendChart } from '@/components/charts/TrendChart';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatCompactCurrency, formatCurrency, formatNumber } from '@/lib/format';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/providers/AuthProvider';

import { ActivityFeed } from './ActivityFeed';
import { StatCard } from './StatCard';
import { dashboardApi } from './dashboard.api';
import { RANGE_LABELS, type Metric, type RangeKey } from './dashboard.types';

const RANGES = Object.keys(RANGE_LABELS) as RangeKey[];
const SHORT_RANGE_LABELS: Record<RangeKey, string> = {
  '7d': '7 j',
  '30d': '30 j',
  '90d': '90 j',
};

/** Icône par indicateur — purement décorative, le libellé porte le sens. */
const METRIC_ICONS = [CreditCard, ShoppingCart, UserPlus, Percent];

export function DashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeKey>('30d');

  const metrics = useQuery({
    queryKey: queryKeys.dashboard.metrics(range),
    queryFn: () => dashboardApi.metrics(range),
  });

  const activity = useQuery({
    queryKey: queryKeys.dashboard.activity(),
    queryFn: () => dashboardApi.activity(),
  });

  const metricCards: Array<Metric | undefined> = metrics.data?.metrics ?? [
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  return (
    <>
      <PageHeader
        title={`Bonjour ${user?.name?.split(' ')[0] ?? ''}`.trim()}
        description="Vue d'ensemble de l'activité."
        actions={
          <div
            role="group"
            aria-label="Période"
            className="flex rounded-lg border border-border bg-surface p-0.5"
          >
            {RANGES.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                // `aria-pressed` : un bouton de filtre actif doit s'annoncer
                // comme tel. La couleur seule ne le dit qu'aux voyants.
                aria-pressed={range === key}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  range === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {SHORT_RANGE_LABELS[key]}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Le tableau est annoté `Array<Metric | undefined>` : sans ça, le
            `??` produit une union de deux types de tableaux, sur laquelle
            TypeScript refuse d'appeler `.map`. Les quatre cases vides
            réservent la place des cartes pendant le chargement. */}
        {metricCards.map((metric, index) => (
          <StatCard
            key={metric?.key ?? index}
            metric={metric}
            icon={METRIC_ICONS[index]}
            isLoading={metrics.isLoading}
            comparisonLabel={`vs ${RANGE_LABELS[range].toLowerCase()}`}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Chiffre d'affaires et dépenses"
          description="Les deux séries partagent le même axe : elles sont dans la même unité."
          isLoading={metrics.isLoading}
          height={320}
          className="xl:col-span-2"
        >
          <TrendChart
            data={metrics.data?.trend ?? []}
            xKey="date"
            series={[
              { dataKey: 'revenue', label: "Chiffre d'affaires" },
              { dataKey: 'expenses', label: 'Dépenses' },
            ]}
            formatValue={formatCurrency}
            formatAxisValue={formatCompactCurrency}
            formatAxisLabel={(value) => format(parseISO(value), 'd MMM', { locale: fr })}
            formatTooltipLabel={(value) =>
              format(parseISO(value), 'EEEE d MMMM', { locale: fr })
            }
          />
        </ChartCard>

        <ChartCard
          title="Acquisition par canal"
          description="Sur la période sélectionnée."
          isLoading={metrics.isLoading}
          height={320}
        >
          <CategoryBarChart
            data={metrics.data?.channels ?? []}
            categoryKey="channel"
            valueKey="value"
            valueLabel="Visiteurs"
            formatValue={formatNumber}
            formatAxisValue={formatNumber}
          />
        </ChartCard>
      </div>

      <Card className="mt-4">
        <CardHeader title="Activité récente" description="Les dernières actions de l'équipe." />
        <ActivityFeed items={activity.data} isLoading={activity.isLoading} />
      </Card>
    </>
  );
}
