import { useEffect, type RefObject } from 'react';

/**
 * Ferme un menu ou une bulle quand on clique ailleurs.
 *
 * L'écoute est sur `pointerdown` et non `click` : un `click` n'est émis
 * qu'au relâchement, après que l'élément visé a pu disparaître ou bouger.
 * Avec `pointerdown`, la fermeture suit le geste de l'utilisateur.
 *
 * `touchstart` complète la couverture des navigateurs mobiles anciens.
 */
export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: Event) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    function listener(event: Event) {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) return;
      handler(event);
    }

    document.addEventListener('pointerdown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('pointerdown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
