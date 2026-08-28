import { useState } from "react"
import { ActionList } from "react-data-form"
import {
  ViewResourceContextProvider,
  type ViewResourceInterface,
} from "react-resource-view"
import { seedDemoData } from "@/demo/data"
import { cn } from "@/lib/cn"

export interface ResourceDemoProps {
  resource: ViewResourceInterface
  /** Defaults to the list view, which is what most examples show. */
  action?: ActionList
  /**
   * Which layout to open on, when the resource declares several. The view
   * renders its own switcher above the list, so this only picks the default.
   */
  variant?: string
  id?: string
  className?: string
}

/**
 * A resource view running inside a documentation page.
 *
 * The context is passed as props rather than read from the address bar: a
 * documentation page is not a CRUD screen, and several examples share it. Links
 * built inside the view therefore point at the playground — see
 * `configureLibraries` — where the same context is read back from the URL.
 */
export function ResourceDemo({
  resource,
  action = ActionList.list,
  variant,
  id,
  className,
}: ResourceDemoProps) {
  // Seeding is synchronous and has to happen before the provider's first fetch,
  // which starts on mount. A state initialiser runs early enough; an effect
  // would not.
  useState(() => {
    seedDemoData()
    return null
  })

  return (
    <div className={cn("min-w-0", className)}>
      <ViewResourceContextProvider
        resource={resource}
        resourceAction={action}
        viewVariantId={variant}
        scope="docs"
        id={id}
      />
    </div>
  )
}
