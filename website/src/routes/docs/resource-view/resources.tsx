import { createFileRoute } from "@tanstack/react-router"
import { ActionList } from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, H3, Li, P, Term, Ul } from "@/components/prose"
import { articlesResource, drawerArticlesResource } from "@/demo/resources"

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
  form: {
    inputs: {
      title: { label: "Title", required: true },
      author: { label: "Author" },
    },
  },
})`

const PER_VIEW = `createViewResource("articles", {
  name: "Articles",
  path: "/api/articles",
  // Shared by every view…
  form: { inputs: { title: { label: "Title" }, body: { label: "Body" } } },
  // …and adjusted per action: only what differs, merged deeply.
  views: {
    list: { title: "All articles", pageSize: 20 },
    create: {
      title: "New article",
      form: { inputs: { title: { required: true } } },
    },
  },
})`

const OPEN_IN = `createViewResource("articles", {
  path: "/api/articles",
  views: {
    // A screen of its own, at /articles/read/42 — the default.
    read: { open: "page" },
    // A dialog over the list.
    create: { open: "dialog" },
    // A panel sliding in from the right — up from the bottom on a phone.
    update: { open: "drawer" },
  },
})`

const FULL_WIDTH = `createViewResource<Task>("tasks", {
  path: "/api/tasks",
  // Every action of the resource takes the page's whole width…
  fullWidth: true,
  views: {
    list: {
      layouts: [
        layout.board({ groupBy: "status", columns: STATUSES }),
        layout.table(),
      ],
    },
    // …but its forms, which read better narrow.
    create: { fullWidth: false },
    update: { fullWidth: false },
  },
})

