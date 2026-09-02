import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { ActionList } from "react-data-form"
import type { ViewInterface } from "@/ViewInterface"

/**
 * What happens once a record has been created, and where the user lands.
 *
 * A full-page "New user" moves on to the new record's edit screen, so nobody
 * is left in front of a form that has already been sent. A dialog must not:
 * navigating leaves the page it is drawn on, and the list underneath — its
 * filters, its page — goes with it.
 */

const created = { "@id": "/items/1" }
let submit: ((data: object) => Promise<unknown>) | undefined

vi.mock("react-data-form", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-data-form")>()
  return {
    ...actual,
    // The form itself is not under test: only the callback it is handed.
    useForm: ({ onSubmit }: { onSubmit: (data: object) => Promise<unknown> }) => {
      submit = onSubmit
      return { form: { label: {} }, updateData: () => {} }
    },
  }
})

const navigate = vi.fn()
vi.mock("@/ports", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/ports")>()),
  useNavigate: () => navigate,
}))

vi.mock("@/views/update/getFormByCurrentResourceContext", () => ({
  default: () => ({ label: {}, inputs: {} }),
}))

const resource = {
  "@id": "items",
  scope: "admin",
  createItem: async () => ({ data: created }),
}

vi.mock("@/utils/findResource", () => ({
  findResource: () => resource,
}))

vi.mock("sonner", () => ({ toast: { success: () => {}, error: () => {} } }))

const { default: useFormByResource } = await import("@/hook/useFormByResource")

async function createWith(view: ViewInterface) {
  renderHook(() =>
    useFormByResource({
      currentResource: {
        resourceId: "items",
        resourceAction: ActionList.create,
        view,
      },
    })
  )

  await submit?.({ name: "A new one" })
}

describe("useFormByResource, after a creation", () => {
  beforeEach(() => navigate.mockClear())

  it("stays where it is when the form opened in a dialog", async () => {
    await createWith({ behavior: { openIn: "popup" } })

    expect(navigate).not.toHaveBeenCalled()
  })

  it("moves on to the new record's edit screen on a screen of its own", async () => {
    await createWith({ behavior: { openIn: "window" } })

    expect(navigate).toHaveBeenCalledTimes(1)
  })

  it("builds that link in the resource's own scope", async () => {
    await createWith({ behavior: { openIn: "window" } })

    expect(navigate.mock.calls[0][0].to).toContain("admin")
  })
})
