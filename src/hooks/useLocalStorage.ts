import { useCallback, useEffect, useState } from 'react';

/**
 * `useState` qui survit au rechargement.
 *
 * Toutes les lectures et écritures sont protégées : en navigation privée,
 * `localStorage` ne lance pas seulement à l'écriture, y accéder peut déjà
 * jeter. Un back-office qui refuse de s'afficher parce qu'un onglet est privé
 * serait un bug difficile à reproduire.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => read(key, initialValue));

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved =
          typeof next === 'function' ? (next as (current: T) => T)(current) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* Quota plein ou stockage bloqué : la valeur reste en mémoire. */
        }
        return resolved;
      });
    },
    [key],
  );

  /**
   * Synchronise les onglets ouverts sur la même application. `storage` n'est
   * émis que dans les *autres* onglets, donc pas de boucle avec `update`.
   */
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) return;
      try {
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        /* Valeur écrite par une autre version de l'application : on l'ignore. */
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, update] as const;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
