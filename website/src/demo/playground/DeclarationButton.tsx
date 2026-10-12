import { lazy, Suspense, useState } from "react"
import { FileCode } from "lucide-react"
import { useCurrentViewResourceContext } from "react-resource-view"
import { DECLARATIONS, findLayoutLines } from "@/demo/playground/declarations"

const DeclarationPanel = lazy(() => import("@/demo/playground/DeclarationPanel"))

/**
 * The button of the top bar that opens the declaration of the screen being
 * looked at, on the lines of the layout it is displayed in.
 *
 * It reads the current context itself, so it follows the reader from one
 * resource and one layout to the next without the scope knowing about it.
 */
export function DeclarationButton() {
  const context = useCurrentViewResourceContext()
  const [open, setOpen] = useState(false)

  const declaration = DECLARATIONS[context.resourceId]

  if (!declaration) return null

  const variant = context.resource.view?.viewVariants?.find(
    (candidate) => candidate.id === context.viewVariant
  )
  const layout = findLayoutLines(declaration.source, variant?.name)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-view/50 bg-view-soft px-3 py-1.5 text-sm font-medium text-view transition hover:-translate-y-0.5"
      >
        <FileCode className="size-4" />
        View the declaration
      </button>

      {open && (
        <Suspense fallback={null}>
          <DeclarationPanel
            declaration={declaration}
            layout={layout}
            layoutName={variant?.name}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </>
  )
}
