import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, Ol, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/resource-view/authentication")({
  head: () => ({
    meta: [
      { title: "Authentication — react-resource-view" },
      {
        name: "description",
        content:
          "Protecting a scope with a real session: Better Auth end to end — async authorization, sign-in redirect, roles, sign-out — and the same pattern with a JWT.",
      },
    ],
  }),
  component: Authentication,
})

const INSTALL = `pnpm add better-auth`

const CLIENT = `import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  // Where your Better Auth server is mounted. Omit it when it is the same origin.
  baseURL: import.meta.env.VITE_AUTH_URL,
  // Types \`user.role\` and adds the admin endpoints.
  plugins: [adminClient()],
})`

const SCOPE = `import type { ScopeInterface } from "react-resource-view"
import {
  AdminLayout,
  ForbiddenError,
  UnauthorizedError,
} from "react-resource-view"
import { authClient } from "../auth-client"

export const adminScope: ScopeInterface = {
  name: "admin",
  label: "Administration",
  resources: [articles, users],
  decoratorComponent: AdminLayout,

  // Awaited before anything of the scope renders.
  authorization: async () => {
    const { data } = await authClient.getSession()
    if (!data) throw new UnauthorizedError()                 // 401 → onUnauthorized
    if (data.user.role !== "admin") throw new ForbiddenError() // 403 → access denied
    return true
  },
}`

const PROVIDER = `import { ResourceViewProvider } from "react-resource-view"
import { useRouter } from "@tanstack/react-router"

function Admin({ url }: { url: string }) {
  const router = useRouter()

  return (
    <ResourceViewProvider
      viewResourceContextParams={parseLink(url)}
      configuration={{
        scopes: {
          admin: () => import("./scopes/admin").then((m) => m.adminScope),
        },
        defaultScope: "admin",
        // A 401, thrown or rejected: send the reader to sign in, and back here after.
        onUnauthorized: () =>
          router.navigate({
            to: "/login",
            search: { redirect: window.location.pathname },
          }),
        // While the session is being fetched — instead of the default page loader.
        authorizationFallback: <Spinner />,
        // A 403, or an authorization returning false.
        forbiddenFallback: <p>This area is for administrators.</p>,
      }}
    />
  )
}`

const LOGIN = `// /login — a plain Better Auth form, nothing specific to react-resource-view.
function LoginPage() {
  const { redirect } = Route.useSearch()
  const router = useRouter()
  const [error, setError] = useState<string>()

  async function onSubmit(email: string, password: string) {
    const { error } = await authClient.signIn.email({ email, password })
    if (error) return setError(error.message)

    router.navigate({ to: redirect ?? "/admin" })
  }

  // …the form itself
}`

const SESSION = `import { authClient } from "./auth-client"

type Session = typeof authClient.$Infer.Session

let pending: Promise<Session | null> | undefined
let current: Session | null = null

/** Fetches the session once; later calls share the same request. */
export function loadSession(): Promise<Session | null> {
  pending ??= authClient.getSession().then(({ data }) => (current = data))
  return pending
}

/** Forgets it — after a sign-out, or to pick up a role that changed. */
export function forgetSession() {
  pending = undefined
  current = null
}

/**
 * Synchronous, for the flags evaluated on render. The scope's authorization
 * has awaited loadSession() before any view of the scope renders, so the
 * session is already there when this is read.
 */
export function hasRole(role: string): boolean {
  // The admin plugin stores several roles comma-separated: "admin,editor".
  return current?.user.role?.split(",").includes(role) ?? false
}`

const SCOPE_WITH_SESSION = `import { hasRole, loadSession } from "../session"

export const adminScope: ScopeInterface = {
  name: "admin",
  // …
  authorization: async () => {
    const session = await loadSession()
    if (!session) throw new UnauthorizedError()
    if (!hasRole("admin") && !hasRole("editor")) throw new ForbiddenError()
    return true
  },
}`

const FLAGS = `import { hasRole } from "../session"

export const articles = createViewResource("articles", {
  path: "/api/articles",
  canRead: true,
  canCreate: () => hasRole("editor") || hasRole("admin"),
  canUpdate: () => hasRole("editor") || hasRole("admin"),
  canDelete: () => hasRole("admin"),
})`

const MENU = `menu: [
  createItemMenuWithResource({ resource: articles }),
  {
    ...createItemMenuWithResource({ resource: users }),
    // \`hidden\` is read each time the menu renders: a getter follows the session.
    get hidden() {
      return !hasRole("admin")
    },
  },
],`

