import { LogIn, Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react';

import { EmptyState, Skeleton } from '@/components/ui';
import { formatRelative } from '@/lib/format';

import type { ActivityItem, ActivityKind } from './dashboard.types';

const KIND_STYLES: Record<ActivityKind, { icon: LucideIcon; className: string }> = {
  create: { icon: Plus, className: 'bg-success-soft text-success' },
  update: { icon: Pencil, className: 'bg-info-soft text-info' },
  delete: { icon: Trash2, className: 'bg-danger-soft text-danger' },
  login: { icon: LogIn, className: 'bg-surface-raised text-muted' },
};

export type ActivityFeedProps = {
  items?: ActivityItem[];
  isLoading?: boolean;
};

export function ActivityFeed({ items, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <ul className="divide-y divide-border">
        {Array.from({ length: 5 }, (_, index) => (
          <li key={index} className="flex items-center gap-3 px-5 py-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!items?.length) {
    return <EmptyState title="Aucune activité" description="Rien ne s'est passé récemment." />;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const { icon: Icon, className } = KIND_STYLES[item.kind];

        return (
          <li key={item.id} className="flex items-start gap-3 px-5 py-3">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${className}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.actor}</span> {item.action}{' '}
                <span className="text-muted">{item.target}</span>
              </p>
              {/* `<time>` porte la date exacte : « il y a 3 heures » est
                  agréable à lire mais inexploitable pour qui veut la vraie
                  heure — ou pour un lecteur d'écran. */}
              <time dateTime={item.at} className="text-xs text-subtle">
                {formatRelative(item.at)}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
