import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { controlStyles, Field } from './Field';

export type InputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  /** Icône décorative à gauche (loupe, enveloppe…). */
  leftIcon?: ReactNode;
  /** Bouton ou indicateur à droite — reste cliquable. */
  rightSlot?: ReactNode;
  containerClassName?: string;
};

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  className,
  containerClassName,
  required,
  ...props
}: InputProps) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {leftIcon && (
            // `pointer-events-none` : sans ça, cliquer sur l'icône ne place pas
            // le curseur dans le champ — un défaut qu'on ressent sans le voir.
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-subtle">
              {leftIcon}
            </span>
          )}

          <input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            required={required}
            className={cn(
              controlStyles(invalid),
              'h-9',
              leftIcon && 'pl-9',
              rightSlot && 'pr-10',
              className,
            )}
            {...props}
          />

          {rightSlot && (
            <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>
          )}
        </div>
      )}
    </Field>
  );
}
