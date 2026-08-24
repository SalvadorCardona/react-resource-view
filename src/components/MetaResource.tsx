import { useEffect } from "react"
import { getPorts } from "@/ports"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"

export default function MetaResourceComponent() {
  const currentResource = useCurrentViewResourceContext()
  const { appName, description, appUrl } = getPorts()
  const viewName = currentResource?.view?.name ?? appName
  const pageTitle = viewName === appName ? viewName : `${viewName} · ${appName}`
  useEffect(() => {
    if (currentResource.parentResource) return
    document.title = pageTitle
  }, [pageTitle, currentResource.parentResource])

  // A nested resource must not overwrite the page metadata of the view
  // containing it.
  if (currentResource.parentResource) return null

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={pageTitle} />
      <meta
        property="og:url"
        content={`${appUrl}${window.location.pathname}`}
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={`${appUrl}${window.location.pathname}`} />
    </>
  )
}
