import { execFileSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import {
  LOGO_LIBRARY,
  MEDIA_LIBRARY,
  type Artwork,
} from "../src/demo/builder/media.ts"

/**
 * Turns the builder's media library into the PNG files an email points at.
 *
 *   node --experimental-strip-types scripts/rasterize-email-media.ts
 *
 * The library is SVG served as data URIs, which a page draws for free and
 * Gmail refuses outright: an email needs hosted raster images. Rather than
 * keeping a second set of pictures, the very drawings of `media.ts` are
 * screenshotted by headless Chrome, at twice their displayed size for retina
 * screens, into `public/email/` — committed, and deployed with the site.
 *
 * The grain filter is taken off first: noise is what PNG compresses worst, and
 * it took a 30 KB picture to 1.2 MB. Run again after changing a drawing.
 *
 * Chrome is looked for under its usual names; `CHROME_PATH` overrides that.
 */

const OUT_DIR = join(import.meta.dirname, "..", "public", "email")
const SCALE = 2

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter((path): path is string => Boolean(path))

const chrome = CANDIDATES.find((path) => existsSync(path))
if (!chrome) {
  console.error("No Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.")
  process.exit(1)
}

function svgOf(artwork: Artwork): string {
  const prefix = "data:image/svg+xml,"
  if (!artwork.src.startsWith(prefix)) throw new Error(`${artwork.id} is not an SVG`)
  return (
    decodeURIComponent(artwork.src.slice(prefix.length))
      // The grain: one rect painted with the noise filter.
      .replace(/<rect[^>]*filter="url\(#g\)"[^>]*\/>/g, "")
  )
}

function size(svg: string): { width: number; height: number } {
  const width = Number(/width="(\d+)"/.exec(svg)?.[1])
  const height = Number(/height="(\d+)"/.exec(svg)?.[1])
  if (!width || !height)
    throw new Error("An SVG of the library has no width or height")
  return { width, height }
}

mkdirSync(OUT_DIR, { recursive: true })
const scratch = mkdtempSync(join(tmpdir(), "email-media-"))

try {
  for (const artwork of [...MEDIA_LIBRARY, ...LOGO_LIBRARY]) {
    const svg = svgOf(artwork)
    const { width, height } = size(svg)
    const page = join(scratch, `${artwork.id}.html`)
    const out = join(OUT_DIR, `${artwork.id}.png`)

    writeFileSync(
      page,
      `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:transparent">${svg.replace(
        "<svg ",
        '<svg style="display:block" '
      )}</body></html>`
    )

    execFileSync(
      chrome,
      [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        // Transparent where nothing is drawn: a logo's rounded corners show the
        // header behind them rather than white.
        "--default-background-color=00000000",
        "--no-first-run",
        `--user-data-dir=${join(scratch, "profile")}`,
        `--force-device-scale-factor=${SCALE}`,
        `--window-size=${width},${height}`,
        `--screenshot=${out}`,
        pathToFileURL(page).href,
      ],
      { stdio: "ignore" }
    )

    console.log(
      `${artwork.id}.png  ${width * SCALE}×${height * SCALE}  ${Math.round(statSync(out).size / 1024)} KB`
    )
  }
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
