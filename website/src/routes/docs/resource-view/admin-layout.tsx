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
          "AdminLayout: a ready-made decoratorComponent — a collapsible sidebar built from the scope's menu, a top bar with a breadcrumb, a page header naming the record, a block pinned at the bottom of the sidebar, a bottom bar on narrow screens, and full-width views for boards and calendars.",
      },
    ],
  }),
  component: AdminLayoutPage,
})

/** The playground's back office runs on this template; its task board is the full-width example. */
const PLAYGROUND = "/playground?view=admin/admin_tasks/list"

const IMPORT = `import { AdminLayout, createAdminLayout } from "react-resource-view"`

const USAGE = `import { AdminLayout } from "react-resource-view"

export const adminScope: ScopeInterface = {
  name: "admin",
  // The first link of the breadcrumb, in the top bar.
  label: "Back office",
  decoratorComponent: AdminLayout,
  resources: [articles, authors],
  menu: [
    createItemMenuWithResource({ resource: articles }),
    createItemMenuWithResource({ resource: authors }),
  ],
  defaultViewResourceContextParams: { resourceId: articles["@id"] },
}`

const MENU = `menu: [
  // An entry built from a resource: its name, its icon and its link.
  createItemMenuWithResource({ resource: overview }),
  createItemMenuWithResource({ resource: tasks }),

  // A section: a collapsible group in the sidebar, a drawer on a phone.
  {
    name: "Catalogue",
    icon: ShoppingBag,
    items: [
      createItemMenuWithResource({ resource: products }),
      createItemMenuWithResource({ resource: orders }),
    ],
  },

  // A group whose pages are tabs under the page header rather than
  // entries of the sidebar.
  {
    name: "Settings",
    icon: Settings,
    subNavigation: true,
    items: [
      createItemMenuWithResource({ resource: profile }),
      createItemMenuWithResource({ resource: billing }),
    ],
  },
]`

const CONFIGURED = `import { createAdminLayout } from "react-resource-view"

export const adminScope: ScopeInterface = {
  name: "admin",
  decoratorComponent: createAdminLayout({
    logo: <MyLogo />,
    // A search field, a ⌘K palette, a user menu — anything.
    topBarEnd: <UserMenu />,
  }),
  menu: [/* … */],
}`

const FOOTER = `import { BookOpen, Github, Mail } from "lucide-react"
import { createAdminLayout } from "react-resource-view"

decoratorComponent: createAdminLayout({
  footerMenuTitle: "Need help?",
  footerMenu: [
    // An absolute URL opens in a new tab…
    { name: "Documentation", icon: BookOpen, href: "https://example.com/docs" },
    { name: "GitHub", icon: Github, href: "https://github.com/acme/app" },
    // …a mailto: hands over to the mail client…
    { name: "Contact", icon: Mail, href: "mailto:support@example.com" },
    // …and a page of the application stays in it.
    createItemMenuWithResource({ resource: faq }),
  ],
})`

const FOOTER_NODE = `decoratorComponent: createAdminLayout({
  // Anything at all, under the footerMenu when there is one.
  sidebarFooter: <PlanBadge />,
})`

const HEADER = `views: {
  [ActionList.update]: {
    // The field that names an account, instead of \`title\` or \`name\`.
    titleKey: "email",
    components: {
      // Either of them, or both — the rest of the header stays.
      title: () => <h2>…</h2>,
      actions: () => <PublishButton />,
      // Or the whole header, tabs included.
      // navigation: () => <MyHeader />,
    },
  },
}`

const FULL_WIDTH = `createViewResource("tasks", {
  view: {
    // Every action of the resource, across the whole page…
    fullWidth: true,
    viewVariants: [
      columnViewOptionFactory({ name: "Board", identifierKey: "status" }),
      calendarViewOptionFactory({ name: "Calendar", dateKey: "dueDate" }),
    ],
  },
  views: {
    // …but its forms, which keep the column.
    [ActionList.create]: { fullWidth: false },
    [ActionList.update]: { fullWidth: false },
  },
})`

const VARIANT = `viewVariants: [
  // Only the board is wide; the table stays in the column.
  columnViewOptionFactory({ name: "Board", fullWidth: true }),
  tableViewOptionFactory({ name: "Table" }),
]`

const OWN_DECORATOR = `import { isFullWidthView, useCurrentViewResourceContext } from "react-resource-view"

function MyLayout({ children }: { children: ReactNode }) {
  const wide = isFullWidthView(useCurrentViewResourceContext())

  return <main className={wide ? "px-6" : "mx-auto max-w-5xl px-6"}>{children}</main>
}`

