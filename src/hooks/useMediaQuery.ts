import { useSyncExternalStore } from 'react';

/**
 * Suit une media query CSS depuis React.
 *
 * `useSyncExternalStore` plutôt qu'un `useEffect` + `useState` : il lit la
 * valeur pendant le rendu, donc jamais d'image intermédiaire où le composant
 * croit être sur mobile avant que l'effet ne corrige. Sur une barre latérale,
 * cette image se voit.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    // Valeur côté serveur / pré-rendu : on suppose le bureau, cas majoritaire
    // d'un back-office.
    () => false,
  );
}

/** Points de rupture alignés sur ceux de Tailwind. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
