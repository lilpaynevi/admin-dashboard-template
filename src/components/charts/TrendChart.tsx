import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartTheme } from '@/design-system/tokens';

import { ChartTooltip } from './ChartTooltip';

export type TrendSeries = {
  /** Clé du champ dans les données. */
  dataKey: string;
  label: string;
};

export type TrendChartProps = {
  data: Array<Record<string, string | number>>;
  /**
   * Deux séries maximum en aires superposées — au-delà, elles se masquent les
   * unes les autres. Toutes doivent partager la **même unité** : un axe
   * unique est la règle, deux échelles verticales sur un même graphique
   * laissent lire n'importe quelle corrélation dans n'importe quel jeu de
   * données.
   */
  series: TrendSeries[];
  xKey: string;
  formatValue?: (value: number) => string;
  formatAxisValue?: (value: number) => string;
  formatAxisLabel?: (value: string) => string;
  formatTooltipLabel?: (value: string) => string;
};

export function TrendChart({
  data,
  series,
  xKey,
  formatValue,
  formatAxisValue,
  formatAxisLabel,
  formatTooltipLabel,
}: TrendChartProps) {
  const theme = useChartTheme();

  return (
    <div className="flex h-full flex-col">
      {/* Légende dessinée à la main plutôt que celle de Recharts : elle hérite
          ainsi des jetons de texte, et la pastille seule porte la couleur. */}
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap items-center gap-4 px-3">
          {series.map((entry, index) => (
            <li key={entry.dataKey} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: theme.series[index % theme.series.length] }}
                aria-hidden="true"
              />
              {entry.label}
            </li>
          ))}
        </ul>
      )}

      {/* `min-h-0` est indispensable : sans lui, cet enfant flex refuse de
          rétrécir sous sa taille de contenu et `ResponsiveContainer` mesure
          une hauteur qui déborde de la carte. */}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <defs>
              {series.map((entry, index) => {
                const color = theme.series[index % theme.series.length];
                return (
                  <linearGradient
                    key={entry.dataKey}
                    id={`trend-${entry.dataKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    {/* Un aplat opaque masquerait la série du dessous ; le
                        dégradé garde le trait lisible et l'aire suggestive. */}
                    <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Quadrillage horizontal seul : les verticales n'aident à rien
                sur une série temporelle et encombrent le tracé. */}
            <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray="3 3" />

            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.tick, fontSize: 11 }}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={formatAxisLabel}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.tick, fontSize: 11 }}
              tickMargin={8}
              width={56}
              tickFormatter={formatAxisValue}
            />

            <Tooltip
              cursor={{ stroke: theme.tick, strokeWidth: 1, strokeDasharray: '3 3' }}
              content={
                <ChartTooltip formatValue={formatValue} formatLabel={formatTooltipLabel} />
              }
            />

            {series.map((entry, index) => {
              const color = theme.series[index % theme.series.length];
              return (
                <Area
                  key={entry.dataKey}
                  type="monotone"
                  dataKey={entry.dataKey}
                  name={entry.label}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#trend-${entry.dataKey})`}
                  // Pas de point sur chaque valeur : à 90 jours, la courbe
                  // devient un chapelet illisible. Le point n'apparaît qu'au
                  // survol, cerclé de la surface pour se détacher du tracé.
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: theme.surface }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
