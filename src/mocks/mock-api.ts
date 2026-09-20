import type { Credentials, Session } from '@/features/auth/auth.types';
import type {
  ActivityItem,
  DashboardData,
  RangeKey,
} from '@/features/dashboard/dashboard.types';
import {
  ROLE_LABELS,
  STATUS_LABELS,
  type Paginated,
  type User,
  type UserInput,
  type UserListParams,
  type UserSort,
} from '@/features/users/users.types';
import { ApiError } from '@/lib/api';
import {
  createActivity,
  createChannels,
  createMetrics,
  createTrend,
  setUsers,
  users,
} from '@/mocks/db';

/**
 * Backend simulé.
 *
 * Il existe pour une raison précise : un template qui exige une API en marche
 * pour afficher son premier écran ne sert à rien en début de mission. Chaque
 * fonction ici a la même signature que son équivalent réseau, donc basculer
 * sur le vrai backend ne change qu'une ligne dans les fichiers `*.api.ts`.
 *
 * La latence est volontaire : à 0 ms, les états de chargement ne sont jamais
 * testés et on découvre en production que les squelettes ne s'affichent pas.
 */
const LATENCY_MS = 450;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Identifiants du compte de démonstration — rappelés sur l'écran de connexion. */
export const DEMO_CREDENTIALS: Credentials = {
  email: 'admin@exemple.fr',
  password: 'demo1234',
};

export const mockApi = {
  auth: {
    async login({ email, password }: Credentials): Promise<Session> {
      await delay(null, 700);

      const matches =
        email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
        password === DEMO_CREDENTIALS.password;

      if (!matches) {
        throw new ApiError('Identifiants incorrects.', 401);
      }

      return {
        token: `demo.${btoa(email)}.${Date.now()}`,
        user: {
          id: 'usr_000',
          name: 'Admin Démo',
          email: DEMO_CREDENTIALS.email,
          role: 'admin',
          avatarUrl: null,
        },
      };
    },

    async me(token: string): Promise<Session['user']> {
      await delay(null, 200);
      if (!token.startsWith('demo.')) {
        throw new ApiError('Session expirée, reconnectez-vous.', 401);
      }
      return {
        id: 'usr_000',
        name: 'Admin Démo',
        email: DEMO_CREDENTIALS.email,
        role: 'admin',
        avatarUrl: null,
      };
    },
  },

  users: {
    async list(params: UserListParams): Promise<Paginated<User>> {
      const needle = params.search.trim().toLowerCase();

      const filtered = users.filter((user) => {
        if (params.role !== 'all' && user.role !== params.role) return false;
        if (params.status !== 'all' && user.status !== params.status) return false;
        if (!needle) return true;
        return (
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle)
        );
      });

      // Le tri porte sur l'ensemble filtré, avant le découpage en pages —
      // c'est toute la raison d'être d'un tri serveur.
      const sorted = params.sort ? sortUsers(filtered, params.sort) : filtered;
      const start = (params.page - 1) * params.pageSize;

      return delay({
        items: sorted.slice(start, start + params.pageSize),
        total: sorted.length,
        page: params.page,
        pageSize: params.pageSize,
      });
    },

    async create(input: UserInput): Promise<User> {
      await delay(null);

      if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
        // 409 plutôt que 400 : le formulaire s'en sert pour viser le champ
        // « e-mail » au lieu d'afficher une erreur générale.
        throw new ApiError('Cette adresse e-mail est déjà utilisée.', 409, {
          email: 'Cette adresse e-mail est déjà utilisée.',
        });
      }

      const created: User = {
        ...input,
        id: `usr_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        lastSeenAt: null,
        avatarUrl: null,
      };

      setUsers([created, ...users]);
      return created;
    },

    async update(id: string, input: UserInput): Promise<User> {
      await delay(null);

      const current = users.find((user) => user.id === id);
      if (!current) throw new ApiError('Utilisateur introuvable.', 404);

      const updated: User = { ...current, ...input };
      setUsers(users.map((user) => (user.id === id ? updated : user)));
      return updated;
    },

    async remove(id: string): Promise<void> {
      await delay(null);
      if (!users.some((user) => user.id === id)) {
        throw new ApiError('Utilisateur introuvable.', 404);
      }
      setUsers(users.filter((user) => user.id !== id));
    },
  },

  dashboard: {
    async metrics(range: RangeKey): Promise<DashboardData> {
      return delay({
        metrics: createMetrics(range),
        trend: createTrend(range),
        channels: createChannels(),
      });
    },

    async activity(): Promise<ActivityItem[]> {
      return delay(createActivity());
    },
  },
};

/**
 * Valeur de comparaison par colonne.
 *
 * Les dates sont converties en nombre : comparer les chaînes ISO marcherait
 * ici par chance, mais `null` (« jamais connecté ») doit rester traité à part.
 * Les énumérations se trient sur leur libellé affiché, sinon le classement ne
 * correspond pas à ce que l'utilisateur lit à l'écran.
 */
const USER_SORT_VALUES: Record<string, (user: User) => string | number | null> = {
  name: (user) => user.name,
  email: (user) => user.email,
  role: (user) => ROLE_LABELS[user.role],
  status: (user) => STATUS_LABELS[user.status],
  createdAt: (user) => Date.parse(user.createdAt),
  lastSeenAt: (user) => (user.lastSeenAt ? Date.parse(user.lastSeenAt) : null),
};

function sortUsers(list: User[], sort: NonNullable<UserSort>): User[] {
  const read = USER_SORT_VALUES[sort.columnId];
  // Colonne inconnue : on renvoie l'ordre naturel plutôt que de lancer une
  // erreur. Un `id` mal orthographié ne doit pas casser l'écran entier.
  if (!read) return list;

  return [...list].sort((a, b) => {
    const left = read(a);
    const right = read(b);

    // Les valeurs absentes finissent en bas dans les deux sens de tri.
    if (left === null) return 1;
    if (right === null) return -1;

    const comparison =
      typeof left === 'string' && typeof right === 'string'
        ? left.localeCompare(right, 'fr', { sensitivity: 'base' })
        : Number(left) - Number(right);

    return sort.direction === 'asc' ? comparison : -comparison;
  });
}
