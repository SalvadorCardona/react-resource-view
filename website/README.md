# Resource & Form — documentation site

The public documentation for
[`react-data-form`](https://github.com/SalvadorCardona/react-data-form) and
[`react-resource-view`](https://github.com/SalvadorCardona/react-resource-view),
built with [TanStack Start](https://tanstack.com/start).

The prose is rendered on the server; the examples are mounted in the browser and
are genuinely live — the forms submit, the lists filter, the records can be
created, edited and deleted.

## Why TanStack Start

`react-resource-view` keeps its whole view context in the URL and ships an
adapter for TanStack Router. Running the site on that router means the demos go
through the same navigation port the documentation recommends, instead of a
bespoke one written for the site — and the server rendering costs nothing extra.

## Running it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck
pnpm build      # dist/client + dist/server
pnpm start      # serves the build on $PORT (3000 by default)
```

This is a standalone project: it has its own `package.json` and lockfile, and it
consumes both libraries **from npm**, at the versions a reader would install.
It does not build against the working tree of the repository it lives in, so
the documented API is always the published one.

`pnpm start` runs `server.mjs`, a small `node:http` bridge over the fetch
handler `vite build` emits. A host that takes a fetch handler directly can
import `dist/server/server.js` and ignore that file.

## Layout

```
src/
  routes/
    index.tsx              landing page
    playground.tsx         a complete app built from two resource declarations
    docs.tsx               the docs shell: header + split sidebar
    docs/form/*            react-data-form           (11 pages)
    docs/resource-view/*   react-resource-view       (12 pages)
  components/              DocArticle, CodeBlock, Demo, FormDemo, ResourceDemo…
  demo/                    fixtures, the two demo resources, library setup
  lib/navigation.ts        the sidebar model — the source of truth for pages
  styles/app.css           the theme, and the shadcn variables both libraries read
```

### The sidebar is split in two

`src/lib/navigation.ts` holds one section per package, each with its own colour,
npm name and repository link. Adding a page means adding a route file and an
entry there — `DocPage["href"]` is typed against the generated route tree, so an
entry pointing at a page that does not exist fails to compile.

### Adding a page

1. Create `src/routes/docs/<section>/<page>.tsx`, exporting a `Route` built with
   `createFileRoute` and rendering `<DocArticle toc={…}>`.
2. Add it to the matching group in `src/lib/navigation.ts`.

The title, summary, section badge and prev/next pager are all read from the
navigation model, so the page file only holds its own content.

## Deploying

Any Node host works: build, then run `pnpm start` with `PORT` set. The output is
a static `dist/client` plus an SSR handler, so a platform adapter can serve the
first from a CDN and the second from a function.

## Licence

MIT, like both packages.
