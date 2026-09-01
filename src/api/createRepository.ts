import { ApiDialectInterface } from "@/api/apiDialectInterface"
import { resolveDialect } from "@/api/apiConfig"
import { restRepository } from "@/api/restRepository"
import { AsyncRepositoryInterface, httpRepository } from "jsonld-repository"
import { IdAbleInterface } from "jsonld-item"

/**
 * The repository a resource gets when it declares a path and no CRUD of its
 * own.
 *
 * JSON-LD keeps the repository of `jsonld-repository`: it goes through the
 * OpenAPI client an API Platform application has already configured —
 * middleware, scope header and typed paths included — and nothing about that
 * setup should change because the package learned other dialects. Every other
 * dialect goes through {@link restRepository}, which needs no client at all.
 */
export function createRepository<T extends IdAbleInterface = IdAbleInterface>({
  path,
  dialect,
}: {
  path: string
  dialect?: ApiDialectInterface
}): AsyncRepositoryInterface<T> {
  const current = dialect ?? resolveDialect()

  if (current.name === "json-ld") {
    return httpRepository<T>({ path })
  }

  return restRepository<T>({ path, dialect: current })
}
