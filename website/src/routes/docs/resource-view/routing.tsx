import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { C, H2, H3, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/routing")({
  head: () => ({
    meta: [
      { title: "Routing — react-resource-view" },
      {
        name: "description",
        content:
          "Four router primitives, a TanStack adapter, and two ways to carry a view context: in the path, or entirely in the query string.",
      },
    ],
  }),
  component: Routing,
})

const TANSTACK = `import { configurePorts } from "react-resource-view"
import { tanstackAdapter } from "react-resource-view/tanstack"

configurePorts({ navigation: tanstackAdapter })`

const CUSTOM = `configurePorts({
  navigation: {
    // Imperative navigation. Called as a hook.
    useNavigate: () => {
      const navigate = useRouterNavigate()
      return ({ to, replace, resetScroll }) =>
        navigate(to, { replace, preventScrollReset: !resetScroll })
    },

    // The current location, read reactively.
    useLocation: () => {
      const location = useRouterLocation()
      return { pathname: location.pathname, searchStr: location.search }
    },

    Link: ({ to, children, ...rest }) => (
      <RouterLink to={to} {...rest}>{children}</RouterLink>
    ),

    Navigate: ({ to, replace }) => <RouterRedirect to={to} replace={replace} />,
  },
})`

const SEGMENTS = `/{scope}/{resourceId}/{action}/{id}/{subResource}?filter=…

/admin/articles/list                    → the list
/admin/articles/list?filter=…           → filtered
/admin/articles/read/42                 → one article
/admin/articles/update/42               → editing it
/admin/articles/create?defaultData=…    → a new one, pre-filled`

const QUERY = `configurePorts({
  routing: {
    mode: "query",
    param: "view",
    basePath: "/admin",
  },
})

// → /admin?view=admin/articles/update/42&filter=…`

const CATCH_ALL = `// TanStack Router — one catch-all under /admin
export const Route = createFileRoute("/admin/$")({
  component: () => (
    <ResourceViewProvider
      viewResourceContextParams={parseLink(location.pathname + location.search)}
      configuration={{ resources }}
    />
  ),
})`

const LINKS = `import { generateLink, generateLinkFromIri, generateLinkFromUri } from "react-resource-view"

// From a context
generateLink({ resourceId: "articles", resourceAction: ActionList.read, id: "42" })

// From an IRI you already hold
generateLinkFromIri({ iri: "/api/articles/42", resourceAction: ActionList.update })

// From an API URI, resolving which resource serves that path
generateLinkFromUri(notification.uri)`

