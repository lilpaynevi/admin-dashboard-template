import { useState } from 'react';

import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZES: Record<AvatarSize, string> = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-12 text-sm',
};

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold uppercase text-primary',
        SIZES[size],
        className,
      )}
      // Le nom est déjà écrit à côté dans presque tous les usages ; l'annoncer
      // deux fois alourdit la lecture au lecteur d'écran.
      aria-hidden="true"
      title={name}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          // Une URL cassée laisserait une icône d'image brisée : on retombe
          // sur les initiales, qui restent lisibles.
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
