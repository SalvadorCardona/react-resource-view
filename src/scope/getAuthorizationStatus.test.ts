import { describe, expect, it } from "vitest"
import { getAuthorizationStatus } from "@/scope/getAuthorizationStatus"
import { ForbiddenError, UnauthorizedError } from "@/scope/scopeInterface"

describe("getAuthorizationStatus", () => {
  it("recognizes the exported classes", () => {
    expect(getAuthorizationStatus(new UnauthorizedError())).toBe(401)
    expect(getAuthorizationStatus(new ForbiddenError())).toBe(403)
  })

  it("recognizes any object carrying a 401 or 403 status", () => {
    expect(getAuthorizationStatus({ status: 401 })).toBe(401)
    expect(getAuthorizationStatus({ status: 403 })).toBe(403)
    expect(getAuthorizationStatus(Object.assign(new Error(), { status: 401 }))).toBe(
      401
    )
  })

  it("ignores any other status", () => {
    expect(
      getAuthorizationStatus(Object.assign(new Error("boom"), { status: 500 }))
    ).toBeUndefined()
    expect(getAuthorizationStatus({ status: 419 })).toBeUndefined()
    expect(getAuthorizationStatus({ status: "401" })).toBeUndefined()
  })

  it("ignores errors without a status", () => {
    expect(getAuthorizationStatus(new Error("boom"))).toBeUndefined()
    expect(getAuthorizationStatus("boom")).toBeUndefined()
    expect(getAuthorizationStatus(null)).toBeUndefined()
    expect(getAuthorizationStatus(undefined)).toBeUndefined()
  })
})
