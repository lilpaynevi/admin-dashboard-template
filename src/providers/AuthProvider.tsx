import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authApi } from '@/features/auth/auth.api';
import type { AuthUser, Credentials } from '@/features/auth/auth.types';
import type { UserRole } from '@/features/users/users.types';
import { clearToken, readToken, storeToken } from '@/lib/api';

/**
 * `loading` est un état à part entière, pas un détail.
 *
 * Sans lui, le routeur voit `user === null` au premier rendu et renvoie vers
 * la page de connexion un utilisateur dont la session est parfaitement valide,
 * simplement pas encore vérifiée.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  /** `hasRole('admin', 'manager')` — vrai si l'utilisateur a l'un des rôles. */
  hasRole: (...roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    readToken() ? 'loading' : 'unauthenticated',
  );

  /**
   * Revalide le jeton trouvé au démarrage.
   *
   * Un jeton présent dans `localStorage` ne prouve rien : il peut avoir
   * expiré, ou l'utilisateur avoir été désactivé entre deux visites. Seul le
   * serveur peut trancher.
   */
  useEffect(() => {
    const token = readToken();
    if (!token) return;

    let cancelled = false;

    authApi
      .me(token)
      .then((account) => {
        if (cancelled) return;
        setUser(account);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setStatus('unauthenticated');
      });

    // Évite un `setState` sur un composant démonté — et le double appel du
    // mode strict de React en développement.
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const session = await authApi.login(credentials);
    storeToken(session.token);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    // L'état local est vidé d'abord : l'utilisateur voit la déconnexion
    // immédiatement, même si l'appel réseau traîne ou échoue.
    clearToken();
    setUser(null);
    setStatus('unauthenticated');
    await authApi.logout();
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo(
    () => ({ user, status, login, logout, hasRole }),
    [user, status, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être appelé sous un <AuthProvider>.');
  }
  return context;
}
