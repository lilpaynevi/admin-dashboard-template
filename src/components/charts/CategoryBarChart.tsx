import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useChartTheme } from '@/design-system/tokens';

import { ChartTooltip } from './ChartTooltip';

export type CategoryBarChartProps = {
  data: Array<Record<string, string | number>>;
  /** Champ portant le libellé de catégorie. */
  categoryKey: string;
  valueKey: string;
  valueLabel: string;
  formatValue?: (value: number) => string;
  formatAxisValue?: (value: number) => string;
};

/**
 * Histogramme de catégories, barres **horizontales**.
 *
 * Horizontal et non vertical : un libellé de catégorie est du texte, souvent
 * long (« Recherche organique »). En vertical, il faut l'incliner à 45° ou le
 * tronquer ; à l'horizontale il se lit normalement, et la comparaison des
 * longueurs reste immédiate.
 *
 * Une seule série : pas de légende, le titre de la carte la nomme déjà.
 */
export function CategoryBarChart({
  data,
  categoryKey,
  valueKey,
  valueLabel,
  formatValue,
  formatAxisValue,
}: CategoryBarChartProps) {
  const theme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid horizontal={false} stroke={theme.grid} strokeDasharray="3 3" />

        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fill: theme.tick, fontSize: 11 }}
          tickFormatter={formatAxisValue}
        />
        <YAxis
          type="category"
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          tick={{ fill: theme.tick, fontSize: 11 }}
          // Largeur fixe : calculée automatiquement, elle change avec le plus
          // long libellé et fait sauter l'axe d'un rendu à l'autre.
          width={130}
        />

        <Tooltip
          // Le curseur est un voile discret sur la ligne survolée. Par défaut
          // Recharts pose un gris opaque qui recouvre la barre elle-même.
          cursor={{ fill: theme.surfaceRaised, opacity: 0.6 }}
          content={<ChartTooltip formatValue={formatValue} />}
        />

        <Bar
          dataKey={valueKey}
          name={valueLabel}
          fill={theme.series[0]}
          // Extrémité arrondie côté valeur seulement : la base reste plate,
          // ancrée sur le zéro. Arrondir les deux bouts fait flotter la barre
          // et fausse la lecture de son origine.
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
