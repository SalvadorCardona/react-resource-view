---
"react-resource-view": minor
---

Add `npx react-resource-view init`: it starts a back office on your API — API
Platform, Spring Boot, another REST API, Supabase, Strapi or FastAPI — with the
dialect wired, the URL in `.env`, and `api-schema` / `api-schema:check` scripts
that dump the OpenAPI schema into TypeScript with api-dumper.

Add a Spring Boot dialect: `springDialect()` pages with `page` (from 0) and
`size`, sorts with `sort=field,desc`, reads a `Page`, a `PagedModel` or Spring
Data REST's HAL, and pins Bean Validation errors on their field.
