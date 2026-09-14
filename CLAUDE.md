# CLAUDE.md

## Ce que fait le projet

`react-resource-view` génère les vues CRUD (liste, détail, création, édition,
suppression) d'une ressource JSON-LD/Hydra à partir d'une seule déclaration,
bâti sur `react-data-form` pour les formulaires et `jsonld-repository` pour
l'accès aux données. Un système de dialectes permet aussi de parler à d'autres
API (Strapi, Supabase) sans changer la déclaration de la ressource.

## Stack

- React 19 + TypeScript, `strict` activé.
- Build avec **tsdown** (sortie ESM uniquement, bannière `"use client"` pour
  compatibilité RSC).
- Tests avec **vitest** (+ Testing Library, environnement `jsdom`).
- Lint avec **eslint** (config plate, `eslint-config-prettier` pour ne pas
  entrer en conflit avec Prettier).
- Formatage avec **Prettier** (`semi: false`, `printWidth: 85`).
- Gestionnaire de paquets **pnpm 10.33.2**, **Node 22** en CI.
- Versionning avec **Changesets** (`commit: false` : un changeset créé
  localement doit être commité à la main).
- Dépendances runtime clés : `jsonld-api-client`, `jsonld-item`,
  `jsonld-repository`, `coooking-pubsub`.
- Peer dependencies : `react`, `react-dom`, `react-data-form`,
  `resource-registry`, `react-mini-i18n` ; `tailwindcss` et
  `@tanstack/react-router` sont des peers optionnels.

## Commandes

```bash
pnpm install          # installation
pnpm run dev           # tsdown en mode watch
pnpm run build          # build de la librairie (dist/)
pnpm run test           # vitest run
pnpm run lint            # eslint .
pnpm run typecheck        # tsc --noEmit
pnpm run ci                # typecheck puis lint puis test puis build, dans cet ordre (ordre CI)
```

Documentation du dépôt (pages de référence, testées avec le reste du
paquet) :

```bash
pnpm run docs:dev     # site de doc en local (docs/vite.config.ts)
pnpm run docs:build    # build statique du site de doc
```

`cli/` et `website/` sont des projets à part (voir arborescence
ci-dessous) : ils ne se lancent pas avec les commandes ci-dessus.

## Arborescence utile

- `src/` — code de la librairie, organisé par domaine : `action/` (boutons
  d'action), `api/` (repository REST, dialectes), `components/`, `hook/`,
  `internal/` (utilitaires non exportés), `menu/`, `provider/` (contextes
  React), `routes/`, `scope/`, `tanstack/` (adaptateur `@tanstack/react-router`,
  point d'entrée séparé), `ui/`, `utils/`, `views/` (une vue par action CRUD :
  `list`, `read`, `update`, `remove`).
- `cli/` — commande `react-resource-view` (Node ESM pur, pas de build, pas de
  types DOM navigateur).
- `website/` — site public déployé (landing page + playground), projet
  autonome avec son propre `package.json` et son propre `pnpm-lock.yaml` ; il
  installe `react-resource-view` depuis npm, pas depuis ce dépôt.
- `docs/` — pages de documentation de référence, importent la librairie
  directement depuis `src/` (pas depuis `dist/`) et sont testées par vitest
  avec le reste du paquet.
- `diagrams/` — source du diagramme d'architecture
  (`react-resource-view.architecture.json`) et images générées, publiées sur
  le site et dans le README.

## Conventions

- Alias d'import `@/*` → `src/*` (voir `tsconfig.json`, `vitest.config.ts`).
- Tests colocalisés à côté du code : `Truc.test.ts(x)`. Un test qui touche à
  la compatibilité d'un backend réel se nomme `*.integration.test.tsx`.
- `@typescript-eslint/no-explicit-any` est désactivé délibérément : les
  données de formulaire n'ont une forme connue qu'à l'exécution.
- Messages de commit au format `type(scope): description` (`feat`, `fix`,
  `docs`, `chore` ; scopes `views`, `api`, `cli`, `website`, `docs`…), la
  description décrivant l'effet plutôt que le changement technique — souvent
  sous la forme « fait X, pas Y » (voir l'historique Git pour des exemples).
- `pnpm run format` / `format:check` appliquent Prettier ; ne pas ajouter de
  règle de style dans eslint qui le doublonnerait.

## Pièges connus

- **`tsdown.config.ts` a une liste `external` explicite** (`react`,
  `react-dom`, `react-mini-i18n`, `jsonld-item`, `resource-registry`,
  `react-data-form`, `@tanstack/react-router`…). Toute nouvelle dépendance
  destinée à rester une peer dependency doit y être ajoutée, sinon elle se
  retrouve embarquée dans `dist/` et peut dupliquer React chez le
  consommateur.
- Ne pas retirer la bannière `"use client"` de la sortie tsdown : elle est
  nécessaire pour que les composants restent utilisables dans un hôte RSC.
- `website/` a son propre lockfile et ses propres scripts (`typecheck`,
  `build`) ; il n'est ni lint-é ni testé par les commandes racine
  (`eslint.config.js` l'ignore explicitement, tout comme `docs/dist/**` et
  `.claude/**`). Une modification dans `src/` n'apparaît sur le site public
  qu'après publication npm — `docs/`, lui, importe directement depuis `src/`.
- `.claude/` contient des skills d'agents restaurées via `skills-lock.json`
  (ex. `archify` pour le diagramme d'architecture) : ce sont des artefacts
  tiers, pas du code du paquet ; ils se restaurent avec `npx skills add`, pas
  à la main.
- `vitest.setup.ts` polyfille `window.matchMedia` et `EventSource`, absents
  de jsdom mais utilisés par les composants responsives au montage — les
  retirer fait échouer les tests silencieusement plutôt que clairement.
- Un changeset créé avec `pnpm changeset` n'est pas commité automatiquement
  (`commit: false` dans `.changeset/config.json`) : il faut l'ajouter au
  commit soi-même. Le bump de version et la publication npm sont ensuite
  gérés par la CI (`release.yml`) via une pull request « Version Packages »,
  pas manuellement.
