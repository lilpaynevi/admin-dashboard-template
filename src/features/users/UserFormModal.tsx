import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Modal, Select } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useToast } from '@/providers/ToastProvider';

import { usersApi } from './users.api';
import { userSchema, type UserFormValues } from './users.schema';
import { ROLE_LABELS, STATUS_LABELS, type User, type UserRole, type UserStatus } from './users.types';

export type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** `null` = création. Sinon, édition de cet utilisateur. */
  user: User | null;
};

const EMPTY_VALUES: UserFormValues = {
  name: '',
  email: '',
  role: 'viewer',
  status: 'invited',
};

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as UserStatus[]).map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

export function UserFormModal({ isOpen, onClose, user }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const isEditing = user !== null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY_VALUES,
  });

  /**
   * Recharge le formulaire à chaque ouverture.
   *
   * La modale n'est pas démontée entre deux usages : sans ce `reset`, ouvrir
   * « Modifier » puis « Nouveau » afficherait encore les valeurs du précédent.
   */
  useEffect(() => {
    if (!isOpen) return;
    reset(
      user
        ? { name: user.name, email: user.email, role: user.role, status: user.status }
        : EMPTY_VALUES,
    );
  }, [isOpen, user, reset]);

  const mutation = useMutation({
    mutationFn: (values: UserFormValues) =>
      isEditing ? usersApi.update(user.id, values) : usersApi.create(values),

    onSuccess: (saved) => {
      // On invalide toute la branche `users` : la liste, mais aussi le détail
      // et les compteurs qui en dépendent.
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      toast.success(isEditing ? 'Utilisateur mis à jour.' : 'Utilisateur créé.', {
        description: saved.email,
      });
      onClose();
    },

    onError: (error) => {
      // Le serveur peut viser un champ précis (e-mail déjà pris) : on place
      // l'erreur dessus plutôt que d'afficher un message général que
      // l'utilisateur ne saura pas où corriger.
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof UserFormValues, { message });
        }
        return;
      }
      toast.error("L'enregistrement a échoué.", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
      description={
        isEditing
          ? 'Les changements prennent effet immédiatement.'
          : "Un e-mail d'invitation sera envoyé à l'adresse indiquée."
      }
      dismissable={!isBusy}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isBusy}>
            Annuler
          </Button>
          {/* Le bouton vit hors du `<form>` : il le cible par son `form`, ce
              qui conserve l'envoi à la touche Entrée. */}
          <Button type="submit" form="user-form" isLoading={isBusy}>
            {isEditing ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form
        id="user-form"
        // `mutate` et non `mutateAsync` : l'échec est déjà traité dans
        // `onError`. Avec `mutateAsync`, la promesse rejetée remonterait dans
        // `handleSubmit` et finirait en rejet non intercepté dans la console.
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nom complet"
          placeholder="Marie Dupont"
          autoComplete="name"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="marie.dupont@exemple.fr"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Rôle"
            options={ROLE_OPTIONS}
            required
            error={errors.role?.message}
            hint="Détermine les écrans accessibles."
            {...register('role')}
          />

          <Select
            label="Statut"
            options={STATUS_OPTIONS}
            required
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
      </form>
    </Modal>
  );
}
