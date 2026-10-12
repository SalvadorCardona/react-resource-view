import changelog from "../../../CHANGELOG.md?raw"

/** One changeset, as Changesets writes it: a short hash and a few paragraphs. */
export interface ChangelogEntry {
  id: string
  paragraphs: string[]
}

/** The entries of one release under one heading — `Minor Changes`, `Patch Changes`. */
export interface ChangelogGroup {
  kind: string
  entries: ChangelogEntry[]
}

export interface ChangelogRelease {
  version: string
  groups: ChangelogGroup[]
}

/**
 * Reads the `CHANGELOG.md` Changesets keeps at the root of the repository.
 *
 * The page renders the file the release workflow already maintains, rather
 * than a copy to keep in step: a release shows up here with the commit that
 * versions it. The format is the narrow one Changesets emits — `## version`,
 * `### kind`, then `- hash: text` entries whose continuation lines are indented.
 */
export function parseChangelog(source: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = []
  let group: ChangelogGroup | undefined
  let entry: ChangelogEntry | undefined
  let startNewParagraph = false

  for (const line of source.split("\n")) {
    const version = /^## (\S+)\s*$/.exec(line)
    if (version) {
      releases.push({ version: version[1], groups: [] })
      group = entry = undefined
      continue
    }

    const release = releases.at(-1)
    if (!release) continue

    const kind = /^### (.+?)\s*$/.exec(line)
    if (kind) {
      group = { kind: kind[1], entries: [] }
      release.groups.push(group)
      entry = undefined
      continue
    }
    if (!group) continue

    const start = /^- ([0-9a-f]{7,}): (.*)$/.exec(line)
    if (start) {
      entry = { id: start[1], paragraphs: [start[2]] }
      group.entries.push(entry)
      startNewParagraph = false
      continue
    }

    if (!entry) continue
    if (line.trim() === "") {
      startNewParagraph = true
      continue
    }

    const text = line.trim()
    if (startNewParagraph) entry.paragraphs.push(text)
    else entry.paragraphs[entry.paragraphs.length - 1] += ` ${text}`
    startNewParagraph = false
  }

  return releases
}

/** Newest first, as the file lists them. */
export const RELEASES = parseChangelog(changelog)

/** The newest version in the file — the one npm serves as `latest`. */
export const LATEST_VERSION = RELEASES[0]?.version
