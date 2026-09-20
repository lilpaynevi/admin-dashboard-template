import { useTheme } from '@/providers/ThemeProvider';

/**
 * Les mêmes jetons que `src/styles/global.css`, en hexadécimal.
 *
 * Pourquoi ce doublon : Recharts — comme toute bibliothèque qui écrit dans du
 * SVG — pose les couleurs en **attributs de présentation** (`fill`, `stroke`),
 * et un attribut SVG ne résout pas `var(--x)`. Une courbe écrite en classe
 * Tailwind resterait donc noire. Ces constantes sont la seule façon de
 * thémer les graphiques.
 *
 * ⚠️ `global.css` fait foi. Toute modification doit être reportée ici.
 */
const light = {
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceRaised: '#f3f4f6',

  foreground: '#111827',
  muted: '#6b7280',
  subtle: '#9ca3af',

  border: '#e5e7eb',
  ring: '#4f46e5',

  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryForeground: '#ffffff',
  primarySoft: '#eef2ff',

  success: '#059669',
  successSoft: '#ecfdf5',
  warning: '#b45309',
  warningSoft: '#fffbeb',
  danger: '#dc2626',
  dangerHover: '#b91c1c',
  dangerSoft: '#fef2f2',
  info: '#2563eb',
  infoSoft: '#eff6ff',
} as const;

const dark: typeof light = {
  background: '#090d18',
  surface: '#111827',
  surfaceRaised: '#1f2937',

  foreground: '#f9fafb',
  muted: '#9ca3af',
  subtle: '#6b7280',

  border: '#273042',
  ring: '#818cf8',

  primary: '#6366f1',
  primaryHover: '#818cf8',
  primaryForeground: '#ffffff',
  primarySoft: '#1e1b4b',

  success: '#34d399',
  successSoft: '#062b22',
  warning: '#fbbf24',
  warningSoft: '#332005',
  danger: '#f87171',
  dangerHover: '#fca5a5',
  dangerSoft: '#3c0f0f',
  info: '#60a5fa',
  infoSoft: '#0e1e3e',
};

/**
 * Palette des séries de graphiques.
 *
 * **L'ordre est la mécanique d'accessibilité, pas un choix esthétique.** Il
 * est établi pour que deux séries voisines restent distinguables en vision
 * déficiente des couleurs (ΔE ≥ 8 en OKLab) sur les deux fonds. Réordonner ou
 * remplacer une teinte isolément casse cette garantie : si le client impose
 * ses couleurs, il faut revalider la suite entière.
 *
 * Trois séries au maximum sur un nuage de points ou une carte choroplèthe : au
 * delà, les paires non adjacentes se confondent. Sur une courbe ou un
 * histogramme, huit tiennent. Au-delà de huit, regrouper en « Autres » — une
 * neuvième teinte générée est toujours un mauvais choix.
 */
const lightSeries = [
  '#2a78d6', // bleu
  '#eb6834', // orange
  '#1baf7a', // turquoise
  '#eda100', // jaune
  '#e87ba4', // magenta
  '#008300', // vert
  '#4a3aa7', // violet
  '#e34948', // rouge
] as const;

/** Les mêmes huit teintes, re-échelonnées pour le fond sombre. */
const darkSeries = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
] as const;

export type Tokens = typeof light;
export type TokenName = keyof Tokens;

export const themes = { light, dark } as const;

export type ChartTheme = Tokens & {
  /** Couleurs de séries, dans l'ordre validé. */
  series: readonly string[];
  /** Quadrillage : volontairement effacé, il ne doit jamais concurrencer les données. */
  grid: string;
  /** Texte des graduations. */
  tick: string;
};

/** Jetons du thème courant, pour tout ce qui réclame une valeur et non une classe. */
export function useTokens(): Tokens {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? dark : light;
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  const base = resolvedTheme === 'dark' ? dark : light;

  return {
    ...base,
    series: resolvedTheme === 'dark' ? darkSeries : lightSeries,
    grid: base.border,
    tick: base.muted,
  };
}

/** Échelle d'espacement, en pixels — alignée sur celle de Tailwind (×4). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;
