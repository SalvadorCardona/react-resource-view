import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Ul } from "@/components/prose"
import { articlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/")({
  head: () => ({
    meta: [
      { title: "react-resource-view — Introduction" },
      {
        name: "description",
        content:
          "Declare a resource once and get its list, detail, create, edit and delete screens, wired to your API — API Platform, Strapi or Supabase — and to the URL.",
      },
    ],
  }),
  component: ViewIntroduction,
})

const DECLARATION = `import { createViewResource, tableViewOptionFactory } from "react-resource-view"

export const articles = createViewResource("articles", {
  name: "Articles",
  path: "/api/articles",
  view: {
    // The fields are the form *and* the table's columns.
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
        status: { label: "Status", controller: SelectInputController, valueOptions: STATUSES },
      },
    },
    formFilter: { inputs: { title: { label: "Search a title" } } },
    viewVariants: [tableViewOptionFactory(), cardViewOptionFactory({ grid: 3 })],
  },
})`

const RENDER = `import { ViewResourceContextProvider } from "react-resource-view"
import { ActionList } from "react-data-form"

<ViewResourceContextProvider
  resource={articles}
  resourceAction={ActionList.list}
/>`

function ViewIntroduction() {
  return (
    <DocArticle
      toc={[
        { id: "declaration", title: "One declaration" },
        { id: "running", title: "What that gives you" },
        { id: "url", title: "The URL is the state" },
        { id: "boundaries", title: "What it does not do" },
        { id: "next", title: "Where to go next" },
      ]}
    >
      <P>
        <C>react-resource-view</C> renders the CRUD surface of a resource: the list
        and its layouts, the detail page, the create and edit forms, the delete
        confirmation, the filter bar and the pagination. You describe the resource;
        it writes the screens.
      </P>

      <P>
        It is built on <A href="/docs/form">react-data-form</A> for everything with
        fields in it, which is why the two are documented side by side.
      </P>

      <H2 id="declaration">One declaration</H2>

      <CodeBlock filename="articles.ts">{DECLARATION}</CodeBlock>

      <P>Rendering it is one component:</P>

      <CodeBlock>{RENDER}</CodeBlock>

      <H2 id="running">What that gives you</H2>

      <P>
        Everything below comes from a declaration of that shape — no screen was
        written by hand. Switch the layout, filter the list, open a row, edit it,
        delete it.
      </P>

      <Demo label="A resource, running" code={DECLARATION} wide>
        <ResourceDemo resource={articlesResource} variant="table" />
      </Demo>

      <Callout kind="note" title="No server behind this page">
        <P>
          A resource declared without a <C>path</C> falls back to a
          localStorage-backed repository. Every demo on this site runs against a real
          repository with no API behind it — your edits survive a reload.
        </P>
      </Callout>

      <H2 id="url">The URL is the state</H2>

      <P>
        Which view, which item, which filters, which page, which layout: all of it
        lives in the address bar rather than in component state.
      </P>

      <Ul>
        <Li>A link reopens exactly what the sender was looking at.</Li>
        <Li>The back button does what the reader expects.</Li>
        <Li>
          A reload does not lose the filters — which is the difference between a list
          people use and a list people fight.
        </Li>
      </Ul>

      <P>
        Two <A href="/docs/resource-view/routing">routing modes</A> carry it: in the
        path, or entirely in the query string for statically hosted or embedded
        views.
      </P>

      <H2 id="boundaries">What it does not do</H2>

      <Ul>
        <Li>
          <strong>It has no router.</strong> Four primitives are asked for; an
          adapter for TanStack Router ships with the package.
        </Li>
        <Li>
          <strong>It knows no API in particular.</strong> Which backend answers, and
          how it spells a page or a filter, is a{" "}
          <A href="/docs/resource-view/backends">dialect</A> — API Platform, Strapi
          and Supabase ship with the package — configured separately through{" "}
          <C>configureApi</C>.
        </Li>
        <Li>
          <strong>It is not an admin panel.</strong> There is no generated dashboard
          and no scaffolding step: it is a set of components you render where you
          want them.
        </Li>
        <Li>
          <strong>It does not own your layout.</strong> A view is a component, not a
          page.
        </Li>
      </Ul>

      <H2 id="next">Where to go next</H2>

      <div className="not-prose mt-6 grid gap-3 sm:grid-cols-2">
        {[
          {
            to: "/docs/resource-view/installation",
            title: "Installation",
            body: "Install, style, and point the client at your API.",
          },
          {
            to: "/docs/resource-view/resources",
            title: "Declaring a resource",
            body: "createViewResource, its five views, and the repository behind them.",
          },
          {
            to: "/docs/resource-view/layouts",
            title: "Choosing a layout",
            body: "Seven variants over one collection, switched by the reader.",
          },
          {
            to: "/docs/resource-view/routing",
            title: "Routing",
            body: "The four primitives, and the two ways to carry a context.",
          },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group rounded-xl border border-border p-4 no-underline transition hover:border-view/50 hover:bg-muted/40"
          >
            <p className="flex items-center justify-between font-medium">
              {card.title}
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
          </Link>
        ))}
      </div>
    </DocArticle>
  )
}
