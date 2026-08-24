import { describe, expect, it } from "vitest"
import { ActionList } from "react-data-form"
import { decodeQuery, encodeQuery } from "@/internal/url/urlEncoder"
import { generateLink, parseLink } from "@/routes/routes"
import { configurePorts } from "@/ports"

describe("encodeQuery", () => {
  it("round-trips a plain object", () => {
    const data = { author: "Ada", published: true, count: 3 }
    expect(decodeQuery(encodeQuery(data))).toEqual(data)
  })

  it("escapes the characters that would end a query parameter", () => {
    // encodeURI leaves & = # untouched, which used to truncate the parameter
    // and lose everything after the first one.
    const encoded = encodeQuery({ title: "Tom & Jerry" })
    expect(encoded).not.toContain("&")
    expect(decodeQuery(encoded)).toEqual({ title: "Tom & Jerry" })
  })

  it.each([
    ["an ampersand", "Tom & Jerry"],
    ["an equals sign", "a=b"],
    ["a hash", "#1 pick"],
    ["a plus sign", "1+1"],
    ["a question mark", "why?"],
    ["accents", "Éléphant d'Afrique"],
  ])("survives %s", (_label, title) => {
    expect(decodeQuery(encodeQuery({ title }))).toEqual({ title })
  })

  it("still reads links written with the previous encoding", () => {
    // Older links used encodeURI; decodeURIComponent reads those too, so
    // bookmarks and shared URLs keep working.
    const legacy = encodeURI(JSON.stringify({ author: "Ada" }))
    expect(decodeQuery(legacy)).toEqual({ author: "Ada" })
  })
})

describe("data carried through a link", () => {
  const queryMode = () =>
    configurePorts({
      routing: { mode: "query", param: "view", basePath: "/demo.html" },
    })

  it("round-trips defaultData holding a reserved character", () => {
    queryMode()
    const params = {
      scope: "demo",
      resourceId: "articles",
      resourceAction: ActionList.create,
      defaultData: { title: "Tom & Jerry" },
    }

    expect(parseLink(generateLink(params))).toMatchObject({
      defaultData: { title: "Tom & Jerry" },
    })
    configurePorts({ routing: { mode: "path", param: "view", basePath: "" } })
  })

  it("round-trips a filter holding a reserved character", () => {
    const params = {
      scope: "demo",
      resourceId: "articles",
      resourceAction: ActionList.list,
      filter: { search: "a=b&c" },
    }

    expect(parseLink(generateLink(params))).toMatchObject({
      filter: { search: "a=b&c" },
    })
  })
})