const SIGN_OUT = `import { useScopeContext } from "react-resource-view"
import { authClient } from "./auth-client"
import { forgetSession } from "./session"

export function SignOutButton() {
  const scopeContext = useScopeContext()

  return (
    <button
      onClick={async () => {
        await authClient.signOut()
        forgetSession()
        // Runs the scope's authorization again: no session → 401 → /login.
        scopeContext?.recheckAuthorization()
      }}
    >
      Sign out
    </button>
  )
}`

const JWT = `import { ForbiddenError, UnauthorizedError } from "react-resource-view"

// LexikJWTAuthenticationBundle: POST /api/login_check { username, password }
// answers { token }, kept here by the login form.
authorization: async () => {
  const token = localStorage.getItem("token")
  if (!token) throw new UnauthorizedError()

  // A /me operation of your API Platform app, returning the signed-in user.
  const response = await fetch("/api/me", {
    headers: { Authorization: \`Bearer \${token}\` },
  })
  if (response.status === 401) throw new UnauthorizedError() // expired or revoked
  if (!response.ok) throw new Error(\`/api/me answered \${response.status}\`)

  const me = await response.json()
  if (!me.roles.includes("ROLE_ADMIN")) throw new ForbiddenError()
  return true
}`

function Authentication() {
  return (
    <DocArticle
      toc={[
        { id: "how", title: "How a scope is protected" },
        { id: "client", title: "Better Auth: the client" },
        { id: "scope", title: "Protecting a scope" },
        { id: "redirect", title: "Redirecting to sign in" },
        { id: "roles", title: "Roles, flags and menu" },
        { id: "sign-out", title: "Signing out" },
        { id: "server", title: "The API decides" },
        { id: "other", title: "Other providers" },
      ]}
    >
      <H2 id="how">How a scope is protected</H2>

      <P>
        A <A href="/docs/resource-view/scopes">scope</A> carries an{" "}
        <C>authorization</C> function. It may be synchronous or return a promise —
        a real session is almost always fetched — and nothing of the scope renders
        until it has answered: no flash of the protected page before the verdict.
      </P>

      <Ul>
        <Li>
          <strong>
            <C>true</C>
          </strong>{" "}
          — the scope renders.
        </Li>
        <Li>
          <strong>
            <C>false</C>
          </strong>{" "}
          — treated as a 403.
        </Li>
        <Li>
          <strong>
            <C>UnauthorizedError</C>
          </strong>
          , thrown or rejected — a 401: <C>onUnauthorized</C> is called, where you
          redirect to sign in. Without it the page goes to <C>/</C>.
        </Li>
        <Li>
          <strong>
            <C>ForbiddenError</C>
          </strong>
          , thrown or rejected — a 403: <C>forbiddenFallback</C> renders instead of
          the scope, an “Access denied” message by default.
        </Li>
        <Li>
          <strong>Anything else</strong> goes up to your error boundary, like any
          render error.
        </Li>
      </Ul>

      <P>
        The check runs again whenever the scope changes, and whenever you ask for it
        with <C>recheckAuthorization</C>. A promise that settles after the reader has
        moved on is ignored, so a slow answer about one scope never decides for the
        next.
      </P>

      <P>
        The rest of this page wires it to{" "}
        <A href="https://www.better-auth.com">Better Auth</A>, from the client to
        signing out. Each block is meant to be copied as it is.
      </P>

      <H2 id="client">Better Auth: the client</H2>

      <P>
        The server side — the database, the <C>betterAuth()</C> instance, the route
        handler of your framework — is Better Auth's own business, and{" "}
        <A href="https://www.better-auth.com/docs/installation">its installation guide</A>{" "}
        covers it. Add its{" "}
        <A href="https://www.better-auth.com/docs/plugins/admin">admin plugin</A>{" "}
        there too: it gives every user a <C>role</C>. On the front end, all you need
        is the client.
      </P>

      <CodeBlock lang="bash">{INSTALL}</CodeBlock>

      <CodeBlock filename="auth-client.ts" lang="ts">
        {CLIENT}
      </CodeBlock>

      <Callout kind="note" title="No admin plugin?">
        <P>
          A <C>role</C> declared as an additional field on the user works the same
          way — Better Auth returns it on <C>session.user</C> all the same.
        </P>
      </Callout>

      <H2 id="scope">Protecting a scope</H2>

      <CodeBlock filename="scopes/admin.ts" lang="ts">
        {SCOPE}
      </CodeBlock>

      <P>
        No session is a 401: the reader is not signed in. A session without the
        role is a 403: signed in, but not allowed here — signing in again would not
        help, so they are shown a refusal rather than a login form.
      </P>

      <H2 id="redirect">Redirecting to sign in</H2>

      <P>
        <C>onUnauthorized</C> on the configuration receives every 401 of every
        scope. Pass the page the reader was on, so the login form can bring them
        back to it.
      </P>

      <CodeBlock filename="Admin.tsx">{PROVIDER}</CodeBlock>

      <CodeBlock filename="routes/login.tsx">{LOGIN}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "onUnauthorized",
            type: "() => void",
            description: "Called on a 401, thrown or rejected.",
          },
          {
            name: "authorizationFallback",
            type: "ReactNode",
            description: (
              <>
                Shown while <C>authorization</C> is pending. Defaults to the page
                loader. Also accepted on the scope, which wins.
              </>
            ),
          },
          {
            name: "forbiddenFallback",
            type: "ReactNode",
            description: (
              <>
                Shown on a 403 or a <C>false</C>. Defaults to an “Access denied”
                message. Also accepted on the scope, which wins.
              </>
            ),
          },
        ]}
      />

      <H2 id="roles">Roles, flags and menu</H2>

      <P>
        The scope decides who gets in; the{" "}
        <A href="/docs/resource-view/permissions">permission flags</A> decide what
        each reader is offered inside. They are evaluated on render, so they cannot
        wait for a request — and they should not each ask for the session again.
        Load it once, keep it, and read it synchronously:
      </P>

      <CodeBlock filename="session.ts" lang="ts">
        {SESSION}
      </CodeBlock>

      <P>The scope awaits it — which is what makes it safe to read afterwards:</P>

      <CodeBlock filename="scopes/admin.ts" lang="ts">
        {SCOPE_WITH_SESSION}
      </CodeBlock>

      <P>The resources read the roles from it:</P>

      <CodeBlock filename="resources/articles.ts" lang="ts">
        {FLAGS}
      </CodeBlock>

      <P>And so does the menu, through a getter on the entry:</P>

      <CodeBlock filename="scopes/admin.ts" lang="ts">
        {MENU}
      </CodeBlock>

      <Callout kind="tip" title="Inside React, useSession works too">
        <P>
          A component of yours — a top bar, an avatar — can call{" "}
          <C>authClient.useSession()</C>. The module above exists for the places
          that are not components: flags and menu entries, declared once, outside
          any render.
        </P>
      </Callout>

      <H2 id="sign-out">Signing out</H2>

      <P>
        Signing out changes nothing the scope can see by itself. Forget the cached
        session, then ask the scope to check again: the authorization now finds no
        session, throws a 401, and <C>onUnauthorized</C> takes the reader to{" "}
        <C>/login</C> — no reload.
      </P>

      <CodeBlock filename="SignOutButton.tsx">{SIGN_OUT}</CodeBlock>

      <Ol>
        <Li>
          <C>authClient.signOut()</C> ends the session on the server.
        </Li>
        <Li>
          <C>forgetSession()</C> drops the copy the flags read.
        </Li>
        <Li>
          <C>recheckAuthorization()</C> hides the scope behind its fallback and
          runs <C>authorization</C> again.
        </Li>
      </Ol>

      <P>
        The button has to render inside the scope to reach its context —{" "}
        <A href="/docs/resource-view/admin-layout">AdminLayout</A>&apos;s{" "}
        <C>sidebarFooter</C> is a natural place for it. The same call picks up a
        role granted or revoked while the reader is on the page.
      </P>

      <H2 id="server">The API decides</H2>

      <Callout kind="warning" title="This only protects the interface">
        <P>
          Everything on this page runs in the browser, where anyone can change it.
          It decides what is <em>shown</em>. Your API must check the session and the
          role again on every request — Better Auth's <C>auth.api.getSession()</C>{" "}
          on the server, a security expression in API Platform — or the protected
          data is one <C>fetch</C> away.
        </P>
      </Callout>

      <H2 id="other">Other providers</H2>

      <P>
        Nothing here is specific to Better Auth: <C>authorization</C> only needs to
        end in <C>true</C>, <C>false</C> or one of the two errors. With a Symfony /
        API Platform back end and{" "}
        <A href="https://github.com/lexik/LexikJWTAuthenticationBundle">
          LexikJWTAuthenticationBundle
        </A>
        , the session is a token and the user comes from a <C>/me</C> call:
      </P>

      <CodeBlock filename="scopes/admin.ts" lang="ts">
        {JWT}
      </CodeBlock>

      <Ul>
        <Li>
          The same <C>loadSession</C> / <C>hasRole</C> module applies — cache the{" "}
          <C>/me</C> response instead of <C>getSession()</C>.
        </Li>
        <Li>
          Signing out is removing the token, forgetting the cached user and calling{" "}
          <C>recheckAuthorization()</C>.
        </Li>
      </Ul>
    </DocArticle>
  )
}
