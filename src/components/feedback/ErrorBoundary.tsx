import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui';
import { IS_DEV } from '@/lib/env';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  error: Error | null;
};

/**
 * Dernier filet de sécurité.
 *
 * Une exception non rattrapée pendant le rendu démonte **tout** l'arbre React :
 * l'utilisateur se retrouve devant une page blanche, sans message ni moyen de
 * revenir. Ce composant intercepte l'erreur et garde une sortie à l'écran.
 *
 * Il reste une classe : React n'expose toujours pas `componentDidCatch` aux
 * composants de fonction.
 *
 * ⚠️ Il ne rattrape pas les erreurs asynchrones (promesses, gestionnaires
 * d'événements). C'est le rôle de `onError` des mutations React Query.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Point de branchement du rapporteur d'erreurs (Sentry, etc.).
    console.error('Erreur non rattrapée :', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </span>

          <h1 className="mt-4 text-lg font-semibold text-foreground">
            Une erreur est survenue
          </h1>
          <p className="mt-1 text-sm text-muted">
            L'écran n'a pas pu s'afficher. Rechargez la page ; si le problème persiste,
            signalez-le.
          </p>

          {/* Le détail technique n'apparaît qu'en développement : en
              production, il exposerait la structure interne de l'application. */}
          {IS_DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-surface-raised p-3 text-left text-xs text-danger">
              {error.message}
            </pre>
          )}

          <Button className="mt-5" onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
        </div>
      </div>
    );
  }
}
