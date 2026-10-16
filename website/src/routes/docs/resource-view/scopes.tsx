import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Term, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/scopes")({
  head: () => ({
    meta: [
      { title: "Scopes and menu — react-resource-view" },
      {
        name: "description",
        content:
          "A scope groups the resources of one area of the application: its menu, its home, its authorisation — and it is a code-splitting boundary.",
      },
    ],
  }),
  component: Scopes,
})

const SCOPE = `import type { ScopeInterface } from "react-resource-view"
import { UnauthorizedError } from "react-resource-view"
import { authClient } from "../auth-client"

export const adminScope: ScopeInterface = {
  name: "admin",
  label: "Administration",
  // The one place a resource's scope is written: their links lead here.
  resources: [articles, authors, categories],
  home: "/admin/articles/list",
  // Resources as they are, or links of your own — "auto" lists \`resources\`.
  menu: [
    articles,
    authors,
    { name: "Reports", href: "/admin/reports", icon: BarChart },
  ],
  // Synchronous or async — the scope renders once it has answered.
  authorization: async () => {
    const { data } = await authClient.getSession()
    if (!data) throw new UnauthorizedError()
    return true
  },
  decoratorComponent: AdminShell,
}`

const CONFIG = `import { ResourceViewProvider } from "react-resource-view"

<ResourceViewProvider
  viewResourceContextParams={parseLink(url)}
  configuration={{
    // Lazily loaded, one per area — each import() is its own chunk.
    scopes: {
      admin: () => import("./scopes/admin").then((m) => m.adminScope),
      portal: () => import("./scopes/portal").then((m) => m.portalScope),
    },
    defaultScope: "portal",
    onUnauthorized: () => router.navigate({ to: "/sign-in" }),
    scopeFallback: <Loader />,
  }}
/>`

const FLAT = `// A small application needs no scopes at all.
<ResourceViewProvider
  viewResourceContextParams={{ resourceId: "articles", resourceAction: ActionList.list }}
  configuration={{ resources: [articles, authors] }}
/>`

const MENU = `import { useIsActiveItemMenu } from "react-resource-view"

function Sidebar({ menu }: { menu: MenuItemInterface[] }) {
  const isActive = useIsActiveItemMenu()

  return menu.map((item) => (
    <Link key={item.name} to={item.href} aria-current={isActive(item) ? "page" : undefined}>
      {item.icon && <item.icon />}
      {item.name}
    </Link>
  ))
}`

const SAME_PATH = `// Two resources over one endpoint, one per scope, both answering to "articles".
export const adminArticles = createViewResource("admin_articles", {
  alias: "articles",
  path: "/api/articles",
})
export const portalArticles = createViewResource("portal_articles", {
  alias: "articles",
  path: "/api/articles",
  permissions: "readonly",
})

// scopes/admin.ts → resources: [adminArticles]
// scopes/portal.ts → resources: [portalArticles]`

