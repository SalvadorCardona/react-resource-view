import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions and quotas — react-resource-view" },
      {
        name: "description",
        content:
          "Five permission flags, evaluated on render, and a creation limit that can render a fallback instead of the button.",
      },
    ],
  }),
  component: Permissions,
})

const FLAGS = `createViewResource("articles", {
  path: "/api/articles",

  // A boolean, or a function evaluated on every render.
  canRead: true,
  canCreate: () => user.hasRole("editor"),
  canUpdate: () => user.hasRole("editor"),
  canDelete: () => user.hasRole("admin"),
})`

const DENIED = `// ⚠️ No permission declared at all → nothing is offered.
createViewResource("articles", { path: "/api/articles" })
// The list renders, but there is no create button, no edit and no delete.`

const LIMIT = `import type { LimitInterface } from "react-resource-view"

createViewResource("projects", {
  path: "/api/projects",
  canCreate: true,
  limit: {
    // Synchronous: count what the context already holds.
    getLimit: (context) => ({
      current: context.data?.totalItems ?? 0,
      max: subscription.plan === "free" ? 3 : Infinity,
    }),
    // Rendered in place of the create button once current >= max.
    fallback: ({ limit }) => (
      <UpgradePrompt used={limit.current} allowed={limit.max} />
    ),
  },
})`

const ASYNC_LIMIT = `limit: {
  // Or asynchronous: a quota only the API knows.
  getLimit: async () => {
    const { data } = await api.get("/quota/projects")
    return { current: data.used, max: data.allowed }
  },
}`

const SCOPE_AUTH = `// Scope-level, for a whole area of the application.
{
  name: "admin",
  authorization: () => {
    if (!isLogged()) throw new UnauthorizedError()   // 401
    if (!user.isAdmin) throw new ForbiddenError()    // 403
    return true
  },
}`

function Permissions() {
  return (
    <DocArticle
      toc={[
        { id: "flags", title: "Five flags" },
        { id: "default-deny", title: "Undeclared means denied" },
        { id: "limit", title: "Creation quotas" },
        { id: "scope", title: "Authorising a whole scope" },
        { id: "server", title: "This is not security" },
      ]}
    >
      <H2 id="flags">Five flags</H2>

      <P>
        Each maps to an action, and each is either a boolean or a function evaluated
        on render — so a permission can follow a session that changes without
        anything being re-declared.
      </P>

      <CodeBlock>{FLAGS}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "canRead",
            type: "boolean | (() => boolean)",
            description: (
              <>
                Covers both <C>read</C> and <C>list</C> — seeing a record and seeing
                the collection are the same right.
              </>
            ),
          },
          {
            name: "canCreate",
            type: "boolean | (() => boolean)",
            description: "The create button and the create view.",
          },
          {
            name: "canUpdate",
            type: "boolean | (() => boolean)",
            description: "The edit button, and editing in place in a table.",
          },
          {
            name: "canDelete",
            type: "boolean | (() => boolean)",
            description: "The delete button and its confirmation.",
          },
          {
            name: "canList",
            type: "boolean | (() => boolean)",
            description: (
              <>
                Carried on the resource for your own use — the action check itself
                reads <C>canRead</C>.
              </>
            ),
          },
        ]}
      />

      <P>
        A denied action removes its button entirely rather than disabling it:{" "}
        <C>ResourceViewButton</C> returns nothing. <C>permissionResource</C> is
        exported, so a menu or a dashboard can ask the same question and stay
        consistent.
      </P>

      <H2 id="default-deny">Undeclared means denied</H2>

      <Callout kind="danger" title="This is the one that surprises people">
        <P>
          An undeclared permission evaluates to <strong>false</strong>. A resource
          with no flags renders its list and offers nothing else — no create, no
          edit, no delete — and nothing errors to tell you why.
        </P>
      </Callout>

      <CodeBlock>{DENIED}</CodeBlock>

      <P>
        Deny-by-default is the right way round for a package that renders write
        actions, but it does mean the flags are part of a working declaration rather
        than an optional extra. Every demo on this site sets all four.
      </P>

      <H2 id="limit">Creation quotas</H2>

      <P>
        A permission answers <em>may they</em>; a limit answers{" "}
        <em>how many more</em>. <C>getLimit</C> receives the current context, so the
        count can come from data already loaded rather than another request.
      </P>

      <CodeBlock>{LIMIT}</CodeBlock>

      <CodeBlock>{ASYNC_LIMIT}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "getLimit",
            type: "(context) => LimitState | Promise<LimitState>",
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
            type: "FC<{ limit: LimitState }>",
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
          A limit can also be injected at runtime through the view context, which is
          how a nested view's create button is driven by how many rows the parent has
          selected.
        </Li>
        <Li>
          <C>useLimit</C> is exported, should a component of yours need to ask the
          same question.
        </Li>
      </Ul>

      <H2 id="scope">Authorising a whole scope</H2>

      <P>
        Per-resource flags are about buttons. Whether a reader may be in this part of
        the application at all is a <A href="/docs/resource-view/scopes">scope</A>{" "}
        question.
      </P>

      <CodeBlock>{SCOPE_AUTH}</CodeBlock>

      <P>
        <C>UnauthorizedError</C> (401) and <C>ForbiddenError</C> (403) are exported
        and carry their status. <C>onUnauthorized</C> on the resource configuration
        is where you send the reader to sign in.
      </P>

      <H2 id="server">This is not security</H2>

      <Callout kind="warning" title="Everything here is presentation">
        <P>
          These flags decide what is <em>offered</em>. They run in the browser, where
          anyone can change them. The API is what decides what is <em>allowed</em>,
          and it has to enforce the same rules independently.
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
