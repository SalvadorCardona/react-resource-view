import { createFileRoute } from "@tanstack/react-router"
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram"
import { DocArticle } from "@/components/DocArticle"
import { A, C, H2, P } from "@/components/prose"
import { CONCEPTS } from "@/lib/concepts"

export const Route = createFileRoute("/docs/resource-view/concepts")({
  head: () => ({
    meta: [
      { title: "Concepts — react-resource-view" },
      {
        name: "description",
        content:
          "The vocabulary of react-resource-view in one page — resource, view, layout, form, controller, repository, dialect, port, scope, registry, sub-view — and how the pieces fit together.",
      },
    ],
  }),
  component: Concepts,
})

function Concepts() {
  return (
    <DocArticle
      toc={[
        { id: "picture", title: "The whole picture" },
        { id: "glossary", title: "Glossary" },
      ]}
    >
      <P>
        The rest of the documentation uses a handful of words in a sense of its own.
        This page puts them side by side, once: what each one means, and where it is
        documented in full. Elsewhere, a word in bold that links here is one of them.
      </P>

      <H2 id="picture">The whole picture</H2>

      <P>
        Everything starts from one declaration. Its form and its layouts are
        what the screens are drawn from; its repository is where the data comes from,
        and the dialect is how that data is asked of your API. The application stays
        in charge of what the library cannot know — which router, which API, which
        name — and hands it over through ports.
      </P>

      <ArchitectureDiagram />

      <H2 id="glossary">Glossary</H2>

      <dl className="not-prose mt-6 divide-y divide-border border-y border-border">
        {CONCEPTS.map((concept) => (
          <div
            key={concept.id}
            id={concept.id}
            className="grid scroll-mt-28 gap-1 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
          >
            <dt>
              <a
                href={`#${concept.id}`}
                className="font-semibold text-foreground no-underline hover:underline"
              >
                {concept.term}
              </a>
              {"aliases" in concept && (
                <span className="block text-xs text-muted-foreground">
                  also: {concept.aliases.join(", ")}
                </span>
              )}
            </dt>
            <dd className="text-muted-foreground">
              <p className="leading-relaxed">{withCode(concept.definition)}</p>
              <p className="mt-2 text-sm">
                <A href={concept.href}>{concept.linkLabel} →</A>
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </DocArticle>
  )
}

/** Renders the runs between backticks as inline code. */
function withCode(text: string) {
  return text
    .split("`")
    .map((part, index) => (index % 2 === 1 ? <C key={index}>{part}</C> : part))
}
