import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/lib/cn';

import { controlStyles, Field } from './Field';

export type TextareaProps = ComponentPropsWithRef<'textarea'> & {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

export function Textarea({
  label,
  hint,
  error,
  className,
  containerClassName,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
          // `resize-y` seulement : un redimensionnement horizontal déborde de
          // la grille du formulaire et casse la mise en page.
          className={cn(controlStyles(invalid), 'resize-y py-2 leading-relaxed', className)}
          {...props}
        />
      )}
    </Field>
  );
}
