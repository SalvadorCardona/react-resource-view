import { FC, useEffect, useMemo, useRef, useState } from "react"
import { Trans } from "react-mini-i18n"
import { Edit } from "lucide-react"
import { buttonVariants } from "@/ui/button"
import { Link, useNavigate } from "@/ports"
import { generateLink } from "@/routes/routes"
import { findResource } from "@/utils/findResource"
import { usePermission } from "@/utils/permissionResource"
import { ActionList } from "react-data-form"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import ViewResourceContextProvider from "@/provider/ViewResourceContextProvider"
import {
  forgetChildViewOpener,
  hasChildViewMounted,
  readChildViewOpener,
  trackChildViewMounted,
} from "@/components/childViewOpener"
import { cn } from "@/ui/cn"
import { isDevelopment } from "@/definition/validateDefinition"
import { BUILT_IN_OPEN, type OpenFrame } from "@/open/open"
import { useChildViewRoute, useInlineChildView } from "@/open/childViewRoute"
import type { BuiltInFrameProps } from "@/open/frames"
import type { RowInterface } from "@/ViewResource"

export interface ChildViewResourceDialogProps {
  childViewResource: ViewResourceContextParams
  /**
   * Whether a list on screen draws the views opened inline under its rows: a
   * view opened inline is then left to it.
   */
  inlineClaimed?: boolean
}

const warned = new Set<string>()

function warnOnce(key: string, message: string) {
  if (!isDevelopment() || warned.has(key)) return
  warned.add(key)
  console.warn(message)
}

/**
 * Renders a view pointed at by the URL on top of the routed view:
 * .../{resourceId}/{action}/{id}/{childResourceId}/{childAction}/{childId}
 *
 * The frame is the one the child view declares (`views.<action>.open`).
 * Closing it returns to the routed view's URL. A view opened inline is drawn
 * by the list under its row; with no such list on screen — a board, a
 * calendar, a timeline — it falls back to a dialog.
 */
export function ChildViewResourceDialog({
  childViewResource,
  inlineClaimed = false,
}: ChildViewResourceDialogProps) {
  const childResource = findResource(childViewResource)
  // Whether the lists on screen had the time to say they draw the inline
  // views: their layout effects run before this one.
  const [settled, setSettled] = useState(false)
  useEffect(() => setSettled(true), [])

  if (!childResource) {
    console.warn("ChildViewResourceDialog : resource enfant introuvable", {
      childViewResource,
    })
    return null
  }

  const childAction = (childViewResource.resourceAction ??
    ActionList.read) as ActionList
  const declared = childResource.views?.[childAction]?.open ?? BUILT_IN_OPEN.dialog
  let frame = declared

  if (declared.placement === "inline") {
    // A record has a row to be drawn under; a creation has none.
    if (childViewResource.id && inlineClaimed) return null
    if (childViewResource.id && !settled) return null
    warnOnce(
      `${childResource["@id"]}/${childAction}/${declared.type}`,
      `react-resource-view: views.${childAction}.open of "${childResource["@id"]}" is drawn inline, which the layout on screen cannot do — it opens in a dialog. Declare \`supports: ["inline"]\` on a layout.custom() that draws <InlineChildView />.`
    )
    frame = BUILT_IN_OPEN.dialog
  }

  return <ChildViewFrame childViewResource={childViewResource} frame={frame} />
}

/**
 * The view opened inline under a row, when the URL holds it — for a layout
 * declaring `supports: ["inline"]`.
 */
export function InlineChildView({ row }: { row: RowInterface }) {
  const child = useInlineChildView(row.data)
  if (!child) return null
  const resource = findResource(child)
  const action = (child.resourceAction ?? ActionList.read) as ActionList
  const frame = resource?.views?.[action]?.open
  if (!frame) return null

  return <ChildViewFrame childViewResource={child} frame={frame} />
}

interface ChildViewFrameProps {
  childViewResource: ViewResourceContextParams
  frame: OpenFrame
}

/**
 * One view opened from another, in its frame: the title, the view, the way
 * back to the URL it was opened from, and the focus given back once it is
 * gone. Whatever draws the frame — a dialog, a drawer, an accordion of one's
 * own — gets the same.
 */
