import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const LOCALE = 'fr-FR';

/**
 * Les formateurs `Intl` sont coûteux à construire et parfaitement réutilisables.
 * Les recréer à chaque cellule d'un tableau de 50 lignes se voit au défilement.
 */
const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat(LOCALE);

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
});

/** Format monétaire complet : « 12 480 € ». */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Format court pour les axes de graphiques, où « 1 240 000 € » déborde. */
export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${decimalFormatter.format(value / 1_000_000)} M€`;
  if (Math.abs(value) >= 1_000) return `${decimalFormatter.format(value / 1_000)} k€`;
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return decimalFormatter.format(value);
}

/** `0.128` → « 12,8 % ». Attend un ratio, pas une valeur déjà multipliée. */
export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}

/** Variation signée : « +12,8 % ». Le signe porte l'information, pas la couleur seule. */
export function formatDelta(ratio: number): string {
  const sign = ratio > 0 ? '+' : '';
  return `${sign}${percentFormatter.format(ratio)}`;
}

function toDate(value: string | number | Date): Date | null {
  const date = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(date) ? date : null;
}

/** « 14 mars 2026 ». Renvoie un tiret cadratin si la date est illisible. */
export function formatDate(value: string | number | Date): string {
  const date = toDate(value);
  return date ? format(date, 'd MMMM yyyy', { locale: fr }) : '—';
}

/** « 14/03/2026 14:05 » — pour les colonnes de tableau, où la place manque. */
export function formatDateTime(value: string | number | Date): string {
  const date = toDate(value);
  return date ? format(date, 'dd/MM/yyyy HH:mm', { locale: fr }) : '—';
}

/** « il y a 3 jours ». */
export function formatRelative(value: string | number | Date): string {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true, locale: fr }) : '—';
}

/** Initiales pour les avatars sans photo : « Marie Dupont » → « MD ». */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
