import {
  ApiDialectInterface,
  ApiErrorPayloadInterface,
} from "@/api/apiDialectInterface"
import { getApiDialect } from "@/api/apiConfig"

/**
 * A request the API refused.
 *
 * It keeps the status and the body untouched; reading them is the dialect's
 * job, through {@link normalizeApiError}.
 */
export class ApiRequestError extends Error {
  readonly status: number
  readonly url: string
  readonly payload: unknown

  constructor({
    status,
    url,
    payload,
    message,
  }: {
    status: number
    url: string
    payload: unknown
    message?: string
  }) {
    super(message ?? `The API answered ${status} for ${url}`)
    this.name = "ApiRequestError"
    this.status = status
    this.url = url
    this.payload = payload
  }
}

interface JsonLdApiErrorShape {
  response?: { status?: number; data?: unknown }
}

/**
 * Reads whatever the repository threw into the one error shape the forms and
 * the toasts understand.
 *
 * It covers the three ways an API failure reaches here: an
 * {@link ApiRequestError} from this package's own repository, the `ApiError` of
 * `jsonld-api-client`, and a body a custom repository threw on its own.
 * Returns `undefined` when the error is not an API failure at all — a network
 * outage, a bug — which the caller should let through rather than dress up as
 * a validation message.
 */
export function normalizeApiError(
  error: unknown,
  dialect: ApiDialectInterface = getApiDialect()
): ApiErrorPayloadInterface | undefined {
  if (!error || typeof error !== "object") return undefined

  if (error instanceof ApiRequestError) {
    return (
      dialect.normalizeError(error.payload, error.status) ?? { status: error.status }
    )
  }

  // `jsonld-api-client` wraps the body in a response envelope. Recognised by
  // its shape rather than by an import, so a dialect that never loads that
  // package still reads the error of one that did.
  const response = (error as JsonLdApiErrorShape).response
  if (response && "data" in response) {
    return (
      dialect.normalizeError(response.data, response.status) ?? {
        status: response.status,
      }
    )
  }

  const payload = (error as { data?: unknown }).data
  if (payload !== undefined) {
    return dialect.normalizeError(payload) ?? undefined
  }

  return undefined
}
