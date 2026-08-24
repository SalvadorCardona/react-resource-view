import { PropsWithChildren } from "react"
import { ScrollArea } from "@/ui/scroll-area"
import { cn } from "@/ui/cn"

/**
 * Classes for the filter row, applied to the form itself: a
 * seule ligne, sans retour, dont chaque champ garde sa largeur (`shrink-0`)
 * so overflow scrolls rather than squashing the controls.
 */
export const listFilterFormClassName =
  "flex flex-nowrap items-end gap-3 pb-2 [&>*]:shrink-0"

/**
 * Barre de filtres d'une liste : les filtres se lisent sur une seule ligne qui
 * scrolls horizontally when space runs short.
 *
 * Stacked, they used to push the list off screen on mobile — three filters ate
 * half the usable height of the calendar.
 */
export function ListFilterBar({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <ScrollArea orientation="horizontal" className={cn("max-w-full", className)}>
      {children}
    </ScrollArea>
  )
}
