import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { INSTALL_PACKAGES } from "./install"

describe("INSTALL_PACKAGES", () => {
  it("names the package and every peer dependency it requires", () => {
    const pkg = JSON.parse(
      readFileSync(
        join(process.cwd(), "node_modules/react-resource-view/package.json"),
        "utf8"
      )
    )
    const peers = Object.keys(pkg.peerDependencies).filter(
      (name) =>
        !pkg.peerDependenciesMeta?.[name]?.optional &&
        !["react", "react-dom"].includes(name)
    )
    expect(INSTALL_PACKAGES.split(" ").sort()).toEqual(
      ["react-resource-view", ...peers].sort()
    )
  })
})
