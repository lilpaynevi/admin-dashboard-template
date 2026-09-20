import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/lib/cn';

export type DropdownProps = {
  /** Le déclencheur. Reçoit l'état pour pouvoir faire pivoter un chevron. */
  trigger: (state: { isOpen: boolean }) => ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
  menuClassName?: string;
};

export function Dropdown({
  trigger,
  children,
  align = 'end',
  className,
  menuClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  useOnClickOutside(containerRef, close, isOpen);

  /** Échap ferme sans déplacer la souris — la sortie attendue au clavier. */
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div onClick={() => setIsOpen((value) => !value)}>{trigger({ isOpen })}</div>

      {isOpen && (
        <div
          role="menu"
          // La fermeture est déléguée au conteneur : chaque `DropdownItem`
          // n'a pas à savoir qu'il vit dans un menu, et on ne risque pas d'en
          // oublier un.
          onClick={close}
          className={cn(
            'absolute z-40 mt-1 min-w-[12rem] animate-slide-up overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-popover',
            align === 'end' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export type DropdownItemProps = {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

export function DropdownItem({
  children,
  onClick,
  icon,
  tone = 'default',
  disabled,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        tone === 'danger'
          ? 'text-danger hover:bg-danger-soft'
          : 'text-foreground hover:bg-surface-raised',
      )}
    >
      {icon && <span className="shrink-0 text-subtle">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className="px-2.5 py-1.5 text-xs font-medium text-subtle">{children}</div>;
}
