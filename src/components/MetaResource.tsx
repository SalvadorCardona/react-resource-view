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

  // Only when the head belongs to this package. A host that declares its own
  // head gives every route a title of its own, and writing over it from here
  // would leave every page carrying the name of whichever view happens to be
  // embedded in it — an article list inside a documentation page renaming the
  // documentation page.
  const owned = ownsDocumentHead && !currentResource.parentResource

  useEffect(() => {
    if (!owned) return
    document.title = pageTitle
  }, [pageTitle, owned])

  // A nested resource must not overwrite the page metadata of the view
  // containing it.
  if (currentResource.parentResource) return null

  // The host router declares the head itself; emitting these too would leave
  // the page with two of every tag.
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
