import { describe, expect, it } from "vitest"
import { mergeDefinition } from "@/definition/mergeDefinition"

describe("mergeDefinition", () => {
  it("merges objects key by key, at any depth", () => {
    expect(
      mergeDefinition<any>(
        { views: { update: { open: "drawer", fullWidth: true } } },
        { views: { update: { afterSave: "close" } } }
      )
    ).toEqual({
      views: { update: { open: "drawer", fullWidth: true, afterSave: "close" } },
    })
  })

  it("replaces arrays and functions rather than merging them", () => {
    const first = () => null
    const second = () => null

    expect(
      mergeDefinition<any>(
        { rowActions: ["update", "delete"], components: { top: first } },
        { rowActions: ["read"], components: { top: second } }
      )
    ).toEqual({ rowActions: ["read"], components: { top: second } })
  })

  it("ignores undefined, so a spread of optional values erases nothing", () => {
    expect(
      mergeDefinition<any>({ fullWidth: true }, { fullWidth: undefined })
    ).toEqual({ fullWidth: true })
  })

  it("keeps false and null, which is how a level removes what it inherits", () => {
    expect(
      mergeDefinition<any>(
        {
          form: { inputs: { title: { label: "Title" }, notes: { label: "Notes" } } },
        },
        { form: { inputs: { notes: false } } }
      )
    ).toEqual({ form: { inputs: { title: { label: "Title" }, notes: false } } })
  })

  it("merges one input over another rather than replacing it", () => {
    expect(
      mergeDefinition<any>(
        { inputs: { status: { label: "Status", required: true } } },
        { inputs: { status: { label: "State" } } }
      )
    ).toEqual({ inputs: { status: { label: "State", required: true } } })
  })

  it("leaves the levels it reads untouched", () => {
    const root = { form: { inputs: { title: { label: "Title" } } } }
    mergeDefinition<any>(root, { form: { inputs: { title: { required: true } } } })

    expect(root).toEqual({ form: { inputs: { title: { label: "Title" } } } })
  })

  it("passes a React element on as it was created", () => {
    const element = { $$typeof: Symbol.for("react.element"), props: {} }
    const merged = mergeDefinition<any>(
      { label: { $$typeof: "old" } },
      { label: element }
    )

    expect(merged.label).toBe(element)
  })
})
