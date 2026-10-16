/** Classes of a cell pinned to the right edge: opaque, with a shadow on its left. */
export const STICKY_ACTIONS_CELL =
  "sticky right-0 z-10 bg-background shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.25)]"

/** Classes of a cell pinned to the left edge. */
export const STICKY_FIRST_CELL =
  "sticky left-0 z-10 bg-background shadow-[8px_0_8px_-8px_rgba(0,0,0,0.25)]"

/** The same, set on a row for the first data cell (after the checkbox, if any). */
export const stickyFirstCellOfRow = (selectable: boolean) =>
  selectable
    ? "[&>td:nth-child(2)]:sticky [&>td:nth-child(2)]:left-0 [&>td:nth-child(2)]:z-10 [&>td:nth-child(2)]:bg-background [&>td:nth-child(2)]:shadow-[8px_0_8px_-8px_rgba(0,0,0,0.25)]"
    : "[&>td:nth-child(1)]:sticky [&>td:nth-child(1)]:left-0 [&>td:nth-child(1)]:z-10 [&>td:nth-child(1)]:bg-background [&>td:nth-child(1)]:shadow-[8px_0_8px_-8px_rgba(0,0,0,0.25)]"
