import type { UserListParams } from '@/features/users/users.types';

/**
 * Toutes les clés de cache au même endroit.
 *
 * Écrites à la main dans les composants, elles finissent désynchronisées :
 * `['users']` ici, `['user-list']` là, et une invalidation après création ne
 * rafraîchit plus rien. La hiérarchie compte aussi — invalider `users.all()`
 * atteint la liste *et* chaque détail, parce que React Query compare les clés
 * par préfixe.
 */
export const queryKeys = {
  users: {
    all: () => ['users'] as const,
    list: (params: UserListParams) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  dashboard: {
    all: () => ['dashboard'] as const,
    metrics: (range: string) => ['dashboard', 'metrics', range] as const,
    activity: () => ['dashboard', 'activity'] as const,
  },
  auth: {
    me: () => ['auth', 'me'] as const,
  },
} as const;