function Scopes() {
  return (
    <DocArticle
      toc={[
        { id: "what", title: "What a scope is" },
        { id: "declaring", title: "Declaring one" },
        { id: "config", title: "Wiring them up" },
        { id: "menu", title: "Building the menu" },
        { id: "same-path", title: "One endpoint, two scopes" },
      ]}
    >
      <H2 id="what">What a scope is</H2>

      <P>
        An area of the application: its set of <Term id="resource">resources</Term>,
        its menu, its landing page, and whether the reader is allowed in it at all.
        The <Term id="scope">scope</Term> name is the first segment of every URL the{" "}
        <Term id="view">views</Term> build, which is what makes it a genuine boundary
        rather than a folder.
      </P>

      <Ul>
        <Li>
          <strong>A namespace.</strong> Two resources may answer to the same name in
          the URL if they live in different scopes.
        </Li>
        <Li>
          <strong>An authorisation boundary.</strong> One function, synchronous or
          async, decides access to everything inside —{" "}
          <A href="/docs/resource-view/authentication">Authentication</A> wires it
          to a real session.
        </Li>
        <Li>
          <strong>A code-splitting boundary.</strong> Scopes are loaded lazily, so an
          administration area is never downloaded by a reader who never opens it.
        </Li>
        <Li>
          <strong>A layout boundary.</strong> <C>decoratorComponent</C> wraps every
          view of the scope.
        </Li>
      </Ul>

      <Callout kind="tip" title="You may not need one">
        <P>
          Scopes earn their keep when an application has clearly separate areas — a
          back office and a customer portal. Below that, pass <C>resources</C>{" "}
          directly and skip the whole mechanism.
        </P>
      </Callout>

      <CodeBlock>{FLAT}</CodeBlock>

      <H2 id="declaring">Declaring one</H2>

      <CodeBlock filename="scopes/admin.ts">{SCOPE}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "name",
            type: "string",
            required: true,
            description: "The first URL segment of every view of the scope.",
          },
          {
            name: "label",
            type: "string",
            description: "Human-readable name, for a scope switcher.",
          },
          {
            name: "resources",
            type: "ViewResource[]",
            description: (
              <>
                Everything the scope can render — the one place a resource&apos;s
                scope is declared: each resource listed here links within it.
              </>
            ),
          },
          {
            name: "menu",
            type: '"auto" | (ViewResource | MenuItemInterface)[]',
            description: (
              <>
                The navigation, yours to render. <C>&quot;auto&quot;</C> lists{" "}
                <C>resources</C> in order; a list mixes resources with links and
                groups of your own.
              </>
            ),
          },
          {
            name: "home",
            type: "string",
            description: "Where an entry with no context lands.",
          },
          {
            name: "authorization",
            type: "() => boolean | Promise<boolean>",
            description: (
              <>
                Throws or rejects with <C>UnauthorizedError</C> (401) or{" "}
                <C>ForbiddenError</C> (403) to refuse; <C>false</C> counts as a 403.
                Nothing of the scope renders until it has answered — see{" "}
                <A href="/docs/resource-view/authentication">Authentication</A>.
              </>
            ),
          },
          {
            name: "authorizationFallback",
            type: "ReactNode",
            description: "Shown while authorization is pending.",
          },
          {
            name: "forbiddenFallback",
            type: "ReactNode",
            description: "Shown on a 403 instead of the scope.",
          },
          {
            name: "decoratorComponent",
            type: "FC<{ children }>",
            description: (
              <>
                Wraps every view of the scope — the shell of the area.{" "}
                <A href="/docs/resource-view/admin-layout">AdminLayout</A> is a
                ready-made one.
              </>
            ),
          },
          {
            name: "middleWare",
            type: "() => void",
            description:
              "Runs when the scope is entered — analytics, a fetch, a redirect.",
          },
          {
            name: "defaultViewResourceContextParams",
            type: "ViewResourceContextParams",
            description: "What the scope opens on when the URL says nothing more.",
          },
        ]}
      />

      <H2 id="config">Wiring them up</H2>

      <CodeBlock>{CONFIG}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "scopes",
            type: "Record<string, () => Promise<ScopeInterface>>",
            description:
              "Lazily loaded. The function is the split point, so each area is its own chunk.",
          },
          {
            name: "resources",
            type: "ViewResource[]",
            description: "The flat alternative, when there are no scopes.",
          },
          {
            name: "defaultScope",
            type: "string",
            description: "Used when the URL names none.",
          },
          {
            name: "decoratorComponent",
            type: "FC<{ children }>",
            description: "Wraps every view, across every scope.",
          },
          {
            name: "onUnauthorized",
            type: "() => void",
            description:
              "Called when an authorisation throws or rejects with a 401. Where you redirect to sign-in.",
          },
          {
            name: "authorizationFallback",
            type: "ReactNode",
            description:
              "Shown while a scope's authorization is pending, unless the scope sets its own.",
          },
          {
            name: "forbiddenFallback",
            type: "ReactNode",
            description:
              "Shown on a 403, unless the scope sets its own. Defaults to an “Access denied” message.",
          },
          {
            name: "scopeFallback",
            type: "ReactNode",
            description: "Shown while a scope's chunk is loading.",
          },
        ]}
      />

      <P>
        What every resource starts from — a shared empty state, edit forms in a
        drawer — is not part of this configuration but of{" "}
        <C>configureResourceView({"{"} defaults {"}"})</C>, called once at startup
        with the shape of a declaration and merged beneath every resource.
      </P>

      <Callout kind="warning" title="Lazy scopes suspend">
        <P>
          A lazily loaded scope suspends on first paint. That is the right trade-off
          in an application, and the wrong one for an example sitting in a page of
          prose — which is why the demos below pass <C>resources</C> directly, while
          the <A href="/playground">playground</A>, being a real application,
          declares its back office as a lazily loaded scope.
        </P>
      </Callout>

      <H2 id="menu">Building the menu</H2>

      <P>
        The menu is data — rendering it is yours, or{" "}
        <A href="/docs/resource-view/admin-layout">AdminLayout</A>&apos;s, if a
        collapsible sidebar built from it is enough. A resource in a scope&apos;s{" "}
        <C>menu</C> becomes an entry pointing at its list, in the configured routing
        mode; outside a scope, <C>createItemMenuWithResource({"{"} resource, scope{" "}
        {"}"})</C> builds the same entry.
      </P>

      <CodeBlock>{MENU}</CodeBlock>

      <Callout kind="danger" title="useIsActiveItemMenu, not isActiveItemMenu">
        <P>
          <C>isActiveItemMenu</C> reads the address bar directly, so on a server it
          reports every entry as inactive and the browser then disagrees with the
          markup. <C>useIsActiveItemMenu</C> asks the router instead and answers the
          same on both sides. It returns a predicate rather than a boolean, because a
          hook cannot be called in a loop.
        </P>
      </Callout>

      <PropsTable
        rows={[
          {
            name: "name",
            type: "string",
            required: true,
            description: "The label.",
          },
          {
            name: "href",
            type: "string",
            description: "Where it goes. Built, not written.",
          },
          { name: "icon", type: "IconType", description: "Shown beside the label." },
          {
            name: "items",
            type: "MenuItemInterface[]",
            description: "Children, for a nested menu.",
          },
          {
            name: "priority",
            type: "number",
            description: "Ordering, when entries come from several places.",
          },
          {
            name: "hidden",
            type: "boolean",
            description: "Keeps the entry out without removing it.",
          },
          {
            name: "subNavigation",
            type: "boolean",
            description: "Renders a sub-navigation bar for the entry's children.",
          },
          {
            name: "locked",
            type: "() => boolean",
            description:
              "Shows a padlock and redirects — for a feature behind a plan.",
          },
          {
            name: "component",
            type: "FC<{ menuItem }>",
            description: "Renders this entry your own way.",
          },
        ]}
      />

      <H2 id="same-path">One endpoint, two scopes</H2>

      <P>
        The same API collection often needs two different treatments. Declare it
        twice, under two ids sharing one <C>alias</C>, and list each in its scope,
        with different permissions, filters and{" "}
        <Term id="view-variant">layouts</Term>:
      </P>

      <CodeBlock>{SAME_PATH}</CodeBlock>

      <P>
        Link building prefers the resource matching the current scope, so{" "}
        <C>generateLinkFromUri</C> keeps a reader inside the area they are already
        in. And <A href="/docs/resource-view/permissions">permissions</A> are per
        declaration, which is what makes the portal copy genuinely read-only in the
        interface.
      </P>
    </DocArticle>
  )
}
