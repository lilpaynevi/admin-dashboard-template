import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Checkbox } from './Checkbox';
import { SkeletonTable } from './Skeleton';

export type ColumnAlign = 'left' | 'center' | 'right';

export type Column<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /**
   * Présence = colonne triable. La fonction renvoie la valeur à comparer, qui
   * n'est pas toujours celle qu'on affiche : « il y a 3 jours » se trie sur
   * l'horodatage, pas sur la chaîne.
   *
   * En tri serveur (`manualSorting`), elle sert uniquement à marquer la
   * colonne comme triable — c'est `column.id` qui part sur le réseau.
   */
  sortValue?: (row: T) => string | number | null;
  align?: ColumnAlign;
  /** Classe de largeur (`w-40`, `w-full`…) appliquée à la colonne. */
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
};

export type SortState = { columnId: string; direction: 'asc' | 'desc' } | null;

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  /** Identité stable d'une ligne — jamais l'index, qui casse à chaque tri. */
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  /** Tri contrôlé. Omis, la table gère son propre état de tri. */
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /**
   * `true` : les lignes arrivent déjà triées, la table n'y touche pas.
   *
   * C'est le seul mode correct sur un jeu paginé. Trier localement ne
   * classerait que les 25 lignes de la page affichée : le « plus ancien
   * compte » obtenu serait le plus ancien de la page, pas de la base — un
   * résultat faux, et d'autant plus trompeur qu'il a l'air juste.
   */
  manualSorting?: boolean;
  onRowClick?: (row: T) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Zone sous le tableau — typiquement `<Pagination />`. */
  footer?: ReactNode;
  className?: string;
};

const ALIGN: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  emptyState,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  manualSorting = false,
  onRowClick,
  selectedIds,
  onSelectionChange,
  footer,
  className,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<SortState>(defaultSort);
  // `undefined` distingue « non contrôlé » de « contrôlé, sans tri actif » —
  // qui vaut `null`. Confondre les deux figerait le tri sur un tableau piloté.
  const sort = controlledSort !== undefined ? controlledSort : internalSort;

  const isSelectable = Boolean(onSelectionChange);
  const selected = useMemo(() => new Set(selectedIds ?? []), [selectedIds]);

  const rows = useMemo(() => {
    if (manualSorting || !sort) return data;

    const column = columns.find((candidate) => candidate.id === sort.columnId);
    if (!column?.sortValue) return data;
    const { sortValue } = column;

    // Copie avant tri : `sort` mute le tableau sur place, et muter une prop
    // rend le rendu suivant imprévisible.
    return [...data].sort((a, b) => {
      const left = sortValue(a);
      const right = sortValue(b);

      // Les valeurs absentes finissent toujours en bas, quel que soit le sens
      // du tri : « pas de valeur » n'est ni le plus grand ni le plus petit.
      if (left === null) return 1;
      if (right === null) return -1;

      const comparison =
        typeof left === 'string' && typeof right === 'string'
          ? left.localeCompare(right, 'fr', { sensitivity: 'base' })
          : Number(left) - Number(right);

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, columns, sort, manualSorting]);

  function toggleSort(column: Column<T>) {
    if (!column.sortValue) return;

    const next: SortState =
      sort?.columnId === column.id
        ? sort.direction === 'asc'
          ? { columnId: column.id, direction: 'desc' }
          : // Troisième clic : retour à l'ordre naturel. Sans cette sortie,
            // impossible de revenir au classement du serveur sans recharger.
            null
        : { columnId: column.id, direction: 'asc' };

    if (controlledSort === undefined) setInternalSort(next);
    onSortChange?.(next);
  }

  const visibleIds = rows.map(rowKey);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someVisibleSelected = visibleIds.some((id) => selected.has(id));

  function toggleAll() {
    if (!onSelectionChange) return;
    // On ne touche qu'aux lignes visibles : une sélection faite page 1 ne doit
    // pas disparaître parce qu'on a décoché tout en page 2.
    const next = new Set(selected);
    if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
    else visibleIds.forEach((id) => next.add(id));
    onSelectionChange([...next]);
  }

  function toggleRow(id: string) {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange([...next]);
  }

  const columnCount = columns.length + (isSelectable ? 1 : 0);

  return (
    <div className={cn('overflow-hidden rounded-card border border-border bg-surface', className)}>
      {/* Le défilement horizontal est porté par ce conteneur : sur mobile, une
          table à six colonnes déborde sinon de la page entière. */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised/50">
              {isSelectable && (
                <th scope="col" className="w-10 px-4 py-2.5">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    onChange={toggleAll}
                    aria-label="Sélectionner toutes les lignes visibles"
                  />
                </th>
              )}

              {columns.map((column) => {
                const isSorted = sort?.columnId === column.id;
                const sortable = Boolean(column.sortValue);

                return (
                  <th
                    key={column.id}
                    scope="col"
                    // `aria-sort` est ce qui permet à un lecteur d'écran
                    // d'annoncer « trié par nom, croissant ».
                    aria-sort={
                      isSorted
                        ? sort?.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={cn(
                      'px-4 py-2.5 text-xs font-medium text-muted',
                      ALIGN[column.align ?? 'left'],
                      column.width,
                      column.headerClassName,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded transition-colors hover:text-foreground',
                          isSorted && 'text-foreground',
                          column.align === 'right' && 'flex-row-reverse',
                        )}
                      >
                        {column.header}
                        {isSorted ? (
                          sort?.direction === 'asc' ? (
                            <ArrowUp className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columnCount} className="p-0">
                  <SkeletonTable columns={columnCount} />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>{emptyState}</td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = rowKey(row);
                const isSelected = selected.has(id);

                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'bg-primary-soft/50' : 'hover:bg-surface-raised/60',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {isSelectable && (
                      <td
                        className="w-10 px-4 py-3"
                        // Cocher une case ne doit pas aussi ouvrir la ligne.
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          aria-label="Sélectionner la ligne"
                        />
                      </td>
                    )}

                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4 py-3 text-foreground',
                          ALIGN[column.align ?? 'left'],
                          column.cellClassName,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  );
}
