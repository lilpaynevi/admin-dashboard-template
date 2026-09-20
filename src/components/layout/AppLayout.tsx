import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useDisclosure } from '@/hooks/useDisclosure';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/cn';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  // Le repli de la barre est une préférence durable : la réinitialiser à
  // chaque visite annule un réglage que l'utilisateur a fait exprès.
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const mobileMenu = useDisclosure();
  const location = useLocation();

  /**
   * Referme le tiroir à chaque changement de page.
   *
   * Sur mobile, naviguer sans ça laisse le menu ouvert par-dessus l'écran
   * qu'on vient justement de demander.
   */
  const closeMobileMenu = mobileMenu.close;
  useEffect(() => {
    closeMobileMenu();
    // `closeMobileMenu` et non `mobileMenu` : le hook renvoie un objet neuf à
    // chaque rendu, l'effet se rejouerait en permanence.
  }, [location.pathname, closeMobileMenu]);

  return (
    <div className="min-h-screen bg-background">
      {/* Lien d'évitement : il n'apparaît qu'à la tabulation et permet de
          sauter le menu, qui répète une douzaine de liens sur chaque page.
          Sans lui, atteindre le contenu au clavier demande autant de
          tabulations qu'il y a d'entrées. */}
      <a
        href="#contenu"
        className="sr-only-focusable absolute left-4 top-4 z-50 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
      >
        Aller au contenu
      </a>

      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((value) => !value)}
        isMobileOpen={mobileMenu.isOpen}
        onCloseMobile={mobileMenu.close}
      />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-200',
          // Le décalage n'existe qu'à partir de `lg` : en dessous, la barre
          // est un tiroir posé par-dessus, pas une colonne.
          isCollapsed ? 'lg:pl-sidebar-collapsed' : 'lg:pl-sidebar',
        )}
      >
        <Topbar onOpenMobileMenu={mobileMenu.open} />

        <main id="contenu" className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
