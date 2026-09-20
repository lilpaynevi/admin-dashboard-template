import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/lib/cn';

import { controlStyles, Field } from './Field';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export type SelectProps<T extends string = string> = Omit<
  ComponentPropsWithRef<'select'>,
  'children'
> & {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption<T>[];
  /** Première option neutre, rendue non sélectionnable une fois passée. */
  placeholder?: string;
  containerClassName?: string;
};

/**
 * Un `<select>` natif, volontairement.
 *
 * Une liste déroulante maison coûte cher à rendre accessible (navigation au
 * clavier, annonce du nombre d'options, saisie rapide) et perd le sélecteur
 * plein écran des navigateurs mobiles. On ne la reconstruit que si le besoin
 * l'exige : recherche dans les options, sélection multiple, options riches.
 */
export function Select<T extends string = string>({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  containerClassName,
  required,
  ...props
}: SelectProps<T>) {
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
          <select
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            required={required}
            className={cn(
              controlStyles(invalid),
              // `appearance-none` retire la flèche native, qu'on ne peut pas
              // thémer ; on redessine la nôtre juste en dessous.
              'h-9 cursor-pointer appearance-none pr-9',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
            aria-hidden="true"
          />
        </div>
      )}
    </Field>
  );
}
