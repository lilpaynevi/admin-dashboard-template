import type {
  ActivityItem,
  ChannelPoint,
  Metric,
  RangeKey,
  TrendPoint,
} from '@/features/dashboard/dashboard.types';
import type { User, UserRole, UserStatus } from '@/features/users/users.types';

/**
 * Générateur pseudo-aléatoire à graine (mulberry32).
 *
 * `Math.random()` redessinerait les courbes à chaque rechargement : impossible
 * de comparer deux captures d'écran, et un test visuel échouerait une fois sur
 * deux. Ici la même graine donne toujours le même jeu de données.
 */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Marie', 'Thomas', 'Awa', 'Lucas', 'Fatou', 'Camille', 'Nadia', 'Hugo',
  'Inès', 'Karim', 'Léa', 'Mehdi', 'Sarah', 'Yanis', 'Chloé', 'Oumar',
  'Julie', 'Antoine', 'Rania', 'Paul', 'Sofia', 'Noé', 'Élodie', 'Bilal',
];

const LAST_NAMES = [
  'Dupont', 'Traoré', 'Bernard', 'Nguyen', 'Diallo', 'Martin', 'Leroy',
  'Benali', 'Moreau', 'Kouassi', 'Petit', 'Faure', 'Sanchez', 'Roux',
  'Lambert', 'Cissé', 'Girard', 'Meunier',
];

const ROLES: UserRole[] = ['admin', 'manager', 'viewer'];
const STATUSES: UserStatus[] = ['active', 'active', 'active', 'invited', 'suspended'];

const DAY = 86_400_000;

/**
 * Base en mémoire.
 *
 * `let` et non `const` : `mock-api.ts` la réassigne aux créations et
 * suppressions, exactement comme le ferait un serveur. Tout est perdu au
 * rechargement — c'est voulu, un jeu de démonstration ne doit pas dériver.
 */
export let users: User[] = createUsers(48);

export function setUsers(next: User[]): void {
  users = next;
}

function createUsers(count: number): User[] {
  const random = seeded(20260919);
  const now = Date.now();

  const list: User[] = Array.from({ length: count }, (_, index) => {
    const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const status = STATUSES[Math.floor(random() * STATUSES.length)];

    return {
      id: `usr_${(index + 1).toString().padStart(3, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${index}@exemple.fr`
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, ''),
      role: ROLES[Math.floor(random() * ROLES.length)],
      status,
      createdAt: new Date(now - Math.floor(random() * 540) * DAY).toISOString(),
      // Un compte invité ne s'est, par définition, jamais connecté.
      lastSeenAt:
        status === 'invited' ? null : new Date(now - Math.floor(random() * 30) * DAY).toISOString(),
      avatarUrl: null,
    };
  });

  // Le compte de démonstration doit exister et rester en tête de liste.
  list.unshift({
    id: 'usr_000',
    name: 'Admin Démo',
    email: 'admin@exemple.fr',
    role: 'admin',
    status: 'active',
    createdAt: new Date(now - 720 * DAY).toISOString(),
    lastSeenAt: new Date(now - 2 * 3_600_000).toISOString(),
    avatarUrl: null,
  });

  return list;
}

const RANGE_DAYS: Record<RangeKey, number> = { '7d': 7, '30d': 30, '90d': 90 };

export function createTrend(range: RangeKey): TrendPoint[] {
  const days = RANGE_DAYS[range];
  const random = seeded(days * 977);
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index) * DAY);
    // Une légère tendance haussière plus du bruit : une courbe parfaitement
    // plate ou parfaitement lisse ne ressemble à aucune donnée réelle.
    const drift = 1 + index / (days * 3);
    const revenue = Math.round((5200 + random() * 2600) * drift);

    return {
      date: date.toISOString().slice(0, 10),
      revenue,
      expenses: Math.round(revenue * (0.52 + random() * 0.16)),
    };
  });
}

export function createMetrics(range: RangeKey): Metric[] {
  const trend = createTrend(range);
  const revenue = trend.reduce((total, point) => total + point.revenue, 0);
  const expenses = trend.reduce((total, point) => total + point.expenses, 0);
  const random = seeded(RANGE_DAYS[range] * 31);

  return [
    {
      key: 'revenue',
      label: "Chiffre d'affaires",
      value: revenue,
      delta: 0.06 + random() * 0.1,
      format: 'currency',
      higherIsBetter: true,
    },
    {
      key: 'orders',
      label: 'Commandes',
      value: Math.round(revenue / 86),
      delta: 0.02 + random() * 0.08,
      format: 'number',
      higherIsBetter: true,
    },
    {
      key: 'customers',
      label: 'Nouveaux clients',
      value: Math.round(revenue / 640),
      delta: -0.04 - random() * 0.05,
      format: 'number',
      higherIsBetter: true,
    },
    {
      key: 'margin',
      label: 'Marge brute',
      value: (revenue - expenses) / revenue,
      delta: 0.01 + random() * 0.03,
      format: 'percent',
      higherIsBetter: true,
    },
  ];
}

export function createChannels(): ChannelPoint[] {
  const random = seeded(4242);
  return [
    'Recherche organique',
    'Campagnes payantes',
    'Accès direct',
    'Parrainage',
    'Réseaux sociaux',
  ]
    .map((channel) => ({ channel, value: Math.round(900 + random() * 3400) }))
    // Un histogramme de catégories se lit trié : l'ordre alphabétique oblige
    // l'œil à comparer des barres éparpillées.
    .sort((a, b) => b.value - a.value);
}

export function createActivity(): ActivityItem[] {
  const now = Date.now();
  const entries: Array<Omit<ActivityItem, 'id' | 'at'> & { minutesAgo: number }> = [
    { actor: 'Marie Dupont', action: 'a créé', target: 'la facture #4821', kind: 'create', minutesAgo: 12 },
    { actor: 'Karim Benali', action: 'a modifié', target: 'le tarif « Pro »', kind: 'update', minutesAgo: 47 },
    { actor: 'Admin Démo', action: 'a supprimé', target: 'le compte de T. Roux', kind: 'delete', minutesAgo: 95 },
    { actor: 'Awa Traoré', action: 's’est connectée depuis', target: 'Abidjan', kind: 'login', minutesAgo: 180 },
    { actor: 'Hugo Martin', action: 'a créé', target: '3 nouveaux utilisateurs', kind: 'create', minutesAgo: 320 },
    { actor: 'Nadia Cissé', action: 'a modifié', target: 'les paramètres de facturation', kind: 'update', minutesAgo: 610 },
  ];

  return entries.map((entry, index) => ({
    id: `act_${index}`,
    actor: entry.actor,
    action: entry.action,
    target: entry.target,
    kind: entry.kind,
    at: new Date(now - entry.minutesAgo * 60_000).toISOString(),
  }));
}
