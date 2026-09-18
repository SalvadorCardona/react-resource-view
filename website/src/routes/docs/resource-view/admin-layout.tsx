import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, P, Ul, Li } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/admin-layout")({
  head: () => ({
    meta: [
      { title: "Admin layout — react-resource-view" },
      {
        name: "description",
        content:
          "AdminLayout: a ready-made decoratorComponent — a collapsible sidebar built from the scope's menu, a top bar, a page header with sub-navigation tabs, and a bottom bar on narrow screens.",
      },
    ],
  }),
  component: AdminLayoutPage,
})

const USAGE = `import { AdminLayout } from "react-resource-view"

export const adminScope: ScopeInterface = {
  name: "admin",
  decoratorComponent: AdminLayout,
  menu: [
    createItemMenuWithResource({ resource: articles }),
    createItemMenuWithResource({ resource: authors }),
  ],
  defaultViewResourceContextParams: { resourceId: articles["@id"] },
}`

const CONFIGURED = `import { createAdminLayout } from "react-resource-view"

export const adminScope: ScopeInterface = {
  name: "admin",
  decoratorComponent: createAdminLayout({
    logo: <MyLogo />,
    topBarEnd: <UserMenu />,
  }),
  menu: [/* … */],
}`

function AdminLayoutPage() {
  return (
    <DocArticle
      toc={[
        { id: "what", title: "What it is" },
        { id: "usage", title: "Using it" },
        { id: "options", title: "A logo, or a user menu" },
        { id: "responsive", title: "Responsive by default" },
        { id: "pieces", title: "The building blocks" },
      ]}
    >
      <H2 id="what">What it is</H2>

      <P>
        A scope&apos;s <C>decoratorComponent</C> wraps every view of that scope — the
        navigation and the page heading around them. Writing one from scratch is a
        sidebar, a top bar and a mobile navigation that every project ends up
        rewriting; <C>AdminLayout</C> is that shell, ready to point a scope at.
      </P>

      <Callout kind="tip" title="One reasonable default, not the only one">
        <P>
          <C>decoratorComponent</C> is a plain <C>FC&lt;{"{ children }"}&gt;</C> — the{" "}
          <A href="/playground">playground</A>&apos;s own back office is written by
          hand instead, for the &quot;Declaration&quot; panel and the reset button it
          needs beyond what a generic shell offers. Reach for <C>AdminLayout</C> to
          skip that work when a project doesn&apos;t need anything past a menu.
        </P>
      </Callout>

      <H2 id="usage">Using it</H2>

      <P>
        Nothing beyond a menu is required — the sidebar, the top bar and the mobile
        navigation all read it.
      </P>

      <CodeBlock filename="scopes/admin.ts">{USAGE}</CodeBlock>

      <P>
        The menu drives everything: an entry with <C>items</C> becomes a collapsible
        group, and one with <C>subNavigation: true</C> opens on its first page while
        the header shows the sibling pages as tabs instead of nesting them in the
        sidebar — see <A href="/docs/resource-view/scopes">scopes &amp; menu</A>.
      </P>

      <H2 id="options">A logo, or a user menu</H2>

      <P>
        <C>decoratorComponent</C> only ever receives <C>children</C>, so{" "}
        <C>AdminLayout</C> itself takes no props there. <C>createAdminLayout</C>{" "}
        builds a configured variant instead, with a logo and top bar content baked
        in:
      </P>

      <CodeBlock filename="scopes/admin.ts">{CONFIGURED}</CodeBlock>

      <H2 id="responsive">Responsive by default</H2>

      <P>
        Below the <C>md</C> breakpoint the sidebar is replaced with a bottom
        navigation bar; a menu entry with children opens a drawer instead of a
        nested menu. Nothing to configure — <C>AdminLayout</C> switches on the
        viewport width itself.
      </P>

      <H2 id="pieces">The building blocks</H2>

      <P>Each piece is exported on its own, for a shell that doesn&apos;t match this shape:</P>

      <Ul>
        <Li>
          <C>AdminSidebarNav</C> — the desktop sidebar, built from the scope&apos;s
          menu.
        </Li>
        <Li>
          <C>AdminTopBar</C> — sticky top bar: the sidebar toggle, and a slot for the
          rest.
        </Li>
        <Li>
          <C>AdminHeader</C> — page title, and the sub-navigation tabs a menu group
          opts into.
        </Li>
        <Li>
          <C>AdminMobileNav</C> — bottom navigation bar, in place of the sidebar on
          narrow screens.
        </Li>
      </Ul>

      <PropsTable
        rows={[
          {
            name: "logo",
            type: "ReactNode",
            description:
              "Rendered in the sidebar header on desktop, and in the top bar on mobile.",
          },
          {
            name: "topBarEnd",
            type: "ReactNode",
            description:
              "Rendered at the end of the top bar — a search field, a user menu…",
          },
        ]}
      />
    </DocArticle>
  )
}
