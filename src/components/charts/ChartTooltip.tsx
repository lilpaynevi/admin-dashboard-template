import type { TooltipProps } from 'recharts';

export type ChartTooltipProps = TooltipProps<number, string> & {
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
};

/**
 * Bulle de survol commune à tous les graphiques.
 *
 * Celle de Recharts est stylée en `inline` et ignore le thème : sur fond
 * sombre, elle reste blanche avec du texte noir. La redéfinir ici évite de
 * répéter six réglages dans chaque graphique.
 *
 * Le texte porte les couleurs d'encre du design system ; seule la pastille
 * porte la couleur de la série. Écrire une valeur dans la couleur de sa
 * courbe la rend illisible dès que la teinte est claire.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
  formatLabel,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-36 rounded-lg border border-border bg-surface p-2.5 shadow-popover">
      {label !== undefined && (
        <p className="mb-1.5 text-xs font-medium text-muted">
          {formatLabel ? formatLabel(String(label)) : String(label)}
        </p>
      )}

      <ul className="space-y-1">
        {payload.map((item, index) => (
          <li
            key={`${item.dataKey ?? index}`}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.name}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {typeof item.value === 'number' && formatValue
                ? formatValue(item.value)
                : String(item.value ?? '—')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