function AdminLayoutPage() {
  return (
    <DocArticle
      toc={[
        { id: "what", title: "What it is" },
        { id: "import", title: "Installing it" },
        { id: "usage", title: "Pointing a scope at it" },
        { id: "menu", title: "The navigation" },
        { id: "options", title: "A logo, a search, a user menu" },
        { id: "footer", title: "The bottom of the sidebar" },
        { id: "header", title: "The page header" },
        { id: "full-width", title: "Full width" },
        { id: "theme", title: "Theme and dark mode" },
        { id: "responsive", title: "Responsive by default" },
        { id: "pieces", title: "The building blocks" },
        { id: "reference", title: "Reference" },
      ]}
    >
      <H2 id="what">What it is</H2>

      <P>
        A scope&apos;s <C>decoratorComponent</C> wraps every view of that scope — the
        navigation and the page heading around them. Writing one from scratch is a
        sidebar, a top bar and a mobile navigation that every project ends up
        rewriting; <C>AdminLayout</C> is that shell, ready to point a scope at.
      </P>

      <Callout kind="tip" title="See it running">
        <P>
          The <A href={PLAYGROUND}>playground</A>&apos;s whole back office is this
          template, configured in a line: users, companies, a blog, a catalogue and a
          task board, every screen a URL. The link opens the tasks — the resource
          drawn full width, next to screens that keep the column.
        </P>
      </Callout>

      <H2 id="import">Installing it</H2>

      <P>
        It ships with the package — nothing more to install than the{" "}
        <A href="/docs/resource-view/installation">installation</A> already did,
        styles included:
      </P>

      <CodeBlock>{IMPORT}</CodeBlock>

      <H2 id="usage">Pointing a scope at it</H2>

      <P>
        Nothing beyond a menu is required — the sidebar, the top bar and the mobile
        navigation all read it. The scope&apos;s <C>label</C>, when it has one, opens
        the breadcrumb in the top bar: it is the name of the application.
      </P>

      <CodeBlock filename="scopes/admin.ts">{USAGE}</CodeBlock>

      <H2 id="menu">The navigation</H2>

      <P>
        The menu is data, and the template draws it three ways: the sidebar on a
        desktop, the bottom bar on a phone, and the tabs under the page header. A
        resource is put in it with <C>createItemMenuWithResource</C>, which reads the
        name, the icon and the link off the resource — declared once, on the
        resource.
      </P>

      <CodeBlock filename="scopes/admin.ts">{MENU}</CodeBlock>

      <Ul>
        <Li>
          An entry with <C>items</C> is a section: a collapsible group in the
          sidebar, a drawer from the bottom bar.
        </Li>
        <Li>
          With <C>subNavigation: true</C>, the group opens on its first page and the
          header shows the sibling pages as tabs instead of nesting them in the
          sidebar.
        </Li>
        <Li>
          <C>hidden: true</C> keeps an entry out of all three — see{" "}
          <A href="/docs/resource-view/scopes">scopes &amp; menu</A>.
        </Li>
      </Ul>

      <P>
        An entry stays lit on everything inside what it points at: the list of a
        resource, one of its records, the form editing it.
      </P>

      <H2 id="options">A logo, a search, a user menu</H2>

      <P>
        <C>decoratorComponent</C> only ever receives <C>children</C>, so{" "}
        <C>AdminLayout</C> itself takes no props there. <C>createAdminLayout</C>{" "}
        builds a configured variant instead, with a logo and top bar content baked
        in:
      </P>

      <CodeBlock filename="scopes/admin.ts">{CONFIGURED}</CodeBlock>

      <P>
        The template has no search of its own: <C>topBarEnd</C> is the slot for one,
        a ⌘K palette included, and it stays on every screen of the scope. The
        playground puts its link to the builder there.
      </P>

      <H2 id="footer">The bottom of the sidebar</H2>

      <P>
        Help, support, documentation — the links an application keeps out of the way
        of its pages go in a block pinned at the bottom of the sidebar.{" "}
        <C>footerMenu</C> takes menu entries, drawn like the scope&apos;s menu, under
        an optional <C>footerMenuTitle</C>:
      </P>

      <CodeBlock filename="scopes/admin.ts">{FOOTER}</CodeBlock>

      <P>
        For something else than links — a plan badge, a card, a button —{" "}
        <C>sidebarFooter</C> takes any node:
      </P>

      <CodeBlock>{FOOTER_NODE}</CodeBlock>

      <P>
        Without either, the sidebar has no footer at all. On a phone, both go behind
        a last entry of the bottom bar, named after <C>footerMenuTitle</C> —
        &laquo;&nbsp;More&nbsp;&raquo; without one — which opens them in a drawer.
        The playground&apos;s back office has a &laquo;&nbsp;Need help?&nbsp;&raquo;
        block of this kind.
      </P>

      <Callout kind="note" title="Since 0.12">
        <P>
          <C>sidebarFooter</C>, <C>footerMenu</C> and <C>footerMenuTitle</C> arrived
          in react-resource-view 0.12.
        </P>
      </Callout>

      <H2 id="header">The page header</H2>

      <P>
        On a record, the header says which one is on screen and how to get back: a
        link to the list, the record&apos;s name as the title, the action and its id
        underneath, and the actions still worth offering — edit from the read page,
        delete from either. The same name ends the breadcrumb in the top bar.
      </P>

      <P>
        The name is read from <C>title</C>, <C>name</C> or <C>label</C>; a view names
        another field with <C>titleKey</C>. Each part of the header is a slot a view
        can fill:
      </P>

      <CodeBlock>{HEADER}</CodeBlock>

      <H2 id="full-width">Full width</H2>

      <P>
        Views are drawn in a column of constrained width — the right measure for a
        form or a record, too narrow for a board, a calendar, a timeline or a table
        with a dozen columns. A view declaring <C>fullWidth</C> takes the whole page
        instead; the side margins stay, and a phone is laid out as before.
      </P>

      <CodeBlock>{FULL_WIDTH}</CodeBlock>

      <P>
        The option is read at three levels, and the most specific one wins: the list
        variant on screen, then the action&apos;s entry in <C>views</C>, then the
        resource&apos;s <C>view</C>. Nothing declared means the column, so a
        resource that never mentions it is drawn exactly as before. For a single
        layout of a list:
      </P>

      <CodeBlock>{VARIANT}</CodeBlock>

      <P>
        A <C>decoratorComponent</C> of your own honours the same option through{" "}
        <C>isFullWidthView</C>, which resolves it for the view on screen:
      </P>

      <CodeBlock>{OWN_DECORATOR}</CodeBlock>

      <Callout kind="note" title="Since 0.11">
        <P>
          <C>fullWidth</C> and <C>isFullWidthView</C> arrived in react-resource-view
          0.11. The option is also listed with the rest of a resource&apos;s
          declaration, under{" "}
          <A href="/docs/resource-view/resources#full-width">declaring a resource</A>.
        </P>
      </Callout>

      <H2 id="theme">Theme and dark mode</H2>

      <P>
        Every surface of the template is drawn with the shadcn tokens —{" "}
        <C>background</C>, <C>muted</C>, <C>border</C>, <C>primary</C>… — so it takes
        the palette of an application that has a shadcn theme, and follows its{" "}
        <C>.dark</C> class. Without one, the stylesheet imported at installation
        supplies a light and a dark palette of its own.
      </P>

      <H2 id="responsive">Responsive by default</H2>

      <P>
        Below the <C>md</C> breakpoint the sidebar is replaced with a bottom
        navigation bar; a menu entry with children opens a drawer instead of a
        nested menu, and the bottom of the sidebar goes behind a last
        &laquo;&nbsp;more&nbsp;&raquo; entry. Nothing to configure — <C>AdminLayout</C> switches on the
        viewport width itself.
      </P>

      <H2 id="pieces">The building blocks</H2>

      <P>Each piece is exported on its own, for a shell that doesn&apos;t match this shape:</P>

      <Ul>
        <Li>
          <C>AdminSidebarNav</C> — the desktop sidebar, built from the scope&apos;s
          menu, with its footer.
        </Li>
        <Li>
          <C>AdminTopBar</C> — sticky top bar: the sidebar toggle, the breadcrumb,
          and a slot for the rest.
        </Li>
        <Li>
          <C>AdminHeader</C> — page title, the record&apos;s actions, and the
          sub-navigation tabs a menu group opts into.
        </Li>
        <Li>
          <C>AdminMobileNav</C> — bottom navigation bar, in place of the sidebar on
          narrow screens.
        </Li>
      </Ul>

      <H2 id="reference">Reference</H2>

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
          {
            name: "footerMenu",
            type: "MenuItemInterface[]",
            description: (
              <>
                Links pinned at the bottom of the sidebar, drawn like the menu. An
                absolute <C>href</C> opens in a new tab. On mobile, in the drawer of
                the bottom bar&apos;s last entry.
              </>
            ),
          },
          {
            name: "footerMenuTitle",
            type: "string",
            description:
              "Heading above footerMenu — “Need help?”; names the last entry of the bottom bar on mobile.",
          },
          {
            name: "sidebarFooter",
            type: "ReactNode",
            description:
              "Pinned at the bottom of the sidebar, under footerMenu. On mobile, in the same drawer.",
          },
        ]}
      />

      <P>And, read off the scope and its resources rather than passed as props:</P>

      <PropsTable
        rows={[
          {
            name: "scope.menu",
            type: "MenuItemInterface[]",
            description: "The sidebar, the bottom bar and the header's tabs.",
          },
          {
            name: "scope.label",
            type: "string",
            description: "The first link of the breadcrumb: the application's name.",
          },
          {
            name: "view.titleKey",
            type: "string",
            description: "The field naming a record in the header and the breadcrumb.",
          },
          {
            name: "view.components",
            type: "{ title?, actions?, navigation? }",
            description: "Replace a part of the page header, or all of it.",
          },
          {
            name: "view.fullWidth",
            type: "boolean",
            default: "false",
            description: (
              <>
                The whole width of the page for this view — on <C>view</C>, on{" "}
                <C>views.&lt;action&gt;</C> or on a list variant.
              </>
            ),
          },
        ]}
      />
    </DocArticle>
  )
}
