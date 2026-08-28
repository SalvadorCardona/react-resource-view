import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize } from "node:path"
import { Readable } from "node:stream"
import { fileURLToPath } from "node:url"

/**
 * Production server.
 *
 * `vite build` emits a fetch handler at dist/server/server.js — a
 * `{ fetch(Request): Promise<Response> }`, the shape every modern host speaks —
 * and the client assets at dist/client. This bridges the two onto node:http, so
 * `pnpm start` runs the site anywhere Node runs, with no hosting adapter in the
 * way. A platform that takes the fetch handler directly can import
 * dist/server/server.js and ignore this file.
 */

const ROOT = fileURLToPath(new URL(".", import.meta.url))
const CLIENT_DIR = join(ROOT, "dist/client")
const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? "0.0.0.0"

const { default: handler } = await import("./dist/server/server.js")

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
}

/** Resolves a URL to a file under dist/client, or null. Refuses to escape it. */
function resolveAsset(pathname) {
  if (pathname === "/") return null

  const candidate = normalize(join(CLIENT_DIR, decodeURIComponent(pathname)))
  if (!candidate.startsWith(CLIENT_DIR)) return null
  if (!existsSync(candidate) || !statSync(candidate).isFile()) return null

  return candidate
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
    const asset = resolveAsset(url.pathname)

    if (asset) {
      // Hashed filenames are immutable; anything else has to be revalidated.
      const immutable = url.pathname.startsWith("/assets/")
      res.writeHead(200, {
        "content-type": MIME[extname(asset)] ?? "application/octet-stream",
        "cache-control": immutable
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate",
      })
      createReadStream(asset).pipe(res)
      return
    }

    const body =
      req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req)

    const response = await handler.fetch(
      new Request(url, {
        method: req.method,
        headers: req.headers,
        body,
        duplex: body ? "half" : undefined,
      })
    )

    res.writeHead(response.status, Object.fromEntries(response.headers))
    if (response.body) {
      Readable.fromWeb(response.body).pipe(res)
    } else {
      res.end()
    }
  } catch (error) {
    console.error(error)
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain" })
    res.end("Internal server error")
  }
}).listen(PORT, HOST, () => {
  console.log(`Resource & Form docs listening on http://${HOST}:${PORT}`)
})
