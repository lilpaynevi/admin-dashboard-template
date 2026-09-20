import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3',
        className,
      )}
    >
      <p className="text-xs text-muted">
        {/* Le total est rappelé en toutes lettres : « 1 – 25 » seul ne dit pas
            s'il reste 3 pages ou 300. */}
        <span className="font-medium text-foreground">
          {formatNumber(from)}–{formatNumber(to)}
        </span>{' '}
        sur {formatNumber(total)}
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-xs text-muted">
            Par page
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-foreground"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <PageButton
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            label="Page précédente"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </PageButton>

          {buildPages(page, pageCount).map((entry, index) =>
            entry === 'gap' ? (
              // Clé indexée : une ellipse n'a pas d'identité propre et ne
              // change jamais de place au sein d'un même rendu.
              <span key={`gap-${index}`} className="px-1 text-xs text-subtle">
                …
              </span>
            ) : (
              <PageButton
                key={entry}
                onClick={() => onPageChange(entry)}
                isActive={entry === page}
                label={`Page ${entry}`}
                aria-current={entry === page ? 'page' : undefined}
              >
                {entry}
              </PageButton>
            ),
          )}

          <PageButton
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            label="Page suivante"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </PageButton>
        </nav>
      </div>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  isActive,
  label,
  ...props
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  label: string;
  'aria-current'?: 'page';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-40',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted hover:bg-surface-raised hover:text-foreground',
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Fenêtre glissante autour de la page courante.
 *
 * Afficher toutes les pages fonctionne jusqu'à une dizaine ; au-delà, la
 * barre déborde. On garde donc toujours la première, la dernière, la courante
 * et ses voisines — et on remplace le reste par une ellipse.
 */
function buildPages(page: number, pageCount: number): Array<number | 'gap'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages: Array<number | 'gap'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) pages.push('gap');
  for (let current = start; current <= end; current += 1) pages.push(current);
  if (end < pageCount - 1) pages.push('gap');

  pages.push(pageCount);
  return pages;
}
