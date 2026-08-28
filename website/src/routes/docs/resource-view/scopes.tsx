import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Ul } from "@/components/prose"

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

export const adminScope: ScopeInterface = {
  name: "admin",
  label: "Administration",
  resources: [articles, authors, categories],
  home: "/admin/articles/list",
  menu: [
    createItemMenuWithResource({ resource: articles }),
    createItemMenuWithResource({ resource: authors }),
    { name: "Reports", href: "/admin/reports", icon: BarChart },
  ],
  authorization: () => {
    if (!isLogged()) throw new UnauthorizedError()
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

const MENU = `import { createItemMenuWithResource, useIsActiveItemMenu } from "react-resource-view"

function Sidebar({ menu }: { menu: MenuItemInterface[] }) {
  const isActive = useIsActiveItemMenu()

  return menu.map((item) => (
    <Link key={item.name} to={item.href} aria-current={isActive(item) ? "page" : undefined}>
      {item.icon && <item.icon />}
      {item.name}
    </Link>
  ))
}`

const SAME_PATH = `// Two resources over one endpoint, one per scope.
createViewResource("articles", { scope: "admin",  path: "/api/articles", canDelete: true,  … })
createViewResource("articles", { scope: "portal", path: "/api/articles", canDelete: false, … })`

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
        An area of the application: its set of resources, its menu, its landing page,
        and whether the reader is allowed in it at all. The scope name is the first
        segment of every URL the views build, which is what makes it a genuine
        boundary rather than a folder.
      </P>

      <Ul>
        <Li>
          <strong>A namespace.</strong> Two resources may share an id if they live in
          different scopes.
        </Li>
        <Li>
          <strong>An authorisation boundary.</strong> One function decides access to
          everything inside.
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
            description: "The first URL segment, and the value resources refer to.",
          },
          {
            name: "label",
            type: "string",
            description: "Human-readable name, for a scope switcher.",
          },
          {
            name: "resources",
            type: "ViewResourceInterface[]",
            description: "Everything the scope can render.",
          },
          {
            name: "menu",
            type: "MenuItemInterface[]",
            description: "The navigation, yours to render.",
          },
          {
            name: "home",
            type: "string",
            description: "Where an entry with no context lands.",
          },
          {
            name: "authorization",
            type: "() => boolean",
            description: (
              <>
                Throws <C>UnauthorizedError</C> (401) or <C>ForbiddenError</C> (403)
                to refuse.
              </>
            ),
          },
          {
            name: "decoratorComponent",
            type: "FC<{ children }>",
            description: "Wraps every view of the scope — the shell of the area.",
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
            type: "ViewResourceInterface[]",
            description: "The flat alternative, when there are no scopes.",
          },
          {
            name: "defaultScope",
            type: "string",
            description: "Used when the URL names none.",
          },
          {
            name: "defaultResource",
            type: "Partial<ViewResourceInterface>",
            description:
              "Defaults every resource starts from — a shared row component, a shared empty state.",
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
              "Called when an authorisation throws. Where you redirect to sign-in.",
          },
          {
            name: "scopeFallback",
            type: "ReactNode",
            description: "Shown while a scope's chunk is loading.",
          },
        ]}
      />

      <Callout kind="warning" title="Lazy scopes suspend">
        <P>
          A lazily loaded scope suspends on first paint. That is the right trade-off
          in an application, and the wrong one for a documentation site or a story —
          which is why this site passes <C>resources</C> directly instead.
        </P>
      </Callout>

      <H2 id="menu">Building the menu</H2>

      <P>
        The menu is data, and rendering it is yours — the package has no sidebar
        component. <C>createItemMenuWithResource</C> builds an entry pointing at a
        resource's list, in the configured routing mode.
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
        twice, once per scope, with different permissions, filters and layouts:
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
