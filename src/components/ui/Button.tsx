import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-surface-raised text-foreground hover:bg-border',
  outline: 'border border-border bg-surface text-foreground hover:bg-surface-raised',
  ghost: 'text-muted hover:bg-surface-raised hover:text-foreground',
  danger: 'bg-danger text-white hover:bg-danger-hover',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-9 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-6 text-base',
  icon: 'size-9',
};

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Affiche un indicateur et bloque le bouton — évite le double envoi. */
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      // `type="button"` par défaut : sans ça, tout bouton placé dans un
      // formulaire vaut `submit` et l'envoie au premier clic. Le bug est
      // discret jusqu'au jour où un bouton « Annuler » crée une ressource.
      type={type}
      disabled={disabled || isLoading}
      // L'attribut n'est posé que pendant le chargement : `aria-busy="false"`
      // en permanence est du bruit pour les technologies d'assistance.
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner className={size === 'sm' ? 'size-3.5' : 'size-4'} />
      ) : (
        leftIcon
      )}
      {size !== 'icon' && children}
      {!isLoading && rightIcon}
    </button>
  );
}
