import { createFileRoute } from "@tanstack/react-router"
import { ActionList } from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, H3, Li, P, Ul } from "@/components/prose"
import { articlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/resources")({
  head: () => ({
    meta: [
      { title: "Declaring a resource — react-resource-view" },
      {
        name: "description",
        content:
          "createViewResource, the five views it derives, the repository it picks, and the hooks that shape requests on the way in and out.",
      },
    ],
  }),
  component: Resources,
})

const BASIC = `import { createViewResource } from "react-resource-view"

export const articles = createViewResource("articles", {
  name: "Articles",
  path: "/api/articles",
  view: {
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
      },
    },
  },
})`

const PER_VIEW = `createViewResource("articles", {
  name: "Articles",
  path: "/api/articles",
  // Shared by every view…
  view: {
    form: { inputs: { title: { label: "Title" }, body: { label: "Body" } } },
  },
  // …and overridden per action.
  views: {
    [ActionList.list]: { name: "All articles", itemsPerPage: 20 },
    [ActionList.create]: {
      name: "New article",
      form: { inputs: { title: { label: "Title", required: true } } },
    },
    [ActionList.read]: { behavior: { canExport: true } },
  },
})`

const HOOKS = `createViewResource("articles", {
  path: "/api/articles",

  // Shape the query before a collection is fetched.
  preGetCollection: (params, context) => ({
    ...params,
    "order[publishedAt]": "desc",
  }),

  // Shape the payload before it is written.
  preCreate: (data, context) => ({
    ...data,
    workspace: context?.viewResourceContext?.filter?.workspace,
  }),

  preUpdate: (data) => ({ ...data, updatedAt: new Date().toISOString() }),
})`

const ON_CHANGE = `// Every write publishes, so a sibling view can refresh itself.
articles.onChange.subscribe(({ data, action }) => {
  if (action === ActionList.delete) analytics.track("article.deleted", data)
})`

const LOCAL = `// No \`path\` → localStorage. Every demo on this site is declared this way.
const drafts = createViewResource("local_drafts", {
  name: "Drafts",
  view: { form: { inputs: { title: { label: "Title" } } } },
})`

