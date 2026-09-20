import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { router } from '@/routes/router';

/**
 * Composition des fournisseurs — l'ordre n'est pas arbitraire.
 *
 * `ErrorBoundary` est le plus haut : il doit survivre à la panne de n'importe
 * lequel des autres. `ThemeProvider` vient ensuite, pour que même l'écran
 * d'erreur soit au bon thème. `AuthProvider` est sous `QueryProvider` et
 * `ToastProvider` parce qu'il s'en sert ; l'inverse lancerait un « doit être
 * appelé sous un provider » au premier rendu.
 */
export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ToastProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
