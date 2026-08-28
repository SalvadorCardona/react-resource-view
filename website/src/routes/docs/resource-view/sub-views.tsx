import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/sub-views")({
  head: () => ({
    meta: [
      { title: "Sub-views and tabs — react-resource-view" },
      {
        name: "description",
        content:
          "Nesting a resource inside another one's detail page: tabs derived from the parent, filtered by it, and a dialog for a child view.",
      },
    ],
  }),
  component: SubViews,
})

const SUB = `views: {
  [ActionList.read]: {
    subViewResource: {
      list: [
        {
          // A nested resource, filtered by the record on screen.
          resource: articles,
          resourceAction: ActionList.list,
          name: "Articles",
          icon: FileText,
          onInitViewResource: (view, parent) => ({
            ...view,
            filter: { author: parent?.data?.["@id"] },
          }),
        },
        {
          // Or a tab of your own, with no resource behind it.
          slug: "activity",
          name: "Activity",
          icon: Activity,
          viewComponent: AuthorActivity,
        },
      ],
    },
  },
}`

const DEFAULT_DATA = `onInitViewResource: (view, parent) => ({
  ...view,
  // Filters the list…
  filter: { author: parent?.data?.["@id"] },
  // …and pre-fills the create form opened from inside it.
  defaultData: { author: parent?.data?.["@id"] },
})`

const DIALOG = `import { ChildViewResourceDialog } from "react-resource-view"

// A second context, rendered over the first — creating a category without
// leaving the article being written.
<ChildViewResourceDialog
  resource={categories}
  resourceAction={ActionList.create}
/>`

const NESTED_URL = `/admin/authors/read/7/articles
//                            └ subResource: which tab is open

/admin/authors/read/7/articles/categories/create
//                            └ the child view's own three segments`

function SubViews() {
  return (
    <DocArticle
      toc={[
        { id: "why", title: "The shape of the problem" },
        { id: "declaring", title: "Declaring sub-views" },
        { id: "context", title: "Deriving from the parent" },
        { id: "url", title: "Nesting in the URL" },
        { id: "dialog", title: "A child view in a dialog" },
      ]}
    >
      <H2 id="why">The shape of the problem</H2>

      <P>
        An author's page is not only the author. It is the author, their articles,
        their comments, their activity — each of which is a collection in its own
        right, and each of which should be filtered by the record on screen without
        that filter being the reader's to remove.
      </P>

      <P>
        A sub-view is a full view context nested inside another: it fetches, it
        filters, it paginates, it writes. It is not a read-only panel.
      </P>

      <H2 id="declaring">Declaring sub-views</H2>

      <P>
        <C>subViewResource.list</C> is the tabs of a detail page. An entry takes one
        of two shapes — a nested resource, or a component of your own.
      </P>

      <CodeBlock>{SUB}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "resource / resourceId",
            type: "ViewResourceInterface | string",
            description: "The nested resource. Omit for a free-form tab.",
          },
          {
            name: "resourceAction",
            type: "ActionList",
            description: "Which of its views the tab renders.",
          },
          {
            name: "slug",
            type: "string",
            description: (
              <>
                The tab's identifier in the URL. Defaults to the resource's{" "}
                <C>@id</C>.
              </>
            ),
          },
          {
            name: "name",
            type: "string",
            description: "The tab label. Defaults to the resource's name.",
          },
          {
            name: "icon",
            type: "IconType",
            description: "The tab icon. Defaults to the resource's.",
          },
          {
            name: "viewComponent",
            type: "FC",
            description:
              "Custom rendering, taking precedence over the resource's own — the free-form tab.",
          },
          {
            name: "onInitViewResource",
            type: "(view, parent) => view",
            description:
              "Where the nested context is derived from the surrounding one.",
          },
          {
            name: "filter",
            type: "FilterInterface",
            description: "A static filter, when nothing has to be derived.",
          },
        ]}
      />

      <P>
        <C>MultiViewTab</C> renders the tab bar. It is exported, so a detail page
        laid out by hand can place it wherever it belongs.
      </P>

      <H2 id="context">Deriving from the parent</H2>

      <P>
        <C>onInitViewResource</C> receives the context being built and the
        surrounding one, and returns the context to use. It runs once, when the
        sub-view mounts.
      </P>

      <CodeBlock>{DEFAULT_DATA}</CodeBlock>

      <Callout kind="tip" title="Filter and defaultData together">
        <P>
          Filtering alone gives a list of the author's articles whose create button
          makes an article belonging to nobody. Setting <C>defaultData</C> as well is
          what makes “new article” mean “new article <em>by this author</em>”.
        </P>
      </Callout>

      <P>
        Filters injected this way are marked as generated, so “clear search” keeps
        them —{" "}
        <A href="/docs/resource-view/filters">as the filters page describes</A>.
        Losing that one would show every author's articles inside a page about one of
        them.
      </P>

      <H2 id="url">Nesting in the URL</H2>

      <P>
        The open tab is a segment of the context, and a child view appends its own
        three segments after it. So a nested state is addressable, and the back
        button walks out of it a step at a time.
      </P>

      <CodeBlock lang="bash">{NESTED_URL}</CodeBlock>

      <Ul>
        <Li>
          Switching tabs does not reset the scroll position — the views ask the
          router not to.
        </Li>
        <Li>
          A sub-view's filter is not written to the URL: only the outermost context
          owns the query string, which is what keeps two nested lists from
          overwriting each other.
        </Li>
      </Ul>

      <H2 id="dialog">A child view in a dialog</H2>

      <P>
        Sometimes the nested thing should not replace the page. A category has to be
        created in the middle of writing an article, and the article must still be
        there afterwards.
      </P>

      <CodeBlock>{DIALOG}</CodeBlock>

      <P>
        <C>ChildViewResourceDialog</C> renders a second context over the first. The
        parent is untouched, and the resource's <C>onChange</C> is what tells the
        field behind the dialog to reload its options.
      </P>

      <Callout kind="note" title="behavior.openIn">
        <P>
          A view can also ask to open in a popup rather than in place — with{" "}
          <C>behavior: {'{ openIn: "popup" }'}</C> — together with{" "}
          <C>closeAfterUpdate</C> and <C>refreshDataAfterUpdate</C>, which decide
          what happens once the write lands.
        </P>
      </Callout>
    </DocArticle>
  )
}
