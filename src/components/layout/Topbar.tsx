import { Bell, ChevronDown, LogOut, Menu, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from '@/components/ui';
import { ROLE_LABELS } from '@/features/users/users.types';
import { useAuth } from '@/providers/AuthProvider';

import { ThemeToggle } from './ThemeToggle';

export type TopbarProps = {
  onOpenMobileMenu: () => void;
};

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    // `replace` : le bouton « précédent » ne doit pas ramener sur un écran
    // d'administration auquel l'utilisateur n'a plus accès.
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 flex h-topbar shrink-0 items-center gap-2 border-b border-border bg-surface/80 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="Ouvrir le menu"
        className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-raised hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* Recherche globale : masquée sur mobile, où elle mangerait toute la
          barre. À brancher sur une palette de commandes si le projet en a une. */}
      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Rechercher…"
          aria-label="Recherche globale"
          className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-subtle"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          <Bell className="size-[18px]" aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-surface" />
        </button>

        <ThemeToggle />

        <Dropdown
          trigger={({ isOpen }) => (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-raised"
            >
              <Avatar name={user?.name ?? '?'} src={user?.avatarUrl} size="sm" />
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {user?.name}
              </span>
              <ChevronDown
                className={`size-4 text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        >
          <DropdownLabel>
            {user?.email}
            {user && (
              <span className="mt-0.5 block text-[11px] font-normal">
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </DropdownLabel>
          <DropdownSeparator />
          <DropdownItem icon={<User className="size-4" />} onClick={() => navigate('/settings')}>
            Mon profil
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem tone="danger" icon={<LogOut className="size-4" />} onClick={onLogout}>
            Se déconnecter
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
