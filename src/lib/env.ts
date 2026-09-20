/**
 * Interrupteur mocks / API réelle.
 *
 * Par défaut à `true` : le template doit démarrer après un simple
 * `npm install && npm run dev`, sans backend ni fichier `.env`. Passer
 * `VITE_USE_MOCKS=false` dans `.env.local` bascule tous les appels sur axios.
 *
 * Les variables Vite arrivent en chaînes de caractères — `'false'` est un
 * booléen vrai en JavaScript, d'où la comparaison explicite.
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const IS_DEV = import.meta.env.DEV;
