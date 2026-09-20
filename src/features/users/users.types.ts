export type UserRole = 'admin' | 'manager' | 'viewer';
export type UserStatus = 'active' | 'invited' | 'suspended';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** ISO 8601 — jamais un `Date`, pour que le cache React Query soit sérialisable. */
  createdAt: string;
  lastSeenAt: string | null;
  avatarUrl: string | null;
};

/** Champs modifiables depuis le formulaire. L'`id` et les dates viennent du serveur. */
export type UserInput = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

/**
 * Tri demandé au serveur. `columnId` reprend l'`id` de la colonne du tableau.
 *
 * Le tri est serveur et non client : sur une liste paginée, classer les 25
 * lignes reçues donnerait le « plus ancien compte de la page », pas celui de
 * la base.
 */
export type UserSort = { columnId: string; direction: 'asc' | 'desc' } | null;

export type UserListParams = {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
  sort: UserSort;
  page: number;
  pageSize: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Libellés affichés — centralisés pour ne pas traduire deux fois la même clé. */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  viewer: 'Lecture seule',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Actif',
  invited: 'Invité',
  suspended: 'Suspendu',
};
