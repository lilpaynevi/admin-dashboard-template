import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Pencil, Plus, Search, Trash2, UserX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  EmptyState,
  Input,
  Modal,
  Pagination,
  Select,
  type BadgeTone,
  type Column,
  type SortState,
} from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatDate, formatRelative } from '@/lib/format';
import { queryKeys } from '@/lib/query-keys';
import { useToast } from '@/providers/ToastProvider';

import { UserFormModal } from './UserFormModal';
import { usersApi } from './users.api';
import {
  ROLE_LABELS,
  STATUS_LABELS,
  type User,
  type UserListParams,
  type UserRole,
  type UserStatus,
} from './users.types';

const STATUS_TONES: Record<UserStatus, BadgeTone> = {
  active: 'success',
  invited: 'info',
  suspended: 'danger',
};

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les rôles' },
  ...(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  })),
];

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  ...(Object.keys(STATUS_LABELS) as UserStatus[]).map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];

export function UsersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserListParams['role']>('all');
  const [status, setStatus] = useState<UserListParams['status']>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const formModal = useDisclosure();
  const [editing, setEditing] = useState<User | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<User | null>(null);

  // La recherche n'est envoyée qu'après une pause de frappe ; sans ça, « dupont »
  // déclenche six requêtes dont cinq sont périmées avant d'arriver.
  const debouncedSearch = useDebounce(search, 300);

  /**
   * Tout changement de filtre ramène en page 1.
   *
   * Sinon, filtrer depuis la page 4 d'une liste qui n'en compte plus que 2
   * affiche un tableau vide — et l'utilisateur conclut que le filtre ne
   * renvoie rien.
   */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status, sort, pageSize]);

  const params: UserListParams = useMemo(
    () => ({ search: debouncedSearch, role, status, sort, page, pageSize }),
    [debouncedSearch, role, status, sort, page, pageSize],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.list(params),
    // Garde la page précédente affichée pendant le chargement de la suivante :
    // sans ça, le tableau se vide à chaque clic et la page saute.
    placeholderData: keepPreviousData,
  });

  const deletion = useMutation({
    mutationFn: (user: User) => usersApi.remove(user.id),
    onSuccess: (_result, user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      setSelectedIds((current) => current.filter((id) => id !== user.id));
      setPendingDeletion(null);
      toast.success('Utilisateur supprimé.', { description: user.email });
    },
    onError: (mutationError) => {
      toast.error('La suppression a échoué.', {
        description: mutationError instanceof Error ? mutationError.message : undefined,
      });
    },
  });

  function openCreate() {
    setEditing(null);
    formModal.open();
  }

  function openEdit(user: User) {
    setEditing(user);
    formModal.open();
  }

  const columns: Column<User>[] = [
    {
      id: 'name',
      header: 'Utilisateur',
      sortValue: (user) => user.name,
      width: 'w-full',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Rôle',
      sortValue: (user) => ROLE_LABELS[user.role],
      cell: (user) => (
        <Badge tone={user.role === 'admin' ? 'primary' : 'neutral'}>
          {ROLE_LABELS[user.role]}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Statut',
      sortValue: (user) => STATUS_LABELS[user.status],
      cell: (user) => (
        // La pastille double la couleur d'un repère de forme ; le libellé
        // reste la source d'information.
        <Badge tone={STATUS_TONES[user.status]} dot>
          {STATUS_LABELS[user.status]}
        </Badge>
      ),
    },
    {
      id: 'lastSeenAt',
      header: 'Dernière activité',
      // On trie sur l'horodatage, pas sur « il y a 3 jours » : l'ordre
      // alphabétique de ces chaînes n'a aucun sens.
      sortValue: (user) => (user.lastSeenAt ? Date.parse(user.lastSeenAt) : null),
      cell: (user) =>
        user.lastSeenAt ? (
          <span className="text-muted">{formatRelative(user.lastSeenAt)}</span>
        ) : (
          <span className="text-subtle">Jamais</span>
        ),
    },
    {
      id: 'createdAt',
      header: 'Inscription',
      sortValue: (user) => Date.parse(user.createdAt),
      cell: (user) => <span className="whitespace-nowrap text-muted">{formatDate(user.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (user) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Dropdown
            trigger={() => (
              <button
                type="button"
                aria-label={`Actions pour ${user.name}`}
                className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-raised hover:text-foreground"
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </button>
            )}
          >
            <DropdownItem icon={<Pencil className="size-4" />} onClick={() => openEdit(user)}>
              Modifier
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              tone="danger"
              icon={<Trash2 className="size-4" />}
              onClick={() => setPendingDeletion(user)}
            >
              Supprimer
            </DropdownItem>
          </Dropdown>
        </div>
      ),
    },
  ];

  const hasFilters = debouncedSearch !== '' || role !== 'all' || status !== 'all';

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Gérez les comptes, leurs rôles et leurs accès."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Nouvel utilisateur
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un nom ou un e-mail…"
          aria-label="Rechercher un utilisateur"
          leftIcon={<Search className="size-4" />}
          containerClassName="w-full sm:w-72"
        />

        <Select
          value={role}
          onChange={(event) => setRole(event.target.value as UserListParams['role'])}
          options={ROLE_FILTER_OPTIONS}
          aria-label="Filtrer par rôle"
          containerClassName="w-full sm:w-44"
        />

        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as UserListParams['status'])}
          options={STATUS_FILTER_OPTIONS}
          aria-label="Filtrer par statut"
          containerClassName="w-full sm:w-44"
        />

        {selectedIds.length > 0 && (
          <span className="ml-auto text-xs text-muted">
            {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isError ? (
        <div className="rounded-card border border-border bg-surface">
          <EmptyState
            icon={UserX}
            title="Impossible de charger les utilisateurs."
            description={error instanceof Error ? error.message : undefined}
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Réessayer
              </Button>
            }
          />
        </div>
      ) : (
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          rowKey={(user) => user.id}
          // `isLoading` seul : `isFetching` est vrai aussi pendant un
          // rafraîchissement en arrière-plan, où l'on veut garder le tableau
          // à l'écran plutôt qu'un squelette.
          isLoading={isLoading}
          sort={sort}
          onSortChange={setSort}
          // Le tri part au serveur avec les filtres : il porte sur la liste
          // entière, pas sur les lignes de la page affichée.
          manualSorting
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={openEdit}
          className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : undefined}
          emptyState={
            <EmptyState
              icon={UserX}
              title={hasFilters ? 'Aucun résultat' : 'Aucun utilisateur'}
              description={
                hasFilters
                  ? 'Aucun compte ne correspond à ces filtres. Élargissez la recherche.'
                  : 'Créez le premier compte pour commencer.'
              }
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setRole('all');
                      setStatus('all');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
                    Nouvel utilisateur
                  </Button>
                )
              }
            />
          }
          footer={
            (data?.total ?? 0) > 0 && (
              <Pagination
                page={page}
                pageSize={pageSize}
                total={data?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )
          }
        />
      )}

      <UserFormModal isOpen={formModal.isOpen} onClose={formModal.close} user={editing} />

      <Modal
        isOpen={pendingDeletion !== null}
        onClose={() => setPendingDeletion(null)}
        title="Supprimer cet utilisateur ?"
        description={
          pendingDeletion
            ? `${pendingDeletion.name} perdra immédiatement l'accès. Cette action est définitive.`
            : undefined
        }
        size="sm"
        dismissable={!deletion.isPending}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPendingDeletion(null)}
              disabled={deletion.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              isLoading={deletion.isPending}
              onClick={() => pendingDeletion && deletion.mutate(pendingDeletion)}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          {/* L'e-mail est répété ici : dans un tableau de 50 lignes, on se
              trompe de ligne, et une suppression ne se rattrape pas. */}
          Compte concerné : <span className="font-medium text-foreground">{pendingDeletion?.email}</span>
        </p>
      </Modal>
    </>
  );
}
