import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { describe, expect, it } from "vitest"
import { BACKENDS, namedBackends, starterCommand } from "@/lib/backends"

/**
 * The site lists its backends by hand, apart from the CLI that `init` runs: the
 * site installs the package from npm, so it cannot import it. These tests read
 * the CLI from the repository instead, and fail when one list moves without the
 * other.
 */
interface Cli {
  BACKEND_IDS: string[]
  parseInitArgs: (argv: string[]) => {
    backend?: string
    apiUrl?: string
    schemaUrl?: string
  }
}

// The site's tests run from website/. Through a variable, because the CLI is
// plain JavaScript, without types to check.
const CLI = pathToFileURL(resolve(process.cwd(), "../cli/init.mjs")).href
const cli = (await import(/* @vite-ignore */ CLI)) as Cli

describe("BACKENDS", () => {
  it("names every backend `init` starts, and no other", () => {
    expect(BACKENDS.map(({ id }) => id).sort()).toEqual([...cli.BACKEND_IDS].sort())
  })

  it("prints commands `init` reads back as the same backend", () => {
    for (const backend of BACKENDS) {
      const [, , command, ...argv] = starterCommand(backend).split(" ")

      expect(command).toBe("init")
      expect(cli.parseInitArgs(argv)).toMatchObject({
        backend: backend.id,
        apiUrl: backend.apiUrl,
        schemaUrl: backend.schemaUrl,
      })
    }
  })

  it("names the products, not the generic REST tile", () => {
    expect(namedBackends()).toBe(
      "API Platform, Spring Boot, Supabase, Strapi or FastAPI"
    )
  })
})
