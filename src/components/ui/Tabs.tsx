import { useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type TabItem<T extends string = string> = {
  id: T;
  label: string;
  icon?: ReactNode;
  /** Compteur affiché à droite du libellé (« 12 en attente »). */
  count?: number;
  disabled?: boolean;
};

export type TabsProps<T extends string = string> = {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
};

export function Tabs<T extends string = string>({
  tabs,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  /**
   * Navigation aux flèches, comme l'attend le motif ARIA « tabs ».
   *
   * Combinée au `tabIndex` mobile plus bas : une seule tabulation entre dans
   * le groupe, les flèches circulent dedans. Sans ça, un formulaire à six
   * onglets impose six tabulations avant d'atteindre le contenu.
   */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const enabled = tabs.filter((tab) => !tab.disabled);
    const currentIndex = enabled.findIndex((tab) => tab.id === value);

    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : event.key === 'ArrowRight'
            ? (currentIndex + 1) % enabled.length
            : (currentIndex - 1 + enabled.length) % enabled.length;

    const next = enabled[nextIndex];
    if (!next) return;

    onChange(next.id);
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-tab-id="${next.id}"]`)
      ?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn('flex gap-1 overflow-x-auto border-b border-border', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === value;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab-id={tab.id}
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            // Seul l'onglet actif est atteignable à la tabulation.
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors',
              'disabled:pointer-events-none disabled:opacity-50',
              isActive
                ? 'text-primary'
                : 'text-muted hover:text-foreground',
            )}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs',
                  isActive ? 'bg-primary-soft text-primary' : 'bg-surface-raised text-muted',
                )}
              >
                {tab.count}
              </span>
            )}

            {/* Le trait actif est un élément à part, posé sur la bordure du
                conteneur : une `border-b` sur le bouton décalerait son texte
                d'un pixel à chaque changement d'onglet. */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div id={`${id}-panel`} role="tabpanel" tabIndex={0} className={className}>
      {children}
    </div>
  );
}
