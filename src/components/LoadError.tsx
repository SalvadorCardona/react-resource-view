import { RefreshCw, TriangleAlert } from "lucide-react"
import { Trans, translate } from "react-mini-i18n"
import { Button } from "@/ui/button"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { normalizeApiError } from "@/api/apiRequestError"
import { resolveDialect } from "@/api/apiConfig"
import type { LoadErrorProps } from "@/ResourceDefinition"

/**
 * What a view draws in place of its records when they could not be loaded:
 * the view's `components.error`, or {@link LoadErrorMessage}. Rather than an
 * empty list, which says "there is nothing" when the truth is "we could not
 * ask".
 */
export function LoadError() {
  const currentResource = useCurrentViewResourceContext()
  const Custom = currentResource.view?.components?.error
  const props: LoadErrorProps = {
    error: currentResource.loadError,
    retry: () => void currentResource.fetchData(),
  }

  if (Custom) return <Custom {...props} />

  return <LoadErrorMessage {...props} />
}

/** The default `error` component: what the API answered, and "Try again". */
export function LoadErrorMessage({ error, retry }: LoadErrorProps) {
  const currentResource = useCurrentViewResourceContext()
  const apiError = normalizeApiError(error, resolveDialect(currentResource.resource))
  const detail =
    apiError?.detail ??
    apiError?.title ??
    (error instanceof Error && !apiError ? error.message : undefined)

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <TriangleAlert aria-hidden className="size-8 text-destructive" />
      <p className="font-medium text-foreground">
        <Trans>The data could not be loaded</Trans>
      </p>
      {(detail || apiError?.status) && (
        <p className="max-w-md text-sm text-muted-foreground">
          {apiError?.status ? `${apiError.status} — ` : ""}
          {detail ?? translate("The server answered with an error.")}
        </p>
      )}
      <Button variant="secondary" size="sm" onClick={retry}>
        <RefreshCw />
        <Trans>Try again</Trans>
      </Button>
    </div>
  )
}