function Resources() {
  return (
    <DocArticle
      toc={[
        { id: "basic", title: "The smallest declaration" },
        { id: "five-views", title: "Five views from one description" },
        { id: "reference", title: "Resource reference" },
        { id: "repository", title: "Where the data comes from" },
        { id: "hooks", title: "Shaping requests" },
        { id: "on-change", title: "Reacting to writes" },
      ]}
    >
      <H2 id="basic">The smallest declaration</H2>

      <P>
        An identifier, a path and a form. That is enough for a list, a detail page, a
        create form, an edit form and a delete confirmation.
      </P>

      <CodeBlock filename="articles.ts">{BASIC}</CodeBlock>

      <Callout kind="warning" title="Declare resources at module scope">
        <P>
          <C>createViewResource</C> registers the resource in the shared registry.
          Calling it inside a component would register it again on every render —
          declare it once, in a module, and import it.
        </P>
      </Callout>

      <H2 id="five-views">Five views from one description</H2>

      <P>
        <C>view</C> is the description every action starts from; <C>views</C>{" "}
        overrides it per action. So the common case — one form for creating and
        editing, one set of columns for the list — is written once, and only the
        differences are stated.
      </P>

      <CodeBlock>{PER_VIEW}</CodeBlock>

      <Demo
        label="One declaration, five actions — open a row, edit it, create one"
        wide
      >
        <ResourceDemo
          resource={articlesResource}
          action={ActionList.list}
          variant="table"
        />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "views.list",
            type: "ViewListInterface",
            description: (
              <>
                The collection. Owns <C>viewVariants</C>, <C>formFilter</C>,{" "}
                <C>defaultFilter</C> and <C>itemsPerPage</C>.
              </>
            ),
          },
          {
            name: "views.read",
            type: "ViewInterface",
            description: "One item. Owns the sub-views and the export button.",
          },
          {
            name: "views.create",
            type: "ViewUpdateInterface",
            description: "The creation form.",
          },
          {
            name: "views.update",
            type: "ViewUpdateInterface",
            description: "The edit form.",
          },
          {
            name: "views.delete",
            type: "ViewUpdateInterface",
            description: "The delete confirmation.",
          },
        ]}
      />

      <Callout kind="tip" title="The list has no separate column definition">
        <P>
          The table renders one column per field of <C>view.form</C>, in the order
          the fields are declared, skipping those marked <C>generatedValue</C>.
          Adding a column means adding a field — and that field is then editable
          everywhere the form appears.
        </P>
      </Callout>

      <H2 id="reference">Resource reference</H2>

      <PropsTable
        rows={[
          {
            name: "@id",
            type: "string",
            required: true,
            description:
              "First argument. Identifies the resource in the registry, and in URLs.",
          },
          {
            name: "name",
            type: "string",
            description: "Human-readable label. Defaults to the id.",
          },
          {
            name: "path",
            type: "string",
            description: (
              <>
                Collection endpoint — <C>/api/articles</C>. Left out, the resource is
                backed by localStorage.
              </>
            ),
          },
          {
            name: "icon",
            type: "FC<{ className?: string }>",
            description: "Shown in menus and tabs.",
          },
          {
            name: "scope",
            type: "string",
            description: (
              <>
                Which area of the application it belongs to. See{" "}
                <A href="/docs/resource-view/scopes">Scopes</A>.
              </>
            ),
          },
          {
            name: "alias",
            type: "string",
            description: "A second identifier the router also accepts.",
          },
          {
            name: "view",
            type: "ViewListInterface",
            description: "The description every action starts from.",
          },
          {
            name: "views",
            type: "{ list, read, create, update, delete }",
            description: "Per-action overrides.",
          },
          {
            name: "canList / canRead / canCreate / canUpdate / canDelete",
            type: "boolean | (() => boolean)",
            description: (
              <>
                Permissions, evaluated on render. See{" "}
                <A href="/docs/resource-view/permissions">Permissions</A>.
              </>
            ),
          },
          {
            name: "limit",
            type: "LimitInterface",
            description: "A creation quota, with a fallback rendered once reached.",
          },
          {
            name: "decoratorComponent",
            type: "FC<{ children }>",
            description: "Wraps every view of this resource.",
          },
          {
            name: "onChange",
            type: "PubSub<{ data, action }>",
            description: "Publishes after every successful write.",
          },
          {
            name: "getCollection / getItem / createItem / updateItem / removeItem",
            type: "functions",
            description:
              "The repository. Supplied for you, and replaceable one method at a time.",
          },
        ]}
      />

      <H2 id="repository">Where the data comes from</H2>

      <P>
        <C>createViewResource</C> picks a repository from one thing: whether the
        resource has a <C>path</C>.
      </P>

      <Ul>
        <Li>
          <strong>With a path</strong> — an HTTP repository speaking the configured{" "}
          <A href="/docs/resource-view/backends">dialect</A>:{" "}
          <C>GET /api/articles</C> and <C>PATCH /api/articles/42</C> on API Platform,{" "}
          <C>GET /api/articles?pagination[page]=1</C> on Strapi,{" "}
          <C>GET /rest/v1/articles?limit=30</C> on Supabase. A resource may carry a{" "}
          <C>dialect</C> of its own, for an application reading two backends at once.
        </Li>
        <Li>
          <strong>Without one</strong> — a localStorage repository keyed on the
          resource id, with the same interface.
        </Li>
      </Ul>

      <CodeBlock>{LOCAL}</CodeBlock>

      <P>
        The second is not only for demos: it is a genuine offline store, and it is
        what makes a resource testable without a server.
      </P>

      <Callout kind="note" title="Or bring your own">
        <P>
          Any of the five methods can be given directly on the declaration and takes
          precedence — a resource reading from IndexedDB, from a GraphQL endpoint, or
          from an in-memory fixture is the same declaration with five functions on
          it.
        </P>
      </Callout>

      <H2 id="hooks">Shaping requests</H2>

      <P>
        Three hooks sit between the views and the repository. Each receives the
        current context, so a value can be derived from the surrounding view — the
        parent item of a sub-view, the active filter, the current scope.
      </P>

      <CodeBlock>{HOOKS}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "preGetCollection",
            type: "(params, context) => params",
            description:
              "Before a collection is fetched. Sorting, extra query parameters, a forced filter.",
          },
          {
            name: "preGetItem",
            type: "(params, context) => params",
            description: "Before a single item is fetched.",
          },
          {
            name: "preCreate",
            type: "(data, context) => data",
            description: "Before a create. Injecting an owner or a tenant.",
          },
          {
            name: "preUpdate",
            type: "(data, context) => data",
            description: "Before an update.",
          },
        ]}
      />

      <P>
        The filter currently applied is merged into the collection request after{" "}
        <C>preGetCollection</C> runs, so a hook cannot accidentally erase what the
        reader typed.
      </P>

      <H2 id="on-change">Reacting to writes</H2>

      <P>
        Every successful create, update or delete publishes on the resource's{" "}
        <C>onChange</C>. That is how a sub-view refreshes when its parent changes,
        and where analytics or cache invalidation belong.
      </P>

      <CodeBlock>{ON_CHANGE}</CodeBlock>

      <H3>Next</H3>
      <P>
        With the resource declared, the interesting question is how its list is laid
        out — which is the next page.
      </P>
    </DocArticle>
  )
}
