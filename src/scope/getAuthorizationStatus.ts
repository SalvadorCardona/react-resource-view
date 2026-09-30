import { ForbiddenError, UnauthorizedError } from "@/scope/scopeInterface"

/**
 * Le refus d'autorisation que porte une erreur levée par `authorization` : les
 * classes exportées, ou n'importe quel objet dont `status` vaut 401 ou 403 — une
 * lib d'auth n'a pas à importer ces classes, et deux copies de la librairie dans
 * un même bundle ne cassent pas la reconnaissance. Tout autre code est ignoré.
 */
export function getAuthorizationStatus(e: unknown): 401 | 403 | undefined {
  if (e instanceof UnauthorizedError) return 401
  if (e instanceof ForbiddenError) return 403
  if (typeof e !== "object" || e === null) return undefined
  const { status } = e as { status?: unknown }
  return status === 401 || status === 403 ? status : undefined
}
