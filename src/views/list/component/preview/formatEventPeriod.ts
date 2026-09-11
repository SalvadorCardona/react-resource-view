import { format, isSameDay } from "date-fns"
import { getDateLocale } from "@/ports"

/**
 * When an event happens, written on one line.
 *
 * A calendar event is read by the hour — "Tuesday 4 March, 09:00 - 10:30" —
 * while a timeline bar spans days and its hours say nothing, hence
 * `withTime`. An event opening and closing on the same day names that day
 * once, rather than twice around a dash.
 */
export function formatEventPeriod(
  start: Date,
  end: Date,
  withTime: boolean = true
): string {
  const locale = getDateLocale()

  if (isSameDay(start, end)) {
    const day = format(start, "EEEE d MMMM", { locale })
    if (!withTime) return day
    return `${day}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`
  }

  const pattern = withTime ? "d MMM HH:mm" : "d MMM"
  return `${format(start, pattern, { locale })} - ${format(end, pattern, { locale })}`
}
