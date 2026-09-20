import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Concatène des classes Tailwind en laissant la dernière gagner.
 *
 * `clsx` seul produirait `px-3 px-6` : les deux règles ont la même
 * spécificité, et c'est l'ordre dans la feuille de style — pas celui de la
 * chaîne — qui tranche. Résultat : un `className` passé en prop ne remplace
 * pas toujours celui du composant. `twMerge` supprime la classe dominée.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
