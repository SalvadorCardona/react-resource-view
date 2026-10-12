import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

/**
 * Runs after the build (see package.json) and fails when an internal link of
 * the static output points at a page or file the output does not hold.
 *
 * GitHub Pages answers such a link with a 404 — and it did, for every link
 * written in the body of a page, when the `/<repository>/` prefix went missing.
 * Reading the built HTML rather than the sources catches that whatever
 * component produced the link.
 *
 * Like `generate-seo-files.ts`, this is a plain Node script outside Vite: the
 * base comes from `DOCS_BASE`, read the way vite.config.ts reads it.
 */
const BASE = process.env.DOCS_BASE ?? "/"
const OUT_DIR = join(import.meta.dirname, "..", "dist", "client")

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return htmlFiles(path)
    return name.endsWith(".html") ? [path] : []
  })
}

/** The file GitHub Pages would serve for a path under the base, if any. */
function exists(path: string): boolean {
  const target = join(OUT_DIR, path)
  if (existsSync(target) && statSync(target).isFile()) return true
  return existsSync(join(target, "index.html")) || existsSync(`${target}.html`)
}

const ATTRIBUTE =
  /<(?:a|link|img|script|source|video)\b[^>]*?\s(?:href|src)="([^"]*)"/g

const broken = new Map<string, Set<string>>()
const pages = htmlFiles(OUT_DIR)

for (const page of pages) {
  const html = readFileSync(page, "utf8")

  for (const [, raw] of html.matchAll(ATTRIBUTE)) {
    // Absolute URLs, `mailto:`, `data:`… and in-page anchors are not ours.
    if (!raw.startsWith("/") || raw.startsWith("//")) continue

    const path = decodeURIComponent(raw.split(/[?#]/)[0])
    const reachable = path.startsWith(BASE) && exists(path.slice(BASE.length))

    if (!reachable) {
      const found = broken.get(raw) ?? new Set<string>()
      found.add(page.slice(OUT_DIR.length))
      broken.set(raw, found)
    }
  }
}

if (broken.size > 0) {
  for (const [link, from] of broken) {
    console.error(`broken: ${link}\n  found in ${[...from].join(", ")}`)
  }
  console.error(`\n${broken.size} internal link(s) lead to a 404 under ${BASE}`)
  process.exit(1)
}

console.log(`check-links: ${pages.length} pages, no broken internal link`)
