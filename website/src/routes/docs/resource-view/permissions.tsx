import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Term, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions and quotas — react-resource-view" },
      {
        name: "description",
        content:
          "One permissions object — everything allowed by default, rules per record, asynchronous answers — and a creation quota that can render a fallback instead of the button.",
      },
    ],
  }),
  component: Permissions,
})

const FLAGS = `// hasRole() reads a session loaded once — see Authentication.
createViewResource<Article>("articles", {
  path: "/api/articles",

  // Everything is allowed by default: only the restrictions are written.
  // A boolean, or a function of the record — which may answer with a promise.
  permissions: {
    create: () => hasRole("editor"),
    update: ({ item }) => hasRole("editor") && item?.status !== "archived",
    delete: () => hasRole("admin"),
  },
})`

const SHORTHANDS = `permissions: "readonly"                  // list, read and export
permissions: ["list", "read", "update"]  // those, and nothing else
permissions: { export: false }           // everything but the CSV export`

const IN_COMPONENT = `import { usePermission } from "react-resource-view"

function ArchiveButton({ article }: { article: Article }) {
  // false while an asynchronous permission is still answering.
  const canUpdate = usePermission("update", article)
  return canUpdate ? <button onClick={() => archive(article)}>Archive</button> : null
}`

const LIMIT = `import { createViewResource, getCollectionTotal } from "react-resource-view"

createViewResource("projects", {
  path: "/api/projects",
  quota: {
    // Synchronous: count what the context already holds, whatever the dialect.
    get: (context) => ({
      current: getCollectionTotal(context.data, context.resource) ?? 0,
      max: subscription.plan === "free" ? 3 : Infinity,
    }),
    // Rendered in place of the create button once current >= max.
    fallback: ({ quota }) => (
      <UpgradePrompt used={quota.current} allowed={quota.max} />
    ),
  },
})`

const ASYNC_LIMIT = `quota: {
  // Or asynchronous: a quota only the API knows.
  get: async () => {
    const { data } = await api.get("/quota/projects")
    return { current: data.used, max: data.allowed }
  },
}`

const SCOPE_AUTH = `// Scope-level, for a whole area of the application.
{
  name: "admin",
  // Synchronous or async: nothing of the scope renders until it has answered.
  authorization: async () => {
    const { data } = await authClient.getSession()
    if (!data) throw new UnauthorizedError()                  // 401
    if (data.user.role !== "admin") throw new ForbiddenError() // 403
    return true
  },
}`

