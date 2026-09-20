import { useEffect, useState } from 'react';

/**
 * Retarde la propagation d'une valeur qui change vite.
 *
 * Cas typique : un champ de recherche relié à une requête. Sans ce délai,
 * taper « dupont » déclenche six requêtes dont cinq sont déjà obsolètes en
 * arrivant — et elles peuvent revenir dans le désordre.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    // Le nettoyage est ce qui fait tout le travail : chaque frappe annule le
    // minuteur précédent, donc seule la dernière pause dépasse le délai.
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
