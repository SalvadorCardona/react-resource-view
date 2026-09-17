import { createViewResource } from "react-resource-view"
import { LayoutPanelLeft } from "lucide-react"
import { CodeBlock, PageHeader, Section } from "../DocLayout"

const blocks: [string, string][] = [
  ["AdminSidebarNav", "The desktop sidebar, built from the scope's menu"],
  ["AdminTopBar", "Sticky top bar: the sidebar toggle, and a slot for the rest"],
  ["AdminHeader", "Page title, and the sub-navigation tabs a menu group opts into"],
  [
    "AdminMobileNav",
    "Bottom navigation bar, in place of the sidebar on narrow screens",
  ],
]

const adminLayoutResource = createViewResource("admin-layout", {
  name: "Admin layout",
  scope: "docs",
  icon: LayoutPanelLeft,
  view: {
    name: "Admin layout",
    viewComponent: () => (
      <>
        <PageHeader
          title="Admin layout"
          intro="A scope's decoratorComponent wraps every view of that scope — the navigation and the page heading around them. AdminLayout is a ready-made one, so a project reaches for it instead of writing the same sidebar and top bar again."
        />

        <Section
          title="Point it at a scope"
          intro="Nothing beyond a menu is required — the sidebar, the top bar and the mobile navigation all read it."
        >
          <CodeBlock>{usage}</CodeBlock>
          <p>
            The menu drives everything: an entry with <code>items</code> becomes a
            collapsible group, and one with <code>subNavigation: true</code> opens on
            its first page while the header shows the sibling pages as tabs instead
            of nesting them in the sidebar.
          </p>
        </Section>

        <Section
          title="A logo, or something at the end of the top bar"
          intro="decoratorComponent only ever receives children, so AdminLayout itself takes no props there — createAdminLayout bakes them in instead."
        >
          <CodeBlock>{withOptions}</CodeBlock>
        </Section>

        <Section
          title="Responsive by default"
          intro="Below the md breakpoint the sidebar is replaced with a bottom navigation bar; a menu entry with children opens a drawer instead of a nested menu."
        >
          <p>
            Nothing to configure: <code>AdminLayout</code> switches on the viewport
            width itself.
          </p>
        </Section>

        <Section
          title="Composing it differently"
          intro="Each piece is exported on its own, for a project whose shell doesn't match AdminLayout's shape."
        >
          <div className="not-prose overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Component</th>
                  <th className="py-2 font-medium">Renders</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(([name, description]) => (
                  <tr key={name} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-mono text-xs">{name}</td>
                    <td className="py-2 text-muted-foreground">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            A <code>decoratorComponent</code> can also be written from scratch, the
            way{" "}
            <a href="https://github.com/SalvadorCardona/react-resource-view/blob/main/docs/src/DocLayout.tsx">
              this site's own shell
            </a>{" "}
            is — <code>AdminLayout</code> is one reasonable default, not the only
            one.
          </p>
        </Section>
      </>
    ),
  },
})

const usage = `const adminScope: ScopeInterface = {
  name: "admin",
  decoratorComponent: AdminLayout,
  menu: [
    createItemMenuWithResource({ resource: articlesResource }),
    createItemMenuWithResource({ resource: usersResource }),
  ],
  defaultViewResourceContextParams: { resourceId: articlesResource["@id"] },
}`

const withOptions = `import { createAdminLayout } from "react-resource-view"

const adminScope: ScopeInterface = {
  name: "admin",
  decoratorComponent: createAdminLayout({
    logo: <MyLogo />,
    topBarEnd: <UserMenu />,
  }),
  menu: [/* … */],
}`

export default adminLayoutResource