// Or a single layout of a list, the others keeping the column:
layouts: [
  layout.board({ groupBy: "status", columns: STATUSES, fullWidth: true }),
  layout.table(),
]`

const HOOKS = `createViewResource("articles", {
  path: "/api/articles",
  hooks: {
    // Shape the query before a collection is fetched.
    beforeList: (params, context) => ({
      ...params,
      "order[publishedAt]": "desc",
    }),

    // Shape the payload before it is written.
    beforeCreate: (data, { viewResourceContext }) => ({
      ...data,
      workspace: viewResourceContext?.filter?.workspace,
    }),

    beforeUpdate: (data) => ({ ...data, updatedAt: new Date().toISOString() }),

    // Told what the API answered.
    afterSave: (article, { action }) => notify(\`Article \${action}d\`),
  },
})`

const ON_CHANGE = `// Every write publishes, so a sibling view can refresh itself.
articles.onChange.subscribe(({ data, action }) => {
  if (action === ActionList.delete) analytics.track("article.deleted", data)
})`

const LOCAL = `// \`storage: "local"\` → localStorage. Every demo on this site is declared this way.
const drafts = createViewResource("local_drafts", {
  name: "Drafts",
  storage: "local",
  form: { inputs: { title: { label: "Title" } } },
})`

function Resources() {
  return (
    <DocArticle
      toc={[
        { id: "basic", title: "The smallest declaration" },
        { id: "five-views", title: "Five views from one description" },
        { id: "open-in", title: "Where an action opens" },
        { id: "full-width", title: "Full width" },
        { id: "reference", title: "Resource reference" },
        { id: "repository", title: "Where the data comes from" },
        { id: "hooks", title: "Shaping requests" },
        { id: "on-change", title: "Reacting to writes" },
      ]}
    >
      <H2 id="basic">The smallest declaration</H2>

      <P>
        An identifier, a path and a <Term id="form">form</Term>. That is enough for a
        list, a detail page, a create form, an edit form and a delete confirmation.
      </P>

      <CodeBlock filename="articles.ts">{BASIC}</CodeBlock>

      <Callout kind="warning" title="Declare resources at module scope">
        <P>
          <C>createViewResource</C> registers the <Term id="resource">resource</Term>{" "}
          in the shared <Term id="registry">registry</Term>. Calling it inside a
          component would register it again on every render — declare it once, in a
          module, and import it.
        </P>
      </Callout>

      <H2 id="five-views">Five views from one description</H2>

      <P>
        The root of the declaration is what every action starts from;{" "}
        <C>views.&lt;action&gt;</C> adjusts it for one action, and the two are
        merged deeply. So the common case — one form for creating and editing, one
        set of columns for the list — is written once, and only the differences are
        stated: <C>inputs: {"{"} notes: false {"}"}</C> removes an inherited field,{" "}
        <C>components: {"{"} top: null {"}"}</C> an inherited component.
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
            type: "ListViewDefinition",
            description: (
              <>
                The collection. Owns <C>layouts</C>, <C>filters</C>,{" "}
                <C>pageSize</C>, <C>sort</C>, <C>rowActions</C>, <C>selectable</C>{" "}
                and <C>bulkActions</C>.
              </>
            ),
          },
          {
            name: "views.read",
            type: "ReadViewDefinition",
            description: (
              <>
                One item. Owns <C>open</C>, <C>expandable</C> and the{" "}
                <C>tabs</C> under the record.
              </>
            ),
          },
          {
            name: "views.create",
            type: "CreateViewDefinition",
            description: (
              <>
                The creation form. Owns <C>open</C>, <C>afterSave</C> and{" "}
                <C>optimistic</C>.
              </>
            ),
          },
          {
            name: "views.update",
            type: "UpdateViewDefinition",
            description: (
              <>
                The edit form. What the creation form owns, and <C>tabs</C>.
              </>
            ),
          },
          {
            name: "views.delete",
            type: "DeleteViewDefinition",
            description: (
              <>
                The delete confirmation. Owns <C>open</C> and <C>optimistic</C>.
              </>
            ),
          },
        ]}
      />

      <Callout kind="tip" title="The list has no separate column definition">
        <P>
          The table renders one column per field of the resource&apos;s{" "}
          <C>form</C>, in the order the fields are declared, skipping those marked{" "}
          <C>generatedValue</C>. Adding a column means adding a field — and that
          field is then editable everywhere the form appears. A layout that shows
          fewer picks them with <C>fields: ["title", "status"]</C>.
        </P>
      </Callout>

      <H2 id="open-in">Where an action opens</H2>

      <P>
        An action is a screen, a dialog or a drawer — the same{" "}
        <Term id="view">view</Term> either way, drawn in a different frame.{" "}
        <C>views.&lt;action&gt;.open</C> is the whole decision, and it is taken per
        action: a list is read full page, and the form that edits one of its rows
        does not have to be.
      </P>

      <CodeBlock>{OPEN_IN}</CodeBlock>

      <Ul>
        <Li>
          <C>page</C> — the view replaces the page, at its own URL. Shareable,
          bookmarkable, and where a list belongs.
        </Li>
        <Li>
          <C>dialog</C> — a dialog centred over the page. Short forms and delete
          confirmations, where what is behind is the context the reader is keeping.
        </Li>
        <Li>
          <C>drawer</C> — a panel sliding in from the right on a desktop, up from
          the bottom on a phone, where the thumb is. As tall as the screen, so a
          record with a dozen fields is filled in without the list going anywhere.
        </Li>
      </Ul>

      <PropsTable
        rows={[
          {
            name: "open",
            type: '"page" | "dialog" | "drawer" | OpenFrame',
            default: '"page"',
            description: (
              <>
                Set per action, on <C>views.&lt;action&gt;</C>, or once for the whole
                application through <C>configureResourceView({"{"} defaults {"}"})</C>
                . The delete confirmation is the one action that starts as a{" "}
                <C>dialog</C>. A frame of one&apos;s own is built with{" "}
                <C>open.custom()</C>.
              </>
            ),
          },
        ]}
      />

      <Demo
        label="Create and edit in a drawer — narrow the window to see it change sides"
        code={OPEN_IN}
        wide
      >
        <ResourceDemo
          resource={drawerArticlesResource}
          action={ActionList.list}
          variant="table"
        />
      </Demo>

      <Callout kind="tip" title="The drawer is two shapes, not one">
        <P>
          Which side it comes in from is decided at <C>768px</C> — the same
          breakpoint the views size against — and the side it arrives from is the
          side it is swiped away towards. So a drawer is dismissed rightwards on a
          desktop and downwards on a phone, with no configuration either way.
        </P>
      </Callout>

      <P>
        A view drawn over the page is still written into the URL, under the list it
        was opened from — <C>…/articles/list/articles/update/42</C>, filters and
        page included — so a link, Back and a reload find it as it was. What
        happens once the write lands is <C>afterSave</C>: <C>"close"</C> (the
        default in a dialog or a drawer) goes back to the list,{" "}
        <C>"stay"</C> (the default on a page) keeps the form, <C>"reload"</C> fills
        it again with what the API answered, and{" "}
        <C>{"{"} redirect: (item) =&gt; string {"}"}</C> goes elsewhere.
      </P>

      <H2 id="full-width">Full width</H2>

      <P>
        Under <A href="/docs/resource-view/admin-layout">AdminLayout</A>, views are
        drawn in a column of constrained width — the right measure for a form or a
        record, too narrow for a board, a calendar, a timeline or a table with a
        dozen columns. <C>fullWidth</C> hands the page&apos;s whole width to the
        views that need it, and to those only.
      </P>

      <CodeBlock>{FULL_WIDTH}</CodeBlock>

      <P>
        It is read at three levels, and the most specific one wins: a list{" "}
        <Term id="view-variant">layout</Term>, then the action&apos;s entry in{" "}
        <C>views</C>, then the root of the resource. So a resource declared
        full width keeps its forms narrow with a <C>fullWidth: false</C> on those
        actions, and a board can be the one wide layout of a list whose table stays
        in the column.
      </P>

      <PropsTable
        rows={[
          {
            name: "fullWidth",
            type: "boolean",
            default: "false",
            description: (
              <>
                At the root, every action of the resource; on{" "}
                <C>views.&lt;action&gt;</C>, that action; on a layout built by{" "}
                <C>layout.*()</C>, that layout. The side margins stay, and a narrow
                screen is laid out as before.
              </>
            ),
          },
        ]}
      />

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
                Collection endpoint — <C>/api/articles</C>. Without it, declare{" "}
                <C>storage: &quot;local&quot;</C> or a <C>repository</C>.
              </>
            ),
          },
          {
            name: "icon",
            type: "FC<{ className?: string }>",
            description: "Shown in menus, in tabs and in the header of a list.",
          },
          {
            name: "alias",
            type: "string",
            description: "A second identifier the router also accepts.",
          },
          {
            name: "storage",
            type: '"local"',
            description: (
              <>
                Keeps the records in localStorage instead of an API — declared, so a
                forgotten <C>path</C> does not look like a working API.
              </>
            ),
          },
          {
            name: "dialect",
            type: "ApiDialectInterface",
            description: (
              <>
                How this resource&apos;s API spells its requests, when it is not the
                one given to <C>configureApi</C>. See{" "}
                <A href="/docs/resource-view/backends">Backends</A>.
              </>
            ),
          },
          {
            name: "form, fullWidth, titleField, components, description",
            type: "CommonViewOptions",
            description: (
              <>
                What every action starts from, adjusted per action in{" "}
                <C>views</C> — <C>fullWidth</C> included, see{" "}
                <A href="#full-width">Full width</A>.
              </>
            ),
          },
          {
            name: "views",
            type: "{ list, read, create, update, delete }",
            description: "What is particular to one action, merged over the root.",
          },
          {
            name: "permissions",
            type: '"all" | "readonly" | Action[] | { [action]: boolean | fn }',
            default: '"all"',
            description: (
              <>
                What the users may do — everything unless restricted here. See{" "}
                <A href="/docs/resource-view/permissions">Permissions</A>.
              </>
            ),
          },
          {
            name: "hooks",
            type: "ResourceHooks",
            description: (
              <>
                Code run around the calls to the data. See{" "}
                <A href="#hooks">Shaping requests</A>.
              </>
            ),
          },
          {
            name: "realtime",
            type: "boolean",
            description: "Reloads the views when the API pushes a change (Mercure).",
          },
          {
            name: "optimistic",
            type: "boolean",
            default: "true",
            description:
              "Draws every write before the API answers, and puts it back if the API refuses.",
          },
          {
            name: "quota",
            type: "{ get, fallback }",
            description: "A creation quota, with a fallback rendered once reached.",
          },
          {
            name: "repository",
            type: "{ getCollection, getItem, createItem, updateItem, removeItem }",
            description:
              "Replaces some or all of the calls to the data, one method at a time.",
          },
        ]}
      />

      <H2 id="repository">Where the data comes from</H2>

      <P>
        <C>createViewResource</C> picks a <Term id="repository">repository</Term>{" "}
        from what it declares: a <C>path</C>, or <C>storage: &quot;local&quot;</C>.
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
          <strong>
            With <C>storage: &quot;local&quot;</C>
          </strong>{" "}
          — a localStorage repository keyed on the resource id, with the same
          interface. Neither declared, development throws an error naming the
          resource.
        </Li>
      </Ul>

      <CodeBlock>{LOCAL}</CodeBlock>

      <P>
        The second is not only for demos: it is a genuine offline store, and it is
        what makes a resource testable without a server.
      </P>

      <Callout kind="note" title="Or bring your own">
        <P>
          Any of the five methods can be given in <C>repository</C> and takes
          precedence — a resource reading from IndexedDB, from a GraphQL endpoint, or
          from an in-memory fixture is the same declaration with five functions on
          it.
        </P>
      </Callout>

      <H2 id="hooks">Shaping requests</H2>

      <P>
        <C>hooks</C> sit between the views and the repository. Each receives{" "}
        <C>{"{"} viewResourceContext {"}"}</C>, and may answer asynchronously, so a value can be derived from the surrounding view — the
        parent item of a <Term id="sub-view">sub-view</Term>, the active filter, the
        current <Term id="scope">scope</Term>.
      </P>

      <CodeBlock>{HOOKS}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "beforeList",
            type: "(params, context) => params",
            description:
              "Before a collection is fetched. Sorting, extra query parameters, a forced filter.",
          },
          {
            name: "beforeRead",
            type: "(params, context) => params",
            description: "Before a single item is fetched.",
          },
          {
            name: "beforeCreate",
            type: "(data, context) => data",
            description: "Before a create. Injecting an owner or a tenant.",
          },
          {
            name: "beforeUpdate",
            type: "(data, context) => data",
            description: "Before an update.",
          },
          {
            name: "beforeDelete",
            type: "(item, context) => item",
            description: "Before a delete.",
          },
          {
            name: "afterSave",
            type: "(item, context & { action }) => void",
            description:
              "After a create or an update, with the record the API answered.",
          },
          {
            name: "afterDelete",
            type: "(item, context) => void",
            description: "After a delete.",
          },
        ]}
      />

      <P>
        The filter currently applied is merged into the collection request after{" "}
        <C>beforeList</C> runs, so a hook cannot accidentally erase what the
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
