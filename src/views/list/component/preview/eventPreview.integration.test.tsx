import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { setHours, setMinutes } from "date-fns"
import { calendarViewOptionFactory, createViewResource } from "@/index"
import ResourceViewProvider from "@/provider/ResourceViewProvider"

/**
 * Clicking an event used to open a popover printing every key of the record —
 * `@context` and identifiers included. What opens now is a small window: the
 * event's name, when it happens, a few labelled fields and the row's actions.
 */

// Which actions a row offers is ListResourceViewButton's business, and drawing
// them here would pull routing into a test about what a window holds. Only the
// buttons are stubbed: whether there are any to draw is read from the resource,
// as in the real thing.
vi.mock("@/action/ListResourceViewButton", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  default: () => <div data-testid="actions" />,
}))

const at = (hour: number, minute = 0) =>
  setMinutes(setHours(new Date(), hour), minute).toISOString()

interface Roast {
  "@id": string
  "@type": string
  id: string
  batch: string
  origin: string
  roaster: string
  status: string
  weight: number
  profile: string
  notes: string
  startAt: string
  endAt: string
}

const ROASTS: Roast[] = [
  {
    "@id": "/api/roasts/1",
    "@type": "Roast",
    id: "1",
    batch: "Yirgacheffe 12",
    origin: "Ethiopia",
    roaster: "Probat",
    status: "planned",
    weight: 24,
    profile: "Filter",
    notes: "Cupped on Friday",
    startAt: at(9),
    endAt: at(10, 30),
  },
]

function createRoastsResource(id: string, canUpdate: boolean) {
  return createViewResource<Roast>(id, {
    name: "Roasts",
    scope: "preview",
    canUpdate,
    getCollection: async () => ({
      data: {
        "@id": id,
        "@type": "Collection",
        member: ROASTS,
        totalItems: ROASTS.length,
      },
    }),
    view: {
      name: "Roasts",
      form: {
        inputs: {
          batch: { label: "Batch" },
          origin: { label: "Origin" },
          roaster: { label: "Roaster" },
          status: { label: "Status" },
          weight: { label: "Kilograms" },
          profile: { label: "Profile" },
          notes: { label: "Notes" },
          startAt: { label: "Starts at" },
          endAt: { label: "Ends at" },
        },
      },
      viewVariants: [
        calendarViewOptionFactory({
          name: "Calendar",
          mode: "day",
          dateKey: "startAt",
          endDateKey: "endAt",
          titleKey: "batch",
        }),
      ],
    },
  })
}

const roastsResource = createRoastsResource("preview_roasts", true)
/** Nothing may be done to these batches: the window has no actions to draw. */
const readOnlyRoastsResource = createRoastsResource("preview_read_roasts", false)

async function openTheEvent(resourceId: string = "preview_roasts") {
  const user = userEvent.setup()
  render(
    <ResourceViewProvider
      viewResourceContextParams={{ scope: "preview", resourceId }}
      configuration={{
        resources: [roastsResource, readOnlyRoastsResource],
        defaultScope: "preview",
      }}
    />
  )

  const event = await screen.findByRole("button", { name: /Yirgacheffe 12/ })
  await user.click(event)

  return await waitFor(() => {
    const preview = document.querySelector('[data-slot="event-preview"]')
    expect(preview).not.toBeNull()
    return preview!
  })
}

describe("the window a calendar event opens", () => {
  it("names the event, dates it and hands over the row's actions", async () => {
    const preview = await openTheEvent()

    expect(preview).toHaveTextContent("Yirgacheffe 12")
    expect(preview).toHaveTextContent("09:00 - 10:30")
    expect(preview).toContainElement(screen.getByTestId("actions"))
  })

  it("summarises the record with the labels its form declares", async () => {
    const preview = await openTheEvent()

    expect(preview).toHaveTextContent("Origin")
    expect(preview).toHaveTextContent("Ethiopia")
    expect(preview).toHaveTextContent("Roaster")
    expect(preview).toHaveTextContent("Probat")
  })

  it("leaves out what the event already says, and what only the API reads", async () => {
    const preview = await openTheEvent()

    // The title and the dates are drawn in the header; repeating them as
    // fields is how the dump read.
    expect(preview).not.toHaveTextContent("Batch")
    expect(preview).not.toHaveTextContent("Starts at")
    expect(preview).not.toHaveTextContent(ROASTS[0].startAt)
    expect(preview).not.toHaveTextContent("@type")
    expect(preview).not.toHaveTextContent("/api/roasts/1")
  })

  it("stops after a handful of fields, rather than growing into a dump", async () => {
    const preview = await openTheEvent()

    // Five fields fit; the sixth declared one — here `notes` — is what the
    // actions under them are there to open.
    expect(preview.querySelectorAll("dt")).toHaveLength(5)
    expect(preview).not.toHaveTextContent("Cupped on Friday")
  })

  // The separator above the actions used to be drawn whether or not there was
  // anything under it — a stray line at the foot of the window.
  it("draws no action bar for a resource offering no action", async () => {
    const preview = await openTheEvent("preview_read_roasts")

    expect(preview).toHaveTextContent("Yirgacheffe 12")
    expect(screen.queryByTestId("actions")).toBeNull()
  })
})
