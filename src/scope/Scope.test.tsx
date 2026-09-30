import { Suspense } from "react"
import { describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { ScopeProvider, useScopeContext } from "@/scope/Scope"
import {
  ForbiddenError,
  ScopeInterface,
  UnauthorizedError,
} from "@/scope/scopeInterface"

// Les scopes résolus sont mis en cache par nom, au niveau du module : chaque
// test prend des noms à lui.
let counter = 0
function uniqueName(prefix: string) {
  counter += 1
  return `${prefix}_${counter}`
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function Protected() {
  return <p>Protected content</p>
}

async function renderScope(
  scopes: ScopeInterface[],
  props: {
    scopeName?: string
    onUnauthorized?: () => void
    children?: React.ReactNode
  } = {}
) {
  const configScope = Object.fromEntries(
    scopes.map((scope) => [scope.name, async () => scope])
  )
  const tree = (scopeName: string) => (
    <Suspense fallback={<p>Loading scope</p>}>
      <ScopeProvider
        scopeName={scopeName}
        configScope={configScope}
        unauthorizedError={props.onUnauthorized}
        authorizationFallback={<p>Checking access</p>}
      >
        {props.children ?? <Protected />}
      </ScopeProvider>
    </Suspense>
  )

  let result!: ReturnType<typeof render>
  await act(async () => {
    result = render(tree(props.scopeName ?? scopes[0].name))
  })

  return {
    ...result,
    switchTo: async (scopeName: string) => {
      await act(async () => {
        result.rerender(tree(scopeName))
      })
    },
  }
}

describe("ScopeProvider authorization", () => {
  it("renders the scope without any authorization", async () => {
    await renderScope([{ name: uniqueName("open") }])

    expect(screen.getByText("Protected content")).toBeInTheDocument()
  })

  it("still accepts a synchronous authorization", async () => {
    await renderScope([{ name: uniqueName("sync"), authorization: () => true }])

    expect(screen.getByText("Protected content")).toBeInTheDocument()
  })

  it("calls onUnauthorized when a synchronous authorization throws a 401", async () => {
    const onUnauthorized = vi.fn()
    await renderScope(
      [
        {
          name: uniqueName("sync401"),
          authorization: () => {
            throw new UnauthorizedError()
          },
        },
      ],
      { onUnauthorized }
    )

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
  })

  it("shows the fallback, not the content, until an async authorization resolves", async () => {
    const pending = deferred<boolean>()
    await renderScope([
      { name: uniqueName("async"), authorization: () => pending.promise },
    ])

    expect(screen.getByText("Checking access")).toBeInTheDocument()
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()

    await act(async () => pending.resolve(true))

    expect(screen.getByText("Protected content")).toBeInTheDocument()
    expect(screen.queryByText("Checking access")).not.toBeInTheDocument()
  })

  it("calls onUnauthorized when an async authorization rejects with a 401", async () => {
    const onUnauthorized = vi.fn()
    await renderScope(
      [
        {
          name: uniqueName("async401"),
          authorization: async () => {
            throw new UnauthorizedError()
          },
        },
      ],
      { onUnauthorized }
    )

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
  })

  it("shows an access denied state when an async authorization rejects with a 403", async () => {
    const onUnauthorized = vi.fn()
    await renderScope(
      [
        {
          name: uniqueName("async403"),
          authorization: async () => {
            throw new ForbiddenError()
          },
        },
      ],
      { onUnauthorized }
    )

    expect(screen.getByRole("alert")).toHaveTextContent("Access denied")
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it("recognizes a 401 or a 403 carried by any error's status", async () => {
    const onUnauthorized = vi.fn()
    await renderScope(
      [
        {
          name: uniqueName("status401"),
          authorization: async () => {
            throw Object.assign(new Error("Session expired"), { status: 401 })
          },
        },
      ],
      { onUnauthorized }
    )

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()

    await renderScope([
      {
        name: uniqueName("status403"),
        authorization: () => {
          throw { status: 403 }
        },
      },
    ])

    expect(screen.getByRole("alert")).toHaveTextContent("Access denied")
  })

  it("renders the scope's own forbiddenFallback for a 403", async () => {
    await renderScope([
      {
        name: uniqueName("custom403"),
        authorization: () => {
          throw new ForbiddenError()
        },
        forbiddenFallback: <p>Admins only</p>,
      },
    ])

    expect(screen.getByText("Admins only")).toBeInTheDocument()
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
  })

  it("treats false as a 403, sync or async", async () => {
    await renderScope([{ name: uniqueName("false"), authorization: () => false }])
    expect(screen.getByRole("alert")).toHaveTextContent("Access denied")

    await renderScope([
      { name: uniqueName("asyncFalse"), authorization: async () => false },
    ])
    expect(screen.getAllByRole("alert")).toHaveLength(2)
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
  })

  it("ignores a promise that settles after the scope changed", async () => {
    const stale = deferred<boolean>()
    const slow: ScopeInterface = {
      name: uniqueName("slow"),
      authorization: () => stale.promise,
    }
    const denied: ScopeInterface = {
      name: uniqueName("denied"),
      authorization: () => false,
    }
    const { switchTo } = await renderScope([slow, denied])

    await switchTo(denied.name)
    expect(screen.getByRole("alert")).toHaveTextContent("Access denied")

    await act(async () => stale.resolve(true))

    expect(screen.getByRole("alert")).toHaveTextContent("Access denied")
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
  })

  it("checks again when asked through the context", async () => {
    let isLogged = true
    const onUnauthorized = vi.fn()

    function SignOut() {
      const { recheckAuthorization } = useScopeContext()!
      return (
        <button
          onClick={() => {
            isLogged = false
            recheckAuthorization()
          }}
        >
          Sign out
        </button>
      )
    }

    await renderScope(
      [
        {
          name: uniqueName("recheck"),
          authorization: async () => {
            if (!isLogged) throw new UnauthorizedError()
            return true
          },
        },
      ],
      {
        onUnauthorized,
        children: (
          <>
            <Protected />
            <SignOut />
          </>
        ),
      }
    )
    expect(screen.getByText("Protected content")).toBeInTheDocument()

    await act(async () => screen.getByText("Sign out").click())

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
  })
})
