import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { UsersPage } from '@/features/users/UsersPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { ProtectedRoute } from './ProtectedRoute';

/**
 * Arborescence des routes.
 *
 * `ProtectedRoute` est un *layout* sans chemin : tout ce qui est imbriqué
 * dessous hérite de la garde. C'est ce qui évite d'oublier de protéger un
 * écran ajouté plus tard — l'oubli devient impossible par construction, alors
 * qu'une garde recopiée dans chaque route finit toujours par en manquer une.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'users', element: <UsersPage /> },
          {
            // Deuxième garde imbriquée : connecté **et** administrateur.
            element: <ProtectedRoute roles={['admin']} />,
            children: [{ path: 'settings', element: <SettingsPage /> }],
          },
          // Le « catch-all » est dans le layout : une adresse inconnue garde
          // le menu, donc un moyen de repartir.
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
