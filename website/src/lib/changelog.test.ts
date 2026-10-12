import { describe, expect, it } from "vitest"
import { LATEST_VERSION, parseChangelog, RELEASES } from "./changelog"

const SOURCE = `# react-resource-view

## 0.2.0

### Minor Changes

- 642aac2: Add a dialect.

  It pages with \`skip\`
  and \`limit\`.

- 5dfb920: Add init.

### Patch Changes

- ef36d4e: Fix a label.

## 0.1.0

### Minor Changes

- 1a4b81b: First.
`

describe("parseChangelog", () => {
  it("reads releases, groups and entries in file order", () => {
    const releases = parseChangelog(SOURCE)

    expect(releases.map((release) => release.version)).toEqual(["0.2.0", "0.1.0"])
    expect(releases[0].groups.map((group) => group.kind)).toEqual([
      "Minor Changes",
      "Patch Changes",
    ])
    expect(releases[0].groups[0].entries.map((entry) => entry.id)).toEqual([
      "642aac2",
      "5dfb920",
    ])
  })

  it("joins wrapped lines and splits paragraphs on blank lines", () => {
    const [entry] = parseChangelog(SOURCE)[0].groups[0].entries

    expect(entry.paragraphs).toEqual([
      "Add a dialect.",
      "It pages with `skip` and `limit`.",
    ])
  })

  it("parses the repository's own changelog", () => {
    expect(RELEASES.length).toBeGreaterThan(0)
    expect(LATEST_VERSION).toMatch(/^\d+\.\d+\.\d+/)
    expect(RELEASES.every((release) => release.groups.length > 0)).toBe(true)
  })
})