function ChildViewFrame({ childViewResource, frame }: ChildViewFrameProps) {
  const parentResource = useCurrentViewResourceContext()
  const route = useChildViewRoute()
  const navigate = useNavigate()

  const childResource = findResource(childViewResource)!
  const childAction = (childViewResource.resourceAction ??
    ActionList.read) as ActionList
  const childView = childResource.views?.[childAction]
  // Asked without the record, which loads inside the frame: the update view
  // checks it again, record in hand, before drawing its form.
  const canUpdate = usePermission(ActionList.update, undefined, childResource)

  // A record saved in the frame is what the view underneath shows when it is
  // that record — a page reading it. A list reads itself again on its own.
  const fetchParent = useRef(parentResource.fetchData)
  fetchParent.current = parentResource.fetchData
  useEffect(() => {
    if (parentResource.resource !== childResource) return
    if (parentResource.resourceAction === ActionList.list) return
    const sub = childResource.onChange.subscribe(() => fetchParent.current())
    return () => sub.unsubscribe()
  }, [childResource, parentResource.resource, parentResource.resourceAction])

  const [opener] = useState(() =>
    readChildViewOpener(childResource["@id"], childViewResource.id)
  )

  // However the frame goes — its own close, the browser's Back — the focus
  // goes back to what opened it. Checked a moment later: a frame dropped and
  // drawn again at once (React's strict mode, a host suspending on the way)
  // is not the frame going.
  useEffect(() => {
    const untrack = trackChildViewMounted()
    return () => {
      untrack()
      setTimeout(() => {
        if (hasChildViewMounted()) return
        if (opener.element?.isConnected) opener.element.focus()
      })
    }
  }, [opener])

  // The filter and the layout of the view underneath travel with every link
  // built from here: closing the frame must not land on another list.
  const parentParams: ViewResourceContextParams = route?.parentParams ?? {
    resource: parentResource.resource,
    resourceAction: parentResource.resourceAction,
    id: parentResource.id,
    scope: parentResource.resource?.scope ?? parentResource.scope,
    subResource: parentResource.subResource,
    filter: parentResource.filter,
    viewVariantId: parentResource.viewVariant,
  }
  const parentLink = generateLink(parentParams)

  const close = () => {
    forgetChildViewOpener()
    if (opener.pushed && typeof window !== "undefined") {
      window.history.back()
    } else {
      navigate({ to: parentLink })
    }
  }

  // Handed to the view, so a form closes its frame once saved and a deletion
  // as soon as it is confirmed. One object for the frame's whole life: the
  // view is not drawn again for a new one.
  const closeRef = useRef(close)
  closeRef.current = close
  const overlay = useMemo(() => ({ close: () => closeRef.current() }), [])

  const updateFrame = childResource.views?.update?.open
  const editLink =
    childAction === ActionList.read && childViewResource.id && canUpdate
      ? updateFrame?.placement === "page"
        ? generateLink({
            resource: childResource,
            resourceAction: ActionList.update,
            id: childViewResource.id,
            scope: childResource.scope ?? parentParams.scope,
          })
        : generateLink({
            ...parentParams,
            childViewResource: {
              resource: childResource,
              resourceAction: ActionList.update,
              id: childViewResource.id,
            },
          })
      : undefined

  const editButton = editLink && (
    <Link
      to={editLink}
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        // Under the title, which a panel coming up from the bottom centres.
        "w-fit group-data-[swipe-axis=y]/drawer-popup:self-center md:self-start"
      )}
      // Replaced rather than pushed when it stays over the same page: the
      // frame is one entry of the history whatever it shows, and Back still
      // closes it.
      onClick={(e) => {
        if (updateFrame?.placement === "page") {
          forgetChildViewOpener()
          return
        }
        e.preventDefault()
        navigate({ to: editLink, replace: true })
      }}
    >
      <Edit />
      <Trans className="fc">update</Trans>
    </Link>
  )

  // The record on its own page, in the child's own scope.
  const expandHref =
    childView?.expandable && childViewResource.id
      ? generateLink({
          resource: childResource,
          resourceAction: childAction,
          id: childViewResource.id,
          scope: childResource.scope ?? parentParams.scope,
        })
      : undefined

  const content = (
    <ViewResourceContextProvider
      key={childAction}
      resource={childResource}
      resourceAction={childAction}
      id={childViewResource.id}
      overlay={overlay}
      defaultData={
        childAction === ActionList.create
          ? (childViewResource.defaultData ?? parentResource.defaultData)
          : undefined
      }
    />
  )

  if (!frame.component && frame.placement !== "page") {
    warnOnce(
      `frame/${frame.type}`,
      `react-resource-view: no frame is registered as "${frame.type}" — it opens in a dialog. Register it with configureResourceView({ open: { ${frame.type} } }).`
    )
  }
  // A view whose `open` is `page` reached through a URL written under
  // another view — a link shared before the declaration changed — is drawn
  // over it all the same.
  const Frame = (frame.component ??
    BUILT_IN_OPEN.dialog.component!) as FC<BuiltInFrameProps>

  /* A frame needs a name — assistive technology announces it, and a form
     opening over a list has to say which record it is about. The view's own
     `title` is that name; its `description` is not, because every action
     inherits the one written for the list and would introduce an edit form
     with the sentence that introduces the table. */
  return (
    <Frame
      title={<Trans>{childView?.title ?? childAction}</Trans>}
      close={close}
      expandHref={expandHref}
      actions={editButton}
      className={childView?.className}
    >
      {content}
    </Frame>
  )
}
