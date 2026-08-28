import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export const THEME_STORAGE_KEY = "rrv-docs-theme"

/**
 * Runs before the first paint, so the page never flashes the wrong theme.
 *
 * It is inlined into the document head as a blocking script rather than an
 * effect: an effect runs after hydration, which is several frames too late for
 * a background colour.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var dark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  // The server cannot know the reader's preference, so the button renders in
  // its light state and corrects itself once mounted.
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light")
    } catch {
      // Private browsing: the choice simply does not survive the session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to the light theme" : "Switch to the dark theme"}
      className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  )
}
