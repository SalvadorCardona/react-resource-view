import { describe, expect, it } from "vitest"
import getIdentityFromObject from "@/internal/id/getIdentityFromObject"
import { jsonLdDialect } from "@/api/dialect/jsonLdDialect"
import { strapiDialect } from "@/api/dialect/strapiDialect"
import { supabaseDialect } from "@/api/dialect/supabaseDialect"

describe("the identity of a record", () => {
  it("keeps the IRI and the id of a JSON-LD item", () => {
    const record: any = {
      "@id": "/tasks/12",
      "@type": "Task",
      id: 12,
      title: "Roast",
    }

    expect(getIdentityFromObject(record, { dialect: jsonLdDialect() })).toEqual({
      "@id": "/tasks/12",
      id: 12,
    })
  })

  it("keeps the IRI of a JSON-LD item that has no id of its own", () => {
    const record: any = { "@id": "/tasks/12", title: "Roast" }

    expect(getIdentityFromObject(record, { dialect: jsonLdDialect() })).toEqual({
      "@id": "/tasks/12",
    })
  })

  it("keeps the documentId of a Strapi entry, not its numeric id", () => {
    const record: any = { id: 1, documentId: "kx8f2", title: "Roast" }

    expect(getIdentityFromObject(record, { dialect: strapiDialect() })).toEqual({
      documentId: "kx8f2",
    })
  })

  it("keeps the primary key a Supabase table declares", () => {
    const record: any = { id: 3, uuid: "a1b2", title: "Roast" }
    const dialect = supabaseDialect({ primaryKey: "uuid" })

    expect(getIdentityFromObject(record, { dialect })).toEqual({ uuid: "a1b2" })
  })

  it("is empty for a record without identity", () => {
    expect(getIdentityFromObject({ title: "Roast" } as any)).toEqual({})
  })
})
