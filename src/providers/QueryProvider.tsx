import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { ApiError } from '@/lib/api';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * 30 s de fraîcheur : dans un back-office, on navigue en aller-retour
         * entre une liste et un détail. À 0, chaque retour relance la requête
         * et fait clignoter la page pour des données qui n'ont pas bougé.
         */
        staleTime: 30_000,
        gcTime: 5 * 60_000,

        /**
         * Ne pas réessayer une erreur métier : un 404 ou un 403 ne guérit pas
         * en insistant, ça ne fait que retarder le message d'erreur de
         * plusieurs secondes. Seules les pannes réseau et les 5xx méritent
         * une seconde chance.
         */
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status && error.status < 500) return false;
          return failureCount < 2;
        },

        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        // Une écriture n'est jamais rejouée automatiquement : on risquerait de
        // créer deux fois la même ressource.
        retry: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  /**
   * Le client est créé dans un état, pas au niveau du module.
   *
   * Au niveau du module, il serait partagé entre les tests et entre deux
   * montages successifs — le cache d'un utilisateur déconnecté fuiterait vers
   * le suivant.
   */
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
