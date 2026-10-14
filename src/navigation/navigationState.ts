/**
 * Whether the application is moving from one view to the next, whatever the
 * router.
 *
 * Three signals feed it:
 *
 * - the router's own, when its adapter provides `useIsNavigating` — TanStack
 *   Router knows while it resolves a route;
 * - a click on a link of the library, or a call to its `navigate`, which marks
 *   a navigation as started until the location changes;
 * - the view on screen loading its data or its permissions: once a navigation
 *   is under way, it lasts until the new view has what it needs. A view loading
 *   on its own — a filter applied, a page turned — starts nothing.
 */

/** A navigation still unsettled after this long is given up on. */
const SAFETY_TIMEOUT = 10_000

let routerPending = false
let started = false
let loadingViews = 0
let active = false
let locationKey: string | undefined
let safetyTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function update(): void {
  const next = routerPending || started || (active && loadingViews > 0)
  if (next === active) return
  active = next
  listeners.forEach((listener) => listener())
}

function settle(): void {
  started = false
  clearTimeout(safetyTimer)
  update()
}

const isBrowser = (): boolean => typeof window !== "undefined"

/**
 * Marks a navigation towards `to` as started. A link to the page already on
 * screen, or to another site, starts nothing: no view would come to end it.
 */
export function startNavigation(to?: string): void {
  if (isBrowser() && to !== undefined) {
    const target = new URL(to, window.location.href)
    if (target.origin !== window.location.origin) return
    if (
      target.pathname === window.location.pathname &&
      target.search === window.location.search
    ) {
      return
    }
  }

  started = true
  clearTimeout(safetyTimer)
  safetyTimer = setTimeout(settle, SAFETY_TIMEOUT)
  update()
}

/** What the router says, as read by its adapter. */
export function setRouterPending(pending: boolean): void {
  routerPending = pending
  update()
}

/**
 * The location the router now shows. A started navigation ends there: the view
 * it led to, if it still loads, has registered itself by now.
 */
export function setNavigationLocation(key: string): void {
  if (key === locationKey) return
  locationKey = key
  if (started) settle()
}

/**
 * Marks a view as loading — its data, or the answer to its permission — and
 * returns the function that marks it done.
 */
export function markViewLoading(): () => void {
  loadingViews++
  update()

  let done = false
  return () => {
    if (done) return
    done = true
    loadingViews--
    update()
  }
}

export function isNavigationActive(): boolean {
  return active
}

export function subscribeToNavigation(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** @internal Puts the state back as it starts, between tests. */
export function resetNavigationState(): void {
  routerPending = false
  started = false
  loadingViews = 0
  active = false
  locationKey = undefined
  clearTimeout(safetyTimer)
  listeners.forEach((listener) => listener())
}
