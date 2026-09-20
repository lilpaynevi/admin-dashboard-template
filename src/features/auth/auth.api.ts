import { api } from '@/lib/api';
import { USE_MOCKS } from '@/lib/env';
import { mockApi } from '@/mocks/mock-api';

import type { AuthUser, Credentials, Session } from './auth.types';

/**
 * Couche d'accès aux données de l'authentification.
 *
 * Les composants n'importent jamais `api` ni `mockApi` directement : c'est ici
 * — et seulement ici — que l'on choisit la source. Brancher le vrai backend
 * revient à supprimer les branches `USE_MOCKS`.
 */
export const authApi = {
  async login(credentials: Credentials): Promise<Session> {
    if (USE_MOCKS) return mockApi.auth.login(credentials);

    const { data } = await api.post<Session>('/auth/login', credentials);
    return data;
  },

  async me(token: string): Promise<AuthUser> {
    if (USE_MOCKS) return mockApi.auth.me(token);

    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) return;

    // On ignore l'échec : si le serveur refuse, l'utilisateur doit quand même
    // pouvoir se déconnecter localement. Le jeton est purgé dans tous les cas
    // par `AuthProvider`.
    await api.post('/auth/logout').catch(() => undefined);
  },
};
