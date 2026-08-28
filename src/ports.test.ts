import { afterEach, describe, expect, it } from "vitest"
import { enUS, fr } from "date-fns/locale"
import { configurePorts, getDateLocale, getWeekStartsOn } from "@/ports"

afterEach(() => {
  configurePorts({ dateLocale: enUS })
})

describe("the date locale of the views", () => {
  it("formats in English until the application says otherwise", () => {
    expect(getDateLocale().code).toBe("en-US")
    expect(getWeekStartsOn()).toBe(0)
  })

  it("takes the locale the application configures", () => {
    configurePorts({ dateLocale: fr })

    expect(getDateLocale().code).toBe("fr")
    // A French week starts on Monday: the calendar and the timeline lay their
    // columns out from this.
    expect(getWeekStartsOn()).toBe(1)
  })
})
