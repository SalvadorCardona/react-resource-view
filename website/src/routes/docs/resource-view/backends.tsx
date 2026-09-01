import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, H3, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/backends")({
  head: () => ({
    meta: [
      { title: "Backends & dialects — react-resource-view" },
      {
        name: "description",
        content:
          "One declared resource, three backends: API Platform, Strapi and Supabase. What a dialect knows, and how to write a fourth.",
      },
    ],
  }),
  component: Backends,
})

const CONFIGURE = `import { configureApi, strapiDialect } from "react-resource-view"

configureApi({
  baseUrl: "https://cms.example.com",
  getAuthToken: () => (isLogged() ? getUserToken() : undefined),
  dialect: strapiDialect(),
})`

const STRAPI = `import { configureApi, createViewResource, strapiDialect } from "react-resource-view"

configureApi({
  baseUrl: "https://cms.example.com",
  getAuthToken: () => getApiToken(),
  dialect: strapiDialect(),
})

const articles = createViewResource("articles", {
  path: "articles", // → /api/articles
  name: "Articles",
  view: {
    itemsPerPage: 25,
    form: { inputs: { title: { label: "Title" }, body: { label: "Body" } } },
  },
})`

const SUPABASE = `import { configureApi, createViewResource, supabaseDialect } from "react-resource-view"

configureApi({
  baseUrl: "https://xyzcompany.supabase.co",
  getAuthToken: () => getSession()?.access_token,
  dialect: supabaseDialect({ apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY }),
})

const articles = createViewResource("articles", {
  path: "articles", // → /rest/v1/articles
  name: "Articles",
  view: { form: { inputs: { title: { label: "Title" } } } },
})`

const PER_RESOURCE = `// Most of the application is on Strapi…
configureApi({ baseUrl, dialect: strapiDialect() })

// …and this one table is not.
const invoices = createViewResource("invoices", {
  path: "invoices",
  dialect: supabaseDialect({ apiKey }),
})`

const FILTERS = `view: {
  itemsPerPage: 25,
  defaultFilter: { status: "published", order: { createdAt: "desc" } },
  formFilter: { inputs: { title: { label: "Title" } } },
}`

const OPERATORS = `// Strapi — any operator the REST API accepts
defaultFilter: { title: { $containsi: "hello" } }

// Supabase — any PostgREST operator
defaultFilter: { createdAt: { gte: "2024-01-01" } }`

const CUSTOM = `import type { ApiDialectInterface } from "react-resource-view"

const myDialect: ApiDialectInterface = {
  name: "my-api",
  buildRequest: ({ name, path, id, filter, item }) => ({ url: "…", method: "GET" }),
  readCollection: (payload) => ({ items: payload.rows, totalItems: payload.count }),
  readItem: (payload) => payload.row,
  getId: (item) => item?.uuid,
  getIdentifier: (item) => item?.uuid,
  normalizeError: (payload, status) => ({ status, detail: payload.message }),
  referencesAreIris: false,
}`

