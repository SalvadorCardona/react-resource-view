import { afterEach, describe, expect, it } from "vitest"
import { ActionList } from "react-data-form"
import { generateLink, parseLink } from "@/routes/routes"
import { configurePorts } from "@/ports"

const useQueryMode = (basePath = "") =>
  configurePorts({ routing: { mode: "query", param: "view", basePath } })

afterEach(() => {
  configurePorts({ routing: { mode: "path", param: "view", basePath: "" } })
})

describe("query routing", () => {
  it("keeps the whole context in the query string", () => {
    useQueryMode()
    expect(
      generateLink({
        scope: "admin",
        resourceId: "articles",
        resourceAction: ActionList.update,
        id: "42",
      })
    ).toBe("?view=admin/articles/update/42")
  })

  it("points the link at the configured base path", () => {
    // Static hosting serves one real file; every view hangs off its query.
    useQueryMode("/docs.html")
    expect(
      generateLink({ scope: "demo", resourceId: "articles", resourceAction: ActionList.list })
    ).toBe("/docs.html?view=demo/articles/list")
  })

  it("carries the filter alongside the context", () => {
    useQueryMode()
    const link = generateLink({
      scope: "admin",
      resourceId: "articles",
      resourceAction: ActionList.list,
      filter: { published: true },
    })

    expect(link.startsWith("?view=admin/articles/list&filter=")).toBe(true)
  })

  it("is the exact inverse of generateLink", () => {
    useQueryMode()
    const params = {
      scope: "admin",
      resourceId: "articles",
      resourceAction: ActionList.update,
      id: "42",
    }

    expect(parseLink(generateLink(params))).toMatchObject(params)
  })

  it("round-trips a filter through the query", () => {
    useQueryMode()
    const params = {
      scope: "admin",
      resourceId: "articles",
      resourceAction: ActionList.list,
      filter: { published: true },
    }

    expect(parseLink(generateLink(params))).toMatchObject(params)
  })

  it("round-trips a child view", () => {
    useQueryMode()
    const params = {
      scope: "admin",
      resourceId: "articles",
      resourceAction: ActionList.read,
      id: "42",
      childViewResource: {
        resourceId: "comments",
        resourceAction: ActionList.update,
        id: "7",
      },
    }

    expect(parseLink(generateLink(params))).toMatchObject(params)
  })

  it("reads a query URL even while configured for path mode", () => {
    // A link shared from a statically hosted page must keep working wherever
    // it is opened, whatever the reader's configuration says.
    expect(parseLink("/docs.html?view=admin/articles/update/42")).toMatchObject({
      scope: "admin",
      resourceId: "articles",
      resourceAction: ActionList.update,
      id: "42",
    })
  })

  it("still reads a path URL in path mode", () => {
    expect(parseLink("/admin/articles/update/42")).toMatchObject({
      scope: "admin",
      resourceId: "articles",
      resourceAction: ActionList.update,
      id: "42",
    })
  })

  it("still carries the current scope when nothing else is given", () => {
    // The scope is part of the context, so it survives an otherwise empty link.
    useQueryMode("/docs.html")
    expect(generateLink({})).toMatch(/^\/docs\.html\?view=[^/]+$/)
  })
})
