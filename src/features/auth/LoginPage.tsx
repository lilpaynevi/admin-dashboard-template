import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Button, Card, Input } from '@/components/ui';
import { DEMO_CREDENTIALS } from '@/mocks/mock-api';
import { useAuth } from '@/providers/AuthProvider';

import { loginSchema, type LoginFormValues } from './auth.schema';

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // Pré-remplissage du compte de démonstration. À supprimer en démarrant un
    // vrai projet — un champ pré-rempli en production est une fuite.
    defaultValues: DEMO_CREDENTIALS,
  });

  /**
   * Retour à la page demandée avant la redirection.
   *
   * `ProtectedRoute` la range dans l'état de navigation. Sans ça, un lien
   * profond partagé par e-mail ramène toujours au tableau de bord après
   * connexion, et l'utilisateur doit renaviguer à la main.
   */
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // Message volontairement vague : préciser « cette adresse n'existe pas »
      // permettrait d'énumérer les comptes valides.
      setFormError(
        error instanceof Error ? error.message : 'Connexion impossible, réessayez.',
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            A
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Connexion</h1>
            <p className="mt-1 text-sm text-muted">Accédez à votre espace d'administration.</p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              // Le focus initial est sur le premier champ : on peut taper dès
              // l'arrivée, sans viser à la souris.
              autoFocus
              leftIcon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              leftIcon={<Lock className="size-4" />}
              error={errors.password?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                  }
                  className="rounded p-1 text-subtle transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              }
              {...register('password')}
            />

            {formError && (
              <p
                role="alert"
                className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
              >
                {formError}
              </p>
            )}

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Se connecter
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-muted">
          Compte de démonstration :{' '}
          <span className="font-medium text-foreground">{DEMO_CREDENTIALS.email}</span> /{' '}
          <span className="font-medium text-foreground">{DEMO_CREDENTIALS.password}</span>
        </p>
      </div>
    </main>
  );
}
