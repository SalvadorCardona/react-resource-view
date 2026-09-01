import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { Trans, translate } from "react-mini-i18n"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import { FilterInterface } from "@/views/list/filter/useFilter"
import { ApiDialectInterface } from "@/api/apiDialectInterface"
import { getApiConfig, resolveDialect } from "@/api/apiConfig"
import { resolveRequestUrl } from "@/api/restRepository"

/**
 * Downloads the CSV export the dialect described.
 *
 * It goes through `fetch` rather than a plain anchor so the request can carry
 * the authentication and the headers the dialect asks for — an anchor carries
 * neither.
 */
async function downloadExport(
  dialect: ApiDialectInterface,
  path: string,
  filter: FilterInterface,
  fileName: string
): Promise<void> {
  const request = dialect.exportRequest?.(path, filter)
  if (!request) return

  const config = getApiConfig()
  const headers: Record<string, string> = {
    Accept: "text/csv",
    ...config.getHeaders(),
    ...(request.headers ?? {}),
  }

  const token = config.getAuthToken()
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await config.fetch(
    resolveRequestUrl(request.url, config.baseUrl),
    { method: request.method, headers }
  )
  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`)
  }

  const blob = await response.blob()
  const objectUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(objectUrl)
}

export function ExportButton() {
  const currentResource = useCurrentViewResourceContext()
  const listViewContext = useListViewContext()
  const [isExporting, setIsExporting] = useState(false)

  const view = currentResource.view
  const dialect = resolveDialect(currentResource.resource)

  // A backend with no CSV endpoint — Strapi, as it stands — describes no
  // export request, and the button stays out of the way rather than offering
  // a download that would 404.
  if (!view?.behavior?.canExport || !dialect.exportRequest) {
    return null
  }

  const handleExport = async () => {
    const path = currentResource.resource?.path
    if (!path) return

    setIsExporting(true)
    try {
      const filter = listViewContext.filterContext?.filter ?? {}
      const fileName = `${view.name ?? currentResource.resource?.name ?? "export"}.csv`
      await downloadExport(dialect, path, filter, fileName)
    } catch {
      toast.error(translate("The export failed. Please try again."))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
      {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
      <Trans>Exporter</Trans>
    </Button>
  )
}

export default ExportButton