function Routing() {
  return (
    <DocArticle
      toc={[
        { id: "why", title: "Why a port at all" },
        { id: "tanstack", title: "The TanStack adapter" },
        { id: "custom", title: "Any other router" },
        { id: "modes", title: "Two ways to carry a context" },
        { id: "mounting", title: "Mounting the views" },
        { id: "links", title: "Building links" },
      ]}
    >
      <H2 id="why">Why a port at all</H2>

      <P>
        The views navigate constantly — opening a record, switching layout, applying
        a filter — and every one of those is a URL change. Depending on a router
        would mean picking yours for you; instead the package asks for four
        primitives and stays out of it.
      </P>

      <Callout kind="warning" title="Unconfigured means full page loads">
        <P>
          Left without a navigation port, the views fall back to the History API and
          full reloads. That is enough for a test or a story, and wrong for
          production.
        </P>
      </Callout>

      <H2 id="tanstack">The TanStack adapter</H2>

      <CodeBlock>{TANSTACK}</CodeBlock>

      <P>
        Importing that entry point is what pulls TanStack Router in — the core never
        references it, so an application on another router installs nothing extra.
      </P>

      <Callout kind="tip" title="This site runs on it">
        <P>
          Every demo you have clicked navigates through this adapter, on the same
          router that served the page you are reading.
        </P>
      </Callout>

      <H2 id="custom">Any other router</H2>

      <CodeBlock filename="setup.tsx">{CUSTOM}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "useNavigate",
            type: "() => (options: NavigateOptions) => void | Promise<void>",
            required: true,
            description: (
              <>
                Called as a hook. <C>resetScroll</C> is false when switching tabs, so
                the reading position is kept — honour it if your router can.
              </>
            ),
          },
          {
            name: "useLocation",
            type: "() => { pathname, searchStr, search? }",
            required: true,
            description: (
              <>
                Read reactively, so a client-side navigation re-renders the views.{" "}
                <C>searchStr</C> is the raw query string.
              </>
            ),
          },
          {
            name: "Link",
            type: "ComponentType<LinkPropsInterface>",
            required: true,
            description: "An anchor handled by the router.",
          },
          {
            name: "Navigate",
            type: "ComponentType<{ to, replace? }>",
            required: true,
            description: "Redirects on render.",
          },
        ]}
      />

      <H2 id="modes">Two ways to carry a context</H2>

      <H3>Path mode — the default</H3>

      <P>
        The context lives in the path, in a fixed order. It reads well, and it is
        what you want when the path is yours.
      </P>

      <CodeBlock lang="bash">{SEGMENTS}</CodeBlock>

      <H3>Query mode</H3>

      <P>
        The whole context moves into a single query parameter. Two situations call
        for it:
      </P>

      <Ul>
        <Li>
          <strong>Static hosting.</strong> There is no server to answer{" "}
          <C>/admin/articles/read/42</C>, so a deep link 404s. A query parameter
          hangs off a path that does exist.
        </Li>
        <Li>
          <strong>Embedded views.</strong> The path belongs to the host page, not to
          the views.
        </Li>
      </Ul>

      <CodeBlock>{QUERY}</CodeBlock>

      <Callout kind="note" title="Reading is mode-agnostic">
        <P>
          <C>parseLink</C> reads a URL carrying the routing parameter as query mode
          whatever the configuration says — so a link shared from a statically hosted
          page keeps working after you move to path mode.
        </P>
      </Callout>

      <P>
        This site uses query mode aimed at <C>/playground</C>: an action link inside
        a documentation demo has to leave the page it sits on, and it lands on the
        playground already on that record.
      </P>

      <H2 id="mounting">Mounting the views</H2>

      <P>
        In path mode the views own a whole subtree, so one catch-all route is enough
        — the segments are parsed by the package, not by the router.
      </P>

      <CodeBlock>{CATCH_ALL}</CodeBlock>

      <P>
        <C>ResourceViewProvider</C> is the entry point when the views own the page:
        it resolves the scope, applies the configuration and renders the right view.{" "}
        <C>ViewResourceContextProvider</C> is the one to reach for when embedding a
        single view inside a page you control — that is what every demo on this site
        uses.
      </P>

      <H2 id="links">Building links</H2>

      <P>
        Links elsewhere in the application — a menu, a notification, a dashboard card
        — should be built rather than written, so they follow the configured mode.
      </P>

      <CodeBlock>{LINKS}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "generateLink",
            type: "(params: ViewResourceContextParams) => string",
            description: "The general form, in whichever mode is configured.",
          },
          {
            name: "generateLinkByResource",
            type: "({ resource, resourceAction, filter?, id? }) => string",
            description: "The same, when you hold the resource object.",
          },
          {
            name: "generateLinkFromIri",
            type: "({ iri, resourceAction?, scope? }) => string | undefined",
            description: "From an item IRI.",
          },
          {
            name: "generateLinkFromUri",
            type: "(uri: string, scope?) => string | undefined",
            description:
              "From an API URI, finding the resource whose path serves it — for turning a notification into a link.",
          },
          {
            name: "parseLink",
            type: "(url: string) => ViewResourceContextParams",
            description: "The inverse, in either mode.",
          },
        ]}
      />
    </DocArticle>
  )
}