function Backends() {
  return (
    <DocArticle
      toc={[
        { id: "dialects", title: "What a dialect knows" },
        { id: "strapi", title: "Strapi" },
        { id: "supabase", title: "Supabase" },
        { id: "several", title: "Two backends at once" },
        { id: "filters", title: "Filters, pages and sorts" },
        { id: "custom", title: "Another API entirely" },
      ]}
    >
      <H2 id="dialects">What a dialect knows</H2>

      <P>
        The views know a resource has rows, pages and filters. How a given backend
        spells those — the URL an item lives at, the query string a filter becomes,
        the envelope a collection arrives in, where the validation errors hide — is a{" "}
        <strong>dialect</strong>, set once at startup.
      </P>

      <CodeBlock filename="setup.ts">{CONFIGURE}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "jsonLdDialect()",
            type: "ApiDialectInterface",
            default: "the default",
            description: (
              <>
                <A href="https://api-platform.com">API Platform</A> and Hydra.{" "}
                <C>member</C> / <C>totalItems</C>, IRIs, <C>page</C> and{" "}
                <C>itemsPerPage</C>, Hydra <C>violations</C>, Mercure, CSV export.
              </>
            ),
          },
          {
            name: "strapiDialect()",
            type: "ApiDialectInterface",
            default: "—",
            description: (
              <>
                <A href="https://strapi.io">Strapi</A> v4 and v5.{" "}
                <C>pagination[page]</C>, <C>filters[field][$eq]</C>, <C>sort[0]</C>,{" "}
                <C>populate</C>, writes wrapped in <C>data</C>, <C>documentId</C>.
              </>
            ),
          },
          {
            name: "supabaseDialect()",
            type: "ApiDialectInterface",
            default: "—",
            description: (
              <>
                <A href="https://supabase.com">Supabase</A>, over PostgREST.{" "}
                <C>limit</C> / <C>offset</C>, <C>field=eq.value</C>, <C>order</C>, the
                count read from <C>Content-Range</C>, rows addressed by their primary
                key.
              </>
            ),
          },
        ]}
      />

      <Callout kind="note" title="An API Platform application changes nothing">
        <P>
          JSON-LD is the default, and it still goes through the client configured
          with <C>configureClient</C> — middleware, scope header and typed paths
          included. <C>configureApi</C> falls back to that client's settings when it
          is given none of its own, so nothing has to move.
        </P>
      </Callout>

      <H2 id="strapi">Strapi</H2>

      <CodeBlock filename="setup.ts">{STRAPI}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "apiPath",
            type: "string",
            default: `"/api"`,
            description: (
              <>
                Prefix of the REST routes. A <C>path</C> that already carries it is
                left alone, so <C>"articles"</C> and <C>"/api/articles"</C> both work.
              </>
            ),
          },
          {
            name: "populate",
            type: `string | string[] | false`,
            default: `"*"`,
            description:
              "Which relations come back. Without it the relation columns of a list are empty.",
          },
          {
            name: "identifier",
            type: `"documentId" | "id"`,
            default: `"documentId"`,
            description: (
              <>
                How an entry is addressed: <C>documentId</C> on v5, <C>id</C> on v4. A
                record without the preferred one falls back to the other.
              </>
            ),
          },
          {
            name: "defaultOperator",
            type: "string",
            default: `"$eq"`,
            description: (
              <>
                What a plain filter value becomes. Pass <C>"$containsi"</C> to turn
                every text filter into a case-insensitive search.
              </>
            ),
          },
        ]}
      />

      <P>
        The v4 <C>{`{ id, attributes }`}</C> envelope — and the <C>{`{ data }`}</C>{" "}
        wrapper around each relation — is flattened on the way in, so{" "}
        <C>article.title</C> and <C>article.author.name</C> read the same on both
        versions and a resource declared once works against either.
      </P>

      <Callout kind="note" title="No CSV export">
        <P>
          Strapi serves no CSV endpoint, so the export button of a list hides itself
          rather than offering a download that would 404. Nothing to configure.
        </P>
      </Callout>

      <H2 id="supabase">Supabase</H2>

      <CodeBlock filename="setup.ts">{SUPABASE}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "apiKey",
            type: "string | (() => string | undefined)",
            default: "—",
            description: (
              <>
                The project's anon key, sent as <C>apikey</C> on every request
                alongside the signed-in user's token. A function is accepted, for a
                key that only exists once the environment is read.
              </>
            ),
          },
          {
            name: "primaryKey",
            type: "string",
            default: `"id"`,
            description:
              "How a row is addressed — PostgREST has no item route, so a single row is a filter on this column.",
          },
          {
            name: "select",
            type: "string",
            default: `"*"`,
            description: (
              <>
                Sent with every read. <C>"*,author(*)"</C> embeds a relation, the way
                Supabase joins.
              </>
            ),
          },
          {
            name: "schema",
            type: "string",
            default: "public",
            description: (
              <>
                Sent as <C>Accept-Profile</C> and <C>Content-Profile</C>, for a table
                outside <C>public</C>.
              </>
            ),
          },
          {
            name: "defaultTextOperator",
            type: `"eq" | "ilike" | "like"`,
            default: `"eq"`,
            description: (
              <>
                What a plain text filter becomes. <C>"ilike"</C> turns the filter bar
                into a case-insensitive search bar.
              </>
            ),
          },
          {
            name: "restPath",
            type: "string",
            default: `"/rest/v1"`,
            description: "Prefix of the REST routes.",
          },
        ]}
      />

      <Callout kind="note" title="The count comes from a header">
        <P>
          PostgREST counts only when asked, and answers in <C>Content-Range</C>. The
          dialect asks — <C>Prefer: count=exact</C> — and keeps the total in the
          collection it hands the views, since the header is long gone by the time the
          pagination renders. A list whose API reports no total renders no pagination
          rather than inventing a page count.
        </P>
      </Callout>

      <H2 id="several">Two backends at once</H2>

      <P>
        A resource may carry a <C>dialect</C> of its own, which wins over the
        configured one:
      </P>

      <CodeBlock>{PER_RESOURCE}</CodeBlock>

      <Callout kind="warning" title="The dialect is read when the resource is built">
        <P>
          <C>createViewResource</C> builds the resource's repository as it runs, so{" "}
          <C>configureApi</C> has to come first — in a file your entry point imports
          before it declares any resource.
        </P>
      </Callout>

      <H2 id="filters">Filters, pages and sorts</H2>

      <P>
        They are written once, in the package's own vocabulary, and the dialect
        translates them. Three keys are reserved; everything else in a filter is a
        field of the resource.
      </P>

      <CodeBlock>{FILTERS}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "page",
            type: "number",
            default: "1",
            description: (
              <>
                1-based page. <C>pagination[page]</C> on Strapi, an <C>offset</C> on
                Supabase, <C>page</C> on API Platform.
              </>
            ),
          },
          {
            name: "itemsPerPage",
            type: "number",
            default: "view.itemsPerPage",
            description: (
              <>
                Rows per page. <C>pagination[pageSize]</C> on Strapi, <C>limit</C> on
                Supabase. The page size a view declares travels with the request, so
                the pagination counts the rows the API actually returned.
              </>
            ),
          },
          {
            name: "order",
            type: `Record<string, "asc" | "desc">`,
            default: "—",
            description: (
              <>
                The sort, field by field. <C>sort[0]=title:asc</C> on Strapi,{" "}
                <C>order=title.asc</C> on Supabase.
              </>
            ),
          },
        ]}
      />

      <P>A field filter takes the shape its value has:</P>

      <Ul>
        <Li>
          a scalar is an equality — <C>filters[title][$eq]</C>, <C>title=eq.hello</C>;
        </Li>
        <Li>
          an array is “any of” — <C>filters[status][$in]</C>,{" "}
          <C>status=in.(draft,published)</C>;
        </Li>
        <Li>an object carries its own operator through untouched.</Li>
      </Ul>

      <CodeBlock>{OPERATORS}</CodeBlock>

      <P>
        An empty value is left out of the request entirely: an empty search box widens
        the list rather than filtering it down to rows whose field is the empty
        string.
      </P>

      <H3>Errors</H3>

      <P>
        Whatever the backend called it — Hydra <C>violations</C>, a Strapi{" "}
        <C>error.details.errors</C>, a PostgREST message — the dialect reads it into
        one shape, and the form pins each message on the field that caused it. A
        failure with no field to blame, such as a unique constraint, becomes the
        toast's description instead. See{" "}
        <A href="/docs/form/validation">validation &amp; API errors</A>.
      </P>

      <H2 id="custom">Another API entirely</H2>

      <P>
        A dialect is one object, and <C>ApiDialectInterface</C> is exported to
        implement it:
      </P>

      <CodeBlock filename="myDialect.ts">{CUSTOM}</CodeBlock>

      <P>
        <C>buildRequest</C> is called with one of six operations —{" "}
        <C>getCollection</C>, <C>getItem</C>, <C>createItem</C>, <C>updateItem</C>,{" "}
        <C>replaceItem</C>, <C>removeItem</C> — and describes the request rather than
        sending it; the package's own repository sends it, carrying the base URL, the
        token and the headers. Two optional members go further: <C>exportRequest</C>{" "}
        lights up the CSV button, and <C>realtimeTopic</C> subscribes a list to a push
        channel.
      </P>

      <P>
        A resource that brings its own <C>getCollection</C>, <C>getItem</C> and the
        rest still bypasses all of this, as it always could — see{" "}
        <A href="/docs/resource-view/resources">declaring a resource</A>.
      </P>
    </DocArticle>
  )
}
