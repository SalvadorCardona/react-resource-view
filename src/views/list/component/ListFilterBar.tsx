import { PropsWithChildren } from "react"
import { ScrollArea } from "@/ui/scroll-area"
import { cn } from "@/ui/cn"

/**
 * Classes for the filter row, applied to the form itself: a single line, no
 * wrapping, every field keeping its width (`shrink-0`) so overflow scrolls
 * rather than squashing the controls.
 */
export const listFilterFormClassName =
  "flex flex-nowrap items-end gap-3 pb-2 [&>*]:shrink-0"

/**
 * Filter bar of a list: the filters read as a single line, which scrolls
 * horizontally when space runs short.
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
