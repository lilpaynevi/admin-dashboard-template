import { useCallback, useState } from 'react';

export type Disclosure = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/**
 * État ouvert/fermé d'une modale, d'un menu ou d'un tiroir.
 *
 * Les callbacks sont mémoïsées : elles finissent presque toujours en prop d'un
 * composant, et une nouvelle fonction à chaque rendu annule tout `memo` posé
 * dessus.
 */
export function useDisclosure(initial = false): Disclosure {
  const [isOpen, setIsOpen] = useState(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return { isOpen, open, close, toggle };
}