function Permissions() {
  return (
    <DocArticle
      toc={[
        { id: "flags", title: "One permissions object" },
        { id: "default-allow", title: "Allowed by default" },
        { id: "limit", title: "Creation quotas" },
        { id: "scope", title: "Authorising a whole scope" },
        { id: "server", title: "This is not security" },
      ]}
    >
      <H2 id="flags">One permissions object</H2>

      <P>
        Each key maps to an action — <C>list</C>, <C>read</C>, <C>create</C>,{" "}
        <C>update</C>, <C>delete</C>, and the CSV <C>export</C> — and each is either a
        boolean or a function. A function is told the record the action would apply
        to, so a rule can be about one record; it may answer with a promise, and it
        is asked again as the session changes, without anything being re-declared.
      </P>

      <CodeBlock>{FLAGS}</CodeBlock>

      <P>
        Where <C>hasRole</C> comes from — a session fetched once and read
        synchronously afterwards — is shown step by step in{" "}
        <A href="/docs/resource-view/authentication">Authentication</A>.
      </P>

      <PropsTable
        rows={[
          {
            name: "list",
            type: "Permission",
            description: (
              <>
                The list and the way back to it. Refused, the list page draws the
                forbidden fallback.
              </>
            ),
          },
          {
            name: "read",
            type: "Permission",
            description: "The read button, the read view, and a board's cards opening.",
          },
          {
            name: "create",
            type: "Permission",
            description: "The create button and the create view.",
          },
          {
            name: "update",
            type: "Permission",
            description: "The edit button, and editing in place in a table.",
          },
          {
            name: "delete",
            type: "Permission",
            description: "The delete button, its confirmation, and the bulk deletion.",
          },
          {
            name: "export",
            type: "Permission",
            description: "The CSV export button of the list.",
          },
        ]}
      />

      <P>
        <C>Permission</C> is <C>boolean</C> or{" "}
        <C>({"{"} action, item, context {"}"}) =&gt; boolean | Promise&lt;boolean&gt;</C>
        . The asynchronous answers are kept per action and record while a list is on
        screen, so a list of fifty rows asks once per row. Three shorthands cover the
        common cases:
      </P>

      <CodeBlock>{SHORTHANDS}</CodeBlock>

      <P>
        A refused action removes its button entirely rather than disabling it, and
        protects its route: <C>/articles/update/42</C> typed by hand draws the
        scope&apos;s <C>forbiddenFallback</C> instead of the form. A component of
        yours asks the same question with <C>usePermission</C> — and{" "}
        <C>permissionResource(resource, action, {"{"} item {"}"})</C> outside React —
        so a menu or a dashboard stays consistent.
      </P>

      <CodeBlock>{IN_COMPONENT}</CodeBlock>

      <H2 id="default-allow">Allowed by default</H2>

      <Callout kind="note" title="Nothing declared, everything offered">
        <P>
          A resource that declares no <C>permissions</C> offers every action: the
          list, the read and edit buttons, the create button, the delete
          confirmation and the export. A resource meant to be read-only says so with{" "}
          <C>permissions: &quot;readonly&quot;</C>.
        </P>
      </Callout>

      <P>
        Allow-by-default is the right way round for presentation: the interface only
        decides what is offered, and the API is where access is enforced. A
        declaration says only what it restricts, and a first resource works without
        a single permission in it.
      </P>

      <H2 id="limit">Creation quotas</H2>

      <P>
        A permission answers <em>may they</em>; a quota answers{" "}
        <em>how many more</em>. <C>quota.get</C> receives the current context, so the
        count can come from data already loaded rather than another request.
      </P>

      <CodeBlock>{LIMIT}</CodeBlock>

      <CodeBlock>{ASYNC_LIMIT}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "get",
            type: "(context) => QuotaState | Promise<QuotaState>",
            required: true,
            description: (
              <>
                Returns <C>{"{ current, max }"}</C>. A promise is unwrapped in an
                effect and the last result kept.
              </>
            ),
          },
          {
            name: "fallback",
            type: "FC<{ quota: QuotaState }>",
            description: (
              <>
                Rendered instead of the create button once <C>current &gt;= max</C>.
                Without it the button is simply hidden.
              </>
            ),
          },
        ]}
      />

      <Ul>
        <Li>
          <C>max: Infinity</C> means unlimited — the honest way to express “this plan
          has no cap”.
        </Li>
        <Li>
          A quota can also be injected at runtime through the{" "}
          <Term id="view">view</Term> context, which is how a nested view's create
          button is driven by how many rows the parent has selected.
        </Li>
        <Li>
          <C>useQuota</C> is exported, should a component of yours need to ask the
          same question.
        </Li>
      </Ul>

      <H2 id="scope">Authorising a whole scope</H2>

      <P>
        Per-resource permissions are about actions. Whether a reader may be in this
        part of the application at all is a{" "}
        <A href="/docs/resource-view/scopes">scope</A> question.
      </P>

      <CodeBlock>{SCOPE_AUTH}</CodeBlock>

      <P>
        <C>UnauthorizedError</C> (401) and <C>ForbiddenError</C> (403) are exported
        and carry their status, thrown or rejected alike. <C>onUnauthorized</C> on
        the resource configuration is where you send the reader to sign in; a 403,
        or a <C>false</C>, renders <C>forbiddenFallback</C> instead of the{" "}
        <Term id="scope">scope</Term>.{" "}
        <A href="/docs/resource-view/authentication">Authentication</A> wires it to
        Better Auth, sign-out included.
      </P>

      <H2 id="server">This is not security</H2>

      <Callout kind="warning" title="Everything here is presentation">
        <P>
          These permissions decide what is <em>offered</em>. They run in the browser,
          where anyone can change them. The API is what decides what is{" "}
          <em>allowed</em>, and it has to enforce the same rules independently.
        </P>
        <P>
          Their real job is to stop the reader being shown an action that will be
          rejected — and <A href="/docs/form/validation">the 422 mapping</A> is what
          handles the case where they disagree anyway.
        </P>
      </Callout>
    </DocArticle>
  )
}
