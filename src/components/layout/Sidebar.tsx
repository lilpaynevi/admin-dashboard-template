import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Tooltip } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAuth } from '@/providers/AuthProvider';

import { visibleSections } from './navigation';

export type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Ouverture en tiroir, sous le point de rupture `lg`. */
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user } = useAuth();
  const sections = visibleSections(user?.role);

  return (
    <>
      {/* Voile mobile. Il n'existe qu'ouvert : rendu en permanence avec une
          opacité nulle, il intercepterait les clics sur toute la page. */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-overlay/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface transition-[width,transform] duration-200',
          isCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
          // Hors bureau, la barre est un tiroir : hors écran par défaut, elle
          // glisse par-dessus le contenu au lieu de le comprimer.
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-topbar shrink-0 items-center gap-2 border-b border-border px-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            A
          </span>
          {!isCollapsed && (
            <span className="truncate text-sm font-semibold text-foreground">
              Administration
            </span>
          )}

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fermer le menu"
            className="ml-auto rounded-lg p-1.5 text-subtle hover:bg-surface-raised hover:text-foreground lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4" aria-label="Menu principal">
          {sections.map((section, index) => (
            <div key={section.title ?? index}>
              {section.title && !isCollapsed && (
                <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                  {section.title}
                </p>
              )}

              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const link = (
                    <NavLink
                      to={item.to}
                      // `end` sur la racine seulement : sans lui, « / » resterait
                      // actif sur toutes les pages, puisque toutes commencent par
                      // un slash.
                      end={item.to === '/'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                          isCollapsed && 'justify-center px-0',
                          isActive
                            ? 'bg-primary-soft text-primary'
                            : 'text-muted hover:bg-surface-raised hover:text-foreground',
                        )
                      }
                    >
                      <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );

                  return (
                    <li key={item.to}>
                      {/* Repliée, la barre n'affiche que des icônes : sans
                          bulle, plus rien n'est identifiable. */}
                      {isCollapsed ? (
                        <Tooltip content={item.label} side="bottom" className="w-full">
                          {link}
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="hidden shrink-0 border-t border-border p-2 lg:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-raised hover:text-foreground',
              isCollapsed && 'justify-center px-0',
            )}
            aria-label={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-[18px]" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="size-[18px]" aria-hidden="true" />
                Replier
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
