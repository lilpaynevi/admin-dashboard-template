import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { EmptyState, Spinner } from '@/components/ui';
import type { UserRole } from '@/features/users/users.types';
import { useAuth } from '@/providers/AuthProvider';

export type ProtectedRouteProps = {
  /** Omis = toute personne connectée. Sinon, rôles autorisés. */
  roles?: UserRole[];
};

/**
 * Garde de route.
 *
 * ⚠️ C'est une garde d'**interface**, pas de sécurité. Le code de la page est
 * déjà dans le navigateur ; seul le serveur peut refuser les données. Cette
 * garde sert à ne pas afficher un écran qui échouerait de toute façon.
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  // Tant que le jeton n'est pas revalidé, on n'a le droit ni de laisser
  // passer, ni de renvoyer vers la connexion : on attend.
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-6 text-primary" label="Vérification de la session…" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        // L'adresse demandée est mémorisée pour y revenir après connexion.
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  if (roles && user && !roles.includes(user.role)) {
    // 403 plutôt qu'une redirection silencieuse : renvoyer vers l'accueil
    // laisserait croire que le lien est cassé.
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          title="Accès refusé"
          description="Votre rôle ne permet pas d'ouvrir cette page. Contactez un administrateur si vous pensez qu'il s'agit d'une erreur."
        />
      </div>
    );
  }

  return <Outlet />;
}
