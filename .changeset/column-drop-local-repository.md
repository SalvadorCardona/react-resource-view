---
"react-resource-view": patch
---

Save a card moved to another column of a board kept in the local repository,
instead of answering "Une erreur est survenue" and putting the card back.

The drop sent only the short identifier of the record (`12`), which the local
repository compared to the `@id` it keys records on (`/tasks/12`) and never
found. It now finds the dropped row again and sends the whole identity the
dialect reads it by — `@id` and `id` for JSON-LD, `documentId` for Strapi, the
primary key for Supabase — so every repository addresses the record as before.
A card dropped back into its own column sends nothing.

The error a failed update shows is now the translatable key `An error occurred`,
also used when a list or a calendar fails to load, rather than a French sentence.
Applications translating `Une erreur est survenue` should add the new key.
