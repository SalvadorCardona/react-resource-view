import { createFileRoute } from "@tanstack/react-router"
import { DocArticle } from "@/components/DocArticle"
import { A, C, H2, H3, Li, P, Ul } from "@/components/prose"
import { RELEASES, type ChangelogEntry } from "@/lib/changelog"
import { VIEW_SECTION } from "@/lib/navigation"

export const Route = createFileRoute("/docs/resource-view/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — react-resource-view" },
      {
        name: "description",
        content:
          "Every release of react-resource-view, newest first: the features added, the fixes, and the changes to watch for when upgrading.",
      },
    ],
  }),
  component: Changelog,
})

const RELEASES_URL = `${VIEW_SECTION.repository}/releases`

/** Backticks in a changeset mark code; nothing else in them is markup. */
function Inline({ text }: { text: string }) {
  return text
    .split("`")
    .map((part, index) =>
      index % 2 === 1 ? <C key={index}>{part}</C> : part
    )
}

function Entry({ entry }: { entry: ChangelogEntry }) {
  return (
    <Li>
      {entry.paragraphs.map((paragraph, index) => (
        <span key={index} className={index > 0 ? "mt-2 block" : undefined}>
          <Inline text={paragraph} />
        </span>
      ))}
    </Li>
  )
}

function Changelog() {
  return (
    <DocArticle
      toc={RELEASES.map((release) => ({
        id: `v${release.version}`,
        title: release.version,
      }))}
    >
      <P>
        Read from the <C>CHANGELOG.md</C> that Changesets maintains in the
        repository, so a release appears here as soon as its version is merged. Dates
        and download links are on{" "}
        <A href={RELEASES_URL}>the GitHub releases</A>, and the package itself is on{" "}
        <A href="https://www.npmjs.com/package/react-resource-view">npm</A>.
      </P>

      {RELEASES.map((release) => (
        <section key={release.version}>
          <H2 id={`v${release.version}`}>{release.version}</H2>

          {release.groups.map((group) => (
            <div key={group.kind}>
              <H3>{group.kind}</H3>
              <Ul>
                {group.entries.map((entry) => (
                  <Entry key={entry.id} entry={entry} />
                ))}
              </Ul>
            </div>
          ))}
        </section>
      ))}
    </DocArticle>
  )
}
