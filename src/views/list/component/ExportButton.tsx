import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { Trans, translate } from "react-mini-i18n"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { useListViewContext } from "@/views/list/provider/useListViewContext"
import { FilterInterface } from "@/views/list/filter/useFilter"
import { getClientConfig } from "jsonld-api-client"

/**
 * Builds the export query string from the list's current filters.
 *
 * It reuses the very keys and values sent to the collection GET, so the export
 * matches the search already on screen.
 */
function buildExportQuery(filter: FilterInterface): string {
  const params = new URLSearchParams()
  Object.entries(filter ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(`${key}[]`, String(item)))
      return
    }
    params.append(key, String(value))
  })
  // The export covers every filtered row, not just the page being viewed, so
  // server-side pagination is switched off.
  params.set("pagination", "false")
  return params.toString()
}

/**
 * Downloads the CSV export from the API.
 *
 * It goes through `fetch` rather than a plain anchor so the request can carry
 * the authentication and scope headers, exactly like the client middleware does.
 */
async function downloadExport(
  path: string,
  filter: FilterInterface,
  fileName: string
): Promise<void> {
  const query = buildExportQuery(filter)
  const url = `${path}.csv${query ? `?${query}` : ""}`

  const headers: Record<string, string> = { Accept: "text/csv" }
  // Same credentials as every other request: read from the client config
  // rather than from a session package this view would otherwise depend on.
  const token = getClientConfig().getAuthToken()
  if (token) {
    headers["Authorization"] = "Bearer " + token
  }
  const scope = getClientConfig().getScope()
  if (scope) {
    headers["X-Scope"] = scope
  }

  const response = await fetch(url, { headers })
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
  if (!view?.behavior?.canExport) {
    return null
  }

  const handleExport = async () => {
    const path = currentResource.resource?.path
    if (!path) return

    setIsExporting(true)
    try {
      const filter = listViewContext.filterContext?.filter ?? {}
      const fileName = `${view.name ?? currentResource.resource?.name ?? "export"}.csv`
      await downloadExport(path, filter, fileName)
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
