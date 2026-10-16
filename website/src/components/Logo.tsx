import { cn } from "@/lib/cn"

// BASE_URL already ends in a slash, and carries the /<repository>/ prefix
// GitHub Pages serves a project site under.
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`

/**
 * The react-resource-view mark, in the light or the dark version according to
 * the theme: a checklist whose first box is ticked, in the outlined square of the
 * Hermez family. Decorative — the name is always written next to it.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <>
      <img
        src={asset("rrv-symbol.svg")}
        alt=""
        className={cn("size-7 dark:hidden", className)}
      />
      <img
        src={asset("rrv-symbol-dark.svg")}
        alt=""
        className={cn("hidden size-7 dark:block", className)}
      />
    </>
  )
}

/** The symbol and the name, "A Hermez product" underneath: the site's masthead. */
export function FullLogo({ className }: { className?: string }) {
  return (
    <>
      <img
        src={asset("rrv-logo.svg")}
        alt="React Resource View"
        className={cn("h-9 w-auto dark:hidden", className)}
      />
      <img
        src={asset("rrv-logo-dark.svg")}
        alt="React Resource View"
        className={cn("hidden h-9 w-auto dark:block", className)}
      />
    </>
  )
}
