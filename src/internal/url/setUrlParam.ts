import { isBrowser } from "@/internal/browser/isBrowser"

export function setUrlParam(paramKey: string, paramValue: string): void {
  if (!isBrowser()) return

  const url = new URL(window.location.href)
  const prevScroll = { x: window.scrollX, y: window.scrollY }

  url.searchParams.set(paramKey, paramValue)
  window.history.replaceState({}, "", url.toString())

  // Restore the scroll position on the browser's next paint
  // Cela aide quand du code asynchrone suit le changement d'URL.
  window.requestAnimationFrame(() => {
    window.scrollTo(prevScroll.x, prevScroll.y)
  })
}
