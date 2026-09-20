import { Check, Minus } from 'lucide-react';
import { useId, type ComponentPropsWithRef } from 'react';

import { cn } from '@/lib/cn';

export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label?: string;
  description?: string;
  /** État « certaines lignes sélectionnées » d'une case d'en-tête de tableau. */
  indeterminate?: boolean;
};

/**
 * La case native est conservée et rendue transparente au-dessus du carré
 * dessiné. C'est ce qui garde gratuitement le focus clavier, la barre
 * d'espace, l'association au `<label>` et la soumission de formulaire — que
 * reconstruire sur un `<div role="checkbox">` coûte cher et à moitié.
 */
export function Checkbox({
  label,
  description,
  indeterminate = false,
  className,
  id: providedId,
  checked,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          // L'état indéterminé n'existe pas en HTML comme attribut : il ne se
          // pose qu'en JavaScript, d'où ce `ref`.
          ref={(node) => {
            if (node) node.indeterminate = indeterminate && !checked;
          }}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex size-5 items-center justify-center rounded border transition-colors',
            // La coche est dessinée en `currentColor` : c'est la couleur de
            // texte de ce carré — et non l'opacité de l'icône — qui la révèle.
            // Un `peer-checked:` posé sur l'icône elle-même ne s'appliquerait
            // pas : le sélecteur `~` de Tailwind ne vise que les frères du
            // champ, pas leurs descendants.
            'border-border bg-surface text-transparent',
            'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground',
            'peer-indeterminate:border-primary peer-indeterminate:bg-primary peer-indeterminate:text-primary-foreground',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
            'peer-disabled:opacity-50',
          )}
        >
          {indeterminate && !checked ? (
            <Minus className="size-3.5" strokeWidth={3} />
          ) : (
            <Check className="size-3.5" strokeWidth={3} />
          )}
        </span>
      </span>

      {(label || description) && (
        <label htmlFor={id} className="cursor-pointer select-none text-sm leading-5">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {description && <span className="block text-xs text-muted">{description}</span>}
        </label>
      )}
    </div>
  );
}
