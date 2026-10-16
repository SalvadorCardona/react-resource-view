import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, Ol, P, Term, Ul } from "@/components/prose"
import { articlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/filters")({
  head: () => ({
    meta: [
      { title: "Filters — react-resource-view" },
      {
        name: "description",
        content:
          "The filter bar is a form with saveOnChange. Why filters.initial exists and defaultValue would not do, and how filters travel in the URL.",
      },
    ],
  }),
  component: Filters,
})

const FORM_FILTER = `views: {
  list: {
    filters: {
      inputs: {
        title:  { label: "Search a title" },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: STATUSES,
        },
      },
      // Applied as long as the URL carries no filter of its own.
      initial: { status: "published" },
    },
  },
}`

const WRONG = `// ❌ Does not do what it looks like.
filters: {
  inputs: { status: { label: "Status", defaultValue: "published" } },
}`

const RIGHT = `// ✅ Goes out with the first request *and* pre-fills the form.
filters: {
  inputs: { status: { label: "Status" } },
  initial: { status: "published" },
}`

const INJECTED = `// A tab filtering on its parent, invisibly and permanently.
tabs: {
  items: [
    {
      resource: articles,
      filter: ({ item }) => ({ author: item["@id"] }),
    },
  ],
}`

const USE_FILTER = `import { useListViewContext } from "react-resource-view"

function MyFilterBar() {
  const { filterContext } = useListViewContext()
  const { filter, updateFilter, resetFilter, filterIsEmpty } = filterContext

  return (
    <button onClick={() => updateFilter({ status: "draft" })}>
      Only drafts
    </button>
  )
}`

function Filters() {
  return (
    <DocArticle
      toc={[
        { id: "form-filter", title: "The filter bar is a form" },
        { id: "default-filter", title: "filters.initial, and why not defaultValue" },
        { id: "url", title: "Filters in the URL" },
        { id: "injected", title: "Filters the reader cannot clear" },
        { id: "driving", title: "Driving the filter yourself" },
      ]}
    >
      <H2 id="form-filter">The filter bar is a form</H2>

      <P>
        There is no filter DSL. <C>views.list.filters</C> is an ordinary{" "}
        <A href="/docs/form/fields">form description</A>, built with{" "}
        <C>saveOnChange</C> so that editing it fires a request rather than waiting
        for a submit. Every <Term id="controller">controller</Term> in the catalogue
        is available — a date range, a multi-select, a remote search.
      </P>

      <CodeBlock>{FORM_FILTER}</CodeBlock>

      <Demo label="Filter the articles — the values reach the repository" wide>
        <ResourceDemo resource={articlesResource} variant="table" />
      </Demo>

      <P>
        The values are cleaned of empties and merged into the collection request
        after <C>hooks.beforeList</C> has run, so a hook cannot overwrite what the
        reader typed.
      </P>

      <H2 id="default-filter">filters.initial, and why not defaultValue</H2>

      <P>
        A list that should open showing only published articles needs the filter to
        be in the <em>first</em> request. That is the whole reason{" "}
        <C>initial</C> exists as a separate key.
      </P>

      <CodeBlock>{WRONG}</CodeBlock>

      <P>
        The first request goes out before the filter <Term id="form">form</Term> is
        built. A <C>defaultValue</C> would reach the form eventually, but the list
        would already have been fetched unfiltered — so the rows on screen would not
        match the filters shown above them.
      </P>

      <CodeBlock>{RIGHT}</CodeBlock>

      <Callout kind="tip" title="It also defines the resting state">
        <P>
          “Clear search” resets to <C>filters.initial</C>, not to nothing. And a field
          whose value equals its default is not counted as a search, so the clear
          button is not offered permanently.
        </P>
      </Callout>

      <H2 id="url">Filters in the URL</H2>

      <P>
        The active filter is written into the query string as an encoded object,
        alongside the <Term id="view">view</Term> context.
      </P>

      <Ol>
        <Li>A filtered list can be linked to, and the link reopens it filtered.</Li>
        <Li>The back button undoes a filter, because it undoes a URL.</Li>
        <Li>A reload keeps the filters — including the page number.</Li>
      </Ol>

      <P>
        Pagination goes through the same channel: the current page is a filter key
        like any other, which is why{" "}
        <A href="/docs/resource-view/routing">the routing page</A> treats them
        together.
      </P>

      <H2 id="injected">Filters the reader cannot clear</H2>

      <P>
        A <Term id="sub-view">tab</Term> showing “this author's articles” is
        filtered by the parent, and that filter is not the reader's to remove —
        clearing it would show every author's articles inside a page about one of
        them.
      </P>

      <CodeBlock>{INJECTED}</CodeBlock>

      <P>
        Filters injected this way are marked <C>generatedValue</C> on the filter
        form, which has two effects: they survive “clear search”, and they are not
        counted when deciding whether a search is active.
      </P>

      <H2 id="driving">Driving the filter yourself</H2>

      <P>
        A summary card, a saved view, a tab bar — anything that sets filters from
        outside the bar reaches them through the list context.
      </P>

      <CodeBlock>{USE_FILTER}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "filter",
            type: "FilterInterface",
            description: "The filter currently applied, cleaned of empty values.",
          },
          {
            name: "updateFilter",
            type: "(filter, merge?: boolean) => void",
            description:
              "Merges by default; pass false to replace the whole filter.",
          },
          {
            name: "resetFilter",
            type: "(filter?) => void",
            description: (
              <>
                Back to <C>filters.initial</C>, keeping injected filters.
              </>
            ),
          },
          {
            name: "filterIsEmpty",
            type: "boolean",
            description:
              "Whether the reader has searched for anything — defaults and injected filters do not count.",
          },
          {
            name: "formContext",
            type: "FormContextOutput",
            description:
              "The filter form itself, should you want to render it elsewhere.",
          },
        ]}
      />

      <Callout kind="note" title="One filter, one request">
        <P>
          Changing the filter refetches; the <Term id="view-variant">layout</Term>,
          the selection and the scroll position do not reset. Switching{" "}
          <A href="/docs/resource-view/layouts">layout</A> keeps the filter for the
          same reason — they are separate keys of the same context.
        </P>
      </Callout>

      <Ul>
        <Li>
          Filter keys are sent to the API as they are, so name them the way your
          backend expects — <C>{`"order[publishedAt]"`}</C> is a perfectly good field
          name.
        </Li>
        <Li>
          Against the localStorage <Term id="repository">repository</Term>, string
          filters match as case-insensitive substrings, which is what makes the demos
          on this site searchable.
        </Li>
      </Ul>
    </DocArticle>
  )
}
