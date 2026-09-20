import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { UserRole } from '@/features/users/users.types';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Omis = visible par tous. Sinon, réservé aux rôles listés. */
  roles?: UserRole[];
  /** Pastille de comptage (demandes en attente, messages non lus…). */
  badge?: number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

/**
 * Arborescence du menu — le seul endroit à modifier pour ajouter un écran.
 *
 * Les entrées sans route correspondante existent volontairement : elles
 * montrent le rendu d'un menu réaliste et servent de points d'accroche. Les
 * supprimer ou leur brancher une page est la première chose à faire en
 * démarrant un projet.
 */
export const navigation: NavSection[] = [
  {
    items: [
      { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
      { to: '/users', label: 'Utilisateurs', icon: Users },
    ],
  },
  {
    title: 'Activité',
    items: [
      { to: '/orders', label: 'Commandes', icon: ShoppingCart, badge: 4 },
      { to: '/invoices', label: 'Factures', icon: FileText },
      { to: '/reports', label: 'Rapports', icon: BarChart3, roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Configuration',
    items: [{ to: '/settings', label: 'Paramètres', icon: Settings, roles: ['admin'] }],
  },
];

/**
 * Filtre le menu selon le rôle.
 *
 * Masquer une entrée n'est **pas** une sécurité : la route reste accessible
 * en tapant l'URL, et l'API doit vérifier les droits de son côté. C'est du
 * confort — ne pas proposer une porte qui se refermera au nez de l'utilisateur.
 */
export function visibleSections(role: UserRole | undefined): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || (role !== undefined && item.roles.includes(role)),
      ),
    }))
    .filter((section) => section.items.length > 0);
}
