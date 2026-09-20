# Admin Dashboard — template React + Tailwind

Base réutilisable pour les back-offices : authentification, thème clair/sombre,
kit de composants, tableau de données trié côté serveur, graphiques accessibles.

Pendant idéal du `mobile-template` : **les mêmes jetons de design**, les mêmes
noms sémantiques, la même philosophie de commentaires. Un thème client se
reporte d'un projet à l'autre en un copier-coller.

---

## Démarrer

```bash
npm install
npm run dev
```

Puis <http://localhost:5173>. Aucun backend n'est nécessaire : le template
démarre sur des données simulées.

**Compte de démonstration** — `admin@exemple.fr` / `demo1234` (pré-rempli sur
l'écran de connexion).

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification des types puis build de production |
| `npm run preview` | Sert le build local |
| `npm run typecheck` | `tsc --noEmit` seul |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (classes Tailwind triées) |

---

## Ce qu'il y a dedans

**Socle** — Vite · React 19 · TypeScript strict · Tailwind CSS 3.4 · React
Router 7 · TanStack Query 5 · React Hook Form + Zod · Axios · Recharts ·
lucide-react.

**Écrans** — connexion, tableau de bord (4 indicateurs, 2 graphiques, flux
d'activité), liste d'utilisateurs (recherche, filtres, tri serveur, pagination,
sélection multiple, création / édition / suppression), paramètres à onglets,
page 404, écran d'erreur global.

**Kit UI** (`src/components/ui`) — Avatar, Badge, Button, Card, Checkbox,
DataTable, Dropdown, EmptyState, Field, Input, Modal, Pagination, Select,
Skeleton, Spinner, Switch, Tabs, Textarea, Tooltip.

---

## Arborescence

```
src/
├── components/
│   ├── ui/            Kit générique, sans logique métier
│   ├── layout/        Coquille de l'application (barre latérale, en-tête)
│   ├── charts/        Enveloppes Recharts thémées
│   └── feedback/      ErrorBoundary
├── design-system/
│   └── tokens.ts      Miroir hexadécimal de global.css (pour Recharts)
├── features/          Un dossier par domaine métier
│   ├── auth/          LoginPage, schéma, accès API, types
│   ├── dashboard/
│   ├── users/
│   └── settings/
├── hooks/             useDebounce, useDisclosure, useLocalStorage…
├── lib/               api (axios), format, cn, query-keys, env
├── mocks/             Backend simulé — à supprimer en production
├── providers/         Theme, Query, Auth, Toast
├── routes/            Routeur et garde de route
└── styles/global.css  Jetons de couleur — source de vérité
```

Le découpage est **par domaine, pas par type de fichier**. Ajouter « Factures »
crée `features/invoices/` avec sa page, son schéma, son accès API et ses types —
et non quatre fichiers éparpillés dans quatre dossiers. Supprimer une
fonctionnalité revient alors à supprimer un dossier.

---

## Rethémer pour un client

Tout part de `src/styles/global.css`. Les couleurs y sont écrites en
**composantes RVB séparées par des espaces** — c'est ce qui rend
`bg-primary/10` fonctionnel ; en hexadécimal, toutes les variantes d'opacité
seraient inertes.

```css
:root {
  --color-primary: 79 70 229;        /* indigo → la couleur du client */
  --color-primary-hover: 67 56 202;
  --color-primary-soft: 238 242 255; /* fond pastel des badges */
}
.dark {
  --color-primary: 99 102 241;       /* la version sombre est CHOISIE, pas calculée */
  --color-primary-soft: 30 27 75;    /* un pastel sur fond sombre éblouit */
}
```

Aucun écran n'écrit `dark:` pour une couleur : il utilise le jeton sémantique
(`bg-surface`, `text-muted`) et c'est ce fichier qui le résout. C'est ce qui
permet de rethémer une application entière ici.

**Deux fichiers à synchroniser** : `src/design-system/tokens.ts` reprend les
mêmes valeurs en hexadécimal, parce que Recharts écrit les couleurs en
attributs SVG — et un attribut SVG ne résout pas `var()`. Une modification dans
l'un doit être reportée dans l'autre.

### Les couleurs de graphiques sont à part

`--color-chart-1` … `--color-chart-8` ne suivent **pas** la couleur de marque,
et ce n'est pas un oubli : une série n'est pas un état. Leur ordre est établi
pour que deux séries voisines restent distinguables en vision déficiente des
couleurs. Réordonner ou remplacer une teinte isolément casse cette garantie —
si un client impose ses couleurs, il faut revalider la suite entière.

---

## Brancher le vrai backend

1. `cp .env.example .env.local`, puis `VITE_USE_MOCKS=false` et
   `VITE_API_URL` / `VITE_PROXY_TARGET`.
2. Aligner les routes attendues dans `src/features/*/*.api.ts` — ce sont les
   seuls fichiers qui connaissent le réseau. Les composants n'importent jamais
   `axios` directement.
3. Supprimer `src/mocks/` et les branches `if (USE_MOCKS)`.

Routes attendues par défaut :

| Méthode | Route | Utilisé par |
| --- | --- | --- |
| `POST` | `/auth/login` | `authApi.login` |
| `GET` | `/auth/me` | `authApi.me` |
| `POST` | `/auth/logout` | `authApi.logout` |
| `GET` | `/users?search&role&status&sortBy&sortDir&page&pageSize` | `usersApi.list` |
| `POST` `PUT` `DELETE` | `/users`, `/users/:id` | `usersApi.*` |
| `GET` | `/dashboard/metrics?range` | `dashboardApi.metrics` |
| `GET` | `/dashboard/activity` | `dashboardApi.activity` |

**Erreurs.** `src/lib/api.ts` traduit toute panne en `ApiError { message,
status, fieldErrors }`. Si le serveur renvoie `{ errors: { email: "…" } }` sur
un 409 ou un 422, le formulaire place le message directement sur le champ
concerné — voir `UserFormModal`.

---

## Ajouter un écran

1. `src/features/<domaine>/` — `<Domaine>Page.tsx`, `<domaine>.api.ts`,
   `<domaine>.types.ts`, `<domaine>.schema.ts` si formulaire.
2. Déclarer les clés de cache dans `src/lib/query-keys.ts`. Les écrire à la
   main dans les composants finit toujours par désynchroniser une invalidation.
3. Ajouter la route dans `src/routes/router.tsx`, **sous** `ProtectedRoute` —
   qui est un layout sans chemin, donc la garde s'hérite et on ne peut pas
   l'oublier.
4. Ajouter l'entrée dans `src/components/layout/navigation.ts`.

---

## Sécurité — les limites assumées du template

Trois points à traiter avant une mise en production :

- **Le jeton vit dans `localStorage`**, donc exposé à une faille XSS. C'est le
  compromis qui permet au template de fonctionner sans backend compatible. En
  production : cookie `HttpOnly; SameSite=Strict` émis par le serveur,
  suppression de `readToken`/`storeToken`/`clearToken` et `withCredentials: true`
  sur l'instance axios.
- **`ProtectedRoute` et le filtrage du menu par rôle sont du confort, pas de la
  sécurité.** Le code de la page est déjà dans le navigateur ; seul le serveur
  peut refuser les données.
- **Les schémas Zod valident dans le navigateur** et se contournent en trois
  lignes de console. Le serveur doit appliquer les mêmes règles.

---

## Choix structurants

**Tailwind 3 et non 4** — pour partager le même `global.css` et la même forme
de configuration que le template mobile (NativeWind 4 s'appuie sur Tailwind 3).
Migrer plus tard ne touche que `tailwind.config.js` et l'en-tête de
`global.css`.

**Le tri des tableaux part au serveur.** Trier les 25 lignes de la page
affichée donnerait le « plus ancien compte de la page », pas celui de la base —
un résultat faux, et d'autant plus trompeur qu'il a l'air juste. `DataTable`
sait aussi trier localement (`manualSorting` à `false`) quand toutes les
données tiennent en mémoire.

**Le thème est appliqué avant le premier rendu** par un script inline dans
`index.html`. Sans lui, la page s'affiche en clair quelques images avant de
basculer : un flash blanc en pleine nuit. La clé `ui-theme` y est écrite en
dur — elle doit rester identique à `THEME_STORAGE_KEY`.

**Pas de bibliothèque de composants tierce.** Le kit fait environ 1 500 lignes
lisibles et modifiables, sans dépendance à faire suivre d'un projet à l'autre
ni surcouche à contourner le jour où un client veut un bouton différent.

---

## Accessibilité — ce qui est déjà en place

Lien d'évitement, piège de focus et restauration du focus dans les modales,
navigation aux flèches dans les onglets, `aria-sort` sur les colonnes triables,
`aria-live` sur les notifications, anneau de focus visible au clavier uniquement,
respect de `prefers-reduced-motion`, et statuts portés par le texte — jamais par
la couleur seule.
