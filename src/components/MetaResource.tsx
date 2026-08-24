import { useEffect } from "react"
import { getPorts } from "@/ports"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"

export default function MetaResourceComponent() {
  const currentResource = useCurrentViewResourceContext()
  const { appName, description, appUrl, ownsDocumentHead } = getPorts()
  // Read through the navigation port rather than `window.location`: there is
  // no `window` while rendering on a server, and a page whose metadata throws
  // renders nothing at all — which is precisely the markup a crawler reads.
  const { pathname } = getPorts().navigation.useLocation()
  const viewName = currentResource?.view?.name ?? appName
  const pageTitle = viewName === appName ? viewName : `${viewName} · ${appName}`
  const canonical = `${appUrl}${pathname}`

  useEffect(() => {
    if (currentResource.parentResource) return
    document.title = pageTitle
  }, [pageTitle, currentResource.parentResource])

  // A nested resource must not overwrite the page metadata of the view
  // containing it.
  if (currentResource.parentResource) return null

  // The host router declares the head itself; emitting these too would leave
  // the page with two of every tag. The effect above still keeps the title in
  // step as the visitor moves between views.
  if (!ownsDocumentHead) return null

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={canonical} />
    </>
  )
}
