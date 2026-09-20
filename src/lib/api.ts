import axios, { AxiosError, type AxiosInstance } from 'axios';

export const TOKEN_STORAGE_KEY = 'auth-token';

/** Erreur normalisée : les écrans n'ont jamais à connaître la forme d'axios. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    /** Erreurs par champ renvoyées par le serveur, prêtes pour `setError`. */
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Le jeton est lu à chaque requête, pas à la création du client.
 *
 * Sinon un utilisateur qui se connecte après le démarrage de l'application
 * continuerait d'envoyer des requêtes anonymes jusqu'au prochain rechargement.
 */
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Traduit toute panne réseau en `ApiError`.
 *
 * Un 401 purge la session et renvoie vers la page de connexion : sans ça,
 * l'utilisateur reste bloqué sur un écran qui échoue en boucle sans jamais
 * dire pourquoi.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const status = error.response?.status;

    if (status === 401 && readToken()) {
      clearToken();
      // Rechargement complet plutôt qu'un `navigate` : l'intercepteur vit hors
      // de React et n'a pas accès au routeur. Ça vide au passage tout état
      // résiduel appartenant à l'utilisateur déconnecté.
      window.location.assign('/login');
    }

    return Promise.reject(
      new ApiError(
        error.response?.data?.message ?? messageForStatus(status) ?? error.message,
        status,
        error.response?.data?.errors,
      ),
    );
  },
);

function messageForStatus(status?: number): string | undefined {
  switch (status) {
    case 400:
      return 'Requête invalide.';
    case 401:
      return 'Session expirée, reconnectez-vous.';
    case 403:
      return "Vous n'avez pas accès à cette ressource.";
    case 404:
      return 'Ressource introuvable.';
    case 409:
      return 'Cette ressource existe déjà.';
    case 422:
      return 'Certains champs sont invalides.';
    case 429:
      return 'Trop de requêtes, réessayez dans un instant.';
    case undefined:
      return 'Impossible de joindre le serveur.';
    default:
      return status >= 500 ? 'Erreur serveur, réessayez plus tard.' : undefined;
  }
}

/**
 * Le jeton vit dans `localStorage`, ce qui l'expose à une faille XSS.
 *
 * C'est le compromis assumé d'un template : ça marche sans backend
 * compatible. Pour de la production sensible, faire émettre au serveur un
 * cookie `HttpOnly; SameSite=Strict`, supprimer ces trois fonctions et passer
 * `withCredentials: true` à `axios.create`.
 */
export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    /* Navigation privée : la session ne survivra pas au rechargement. */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* Rien à purger. */
  }
}
