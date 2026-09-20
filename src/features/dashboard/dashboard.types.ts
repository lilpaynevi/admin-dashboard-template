export type RangeKey = '7d' | '30d' | '90d';

export const RANGE_LABELS: Record<RangeKey, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
};

export type MetricFormat = 'currency' | 'number' | 'percent';

export type Metric = {
  key: string;
  label: string;
  value: number;
  /** Variation sur la période précédente, en ratio : `0.128` = +12,8 %. */
  delta: number;
  format: MetricFormat;
  /** Une hausse n'est pas toujours une bonne nouvelle (taux de rebond, coûts). */
  higherIsBetter: boolean;
};

/** Un point de la courbe. Les deux séries sont en euros : un seul axe suffit. */
export type TrendPoint = {
  /** ISO 8601, tronqué au jour. */
  date: string;
  revenue: number;
  expenses: number;
};

export type ChannelPoint = {
  channel: string;
  value: number;
};

export type ActivityKind = 'create' | 'update' | 'delete' | 'login';

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  kind: ActivityKind;
};

export type DashboardData = {
  metrics: Metric[];
  trend: TrendPoint[];
  channels: ChannelPoint[];
};
