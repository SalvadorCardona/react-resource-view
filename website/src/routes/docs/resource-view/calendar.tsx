import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Ul } from "@/components/prose"
import { sessionsResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar and timeline — react-resource-view" },
      {
        name: "description",
        content:
          "Laying a collection out over time: a calendar by day, week or month, and a timeline banded by room, person or vehicle.",
      },
    ],
  }),
  component: CalendarAndTimeline,
})

const CALENDAR = `import { calendarViewOptionFactory } from "react-resource-view"

viewVariants: [
  calendarViewOptionFactory({
    dateKey: "startAt",     // when it starts
    endDateKey: "endAt",    // when it ends — omit for point-in-time events
    titleKey: "title",      // what is written on the event
    colorKey: "track",      // one colour per distinct value
    mode: "week",           // "day" | "week" | "month"
    hourStart: 8,
    hourEnd: 18,
  }),
]`

const TIMELINE = `import { timelineViewOptionFactory } from "react-resource-view"

viewVariants: [
  timelineViewOptionFactory<Session>({
    startDateKey: "startAt",
    endDateKey: "endAt",
    titleKey: "title",
    groupKey: "room",          // one band per room
    groupsLabel: "Rooms",      // header of the left-hand column
    statusKey: "status",
    colorByStatus: { confirmed: "#3b82f6", hold: "#f59e0b" },
    daysToShow: 5,
    showUnassigned: false,
  }),
]`

const RESOLVE = `timelineViewOptionFactory<Booking>({
  // The bands, when they are not simply the distinct values of a key —
  // every room, including those with nothing booked in them.
  resolveGroups: () => rooms.map((room) => ({
    id: room["@id"],
    label: room.name,
    sublabel: \`\${room.capacity} seats\`,
  })),
  // Which band a record belongs in.
  resolveGroupForRow: (booking) => ({
    id: booking.room,
    label: roomsById[booking.room]?.name ?? "Unknown",
  }),
})`

const LOCALE = `import { fr } from "date-fns/locale"
import { configurePorts } from "react-resource-view"

// Month names, day headers, and the day a week starts on.
configurePorts({ dateLocale: fr })`

function CalendarAndTimeline() {
  return (
    <DocArticle
      toc={[
        { id: "calendar", title: "Calendar" },
        { id: "timeline", title: "Timeline" },
        { id: "groups", title: "Bands that are not just a key" },
        { id: "locale", title: "Locale" },
        { id: "choosing", title: "Which one, when" },
      ]}
    >
      <P>
        Both lay the same collection out along a time axis, and both need to be told
        which fields carry the dates — there is no naming convention to guess at.
      </P>

      <H2 id="calendar">Calendar</H2>

      <P>
        A day, a week or a month. Records with an end date are drawn as blocks
        spanning their duration; without one they sit at a point in time.
      </P>

      <CodeBlock>{CALENDAR}</CodeBlock>

      <Demo label="A week of conference sessions" wide>
        <ResourceDemo resource={sessionsResource} variant="calendar" />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "dateKey",
            type: "string",
            default: `"dueDate"`,
            description:
              "The field the event is placed by. Almost always worth setting.",
          },
          {
            name: "endDateKey",
            type: "string",
            description: "Makes the event a block rather than a point.",
          },
          {
            name: "titleKey",
            type: "string",
            description: "What is written on the event.",
          },
          {
            name: "colorKey",
            type: "string",
            description: "One colour per distinct value of this field.",
          },
          {
            name: "mode",
            type: `"day" | "week" | "month"`,
            default: `"month"`,
            description: "The span on screen.",
          },
          {
            name: "hourStart / hourEnd",
            type: "number",
            default: "7 / 21",
            description:
              "The vertical window in day and week modes — no point drawing the small hours.",
          },
          {
            name: "getIcon",
            type: "(row) => LucideIcon | undefined",
            description:
              "An icon per event, resolved by the resource so the package stays generic.",
          },
        ]}
      />

      <H2 id="timeline">Timeline</H2>

      <P>
        Time along the top, one band per resource down the side: rooms, staff,
        vehicles, machines. Where a calendar answers “what is happening on Tuesday”,
        a timeline answers “is room B free on Tuesday”.
      </P>

      <CodeBlock>{TIMELINE}</CodeBlock>

      <Demo label="The same sessions, banded by room" wide>
        <ResourceDemo resource={sessionsResource} variant="timeline" />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "startDateKey / endDateKey",
            type: "string",
            default: `"startDate" / "endDate"`,
            description: "The span each band segment covers.",
          },
          {
            name: "groupKey",
            type: "string",
            description: "The field whose distinct values become the bands.",
          },
          {
            name: "groupsLabel",
            type: "string",
            description: "Header of the left-hand column — “Rooms”, “Staff”.",
          },
          {
            name: "statusKey / colorByStatus",
            type: "string / Record<string, string>",
            description: "Colours a segment by a status field.",
          },
          {
            name: "daysToShow",
            type: "number",
            default: "14",
            description: "How wide the window is.",
          },
          {
            name: "showUnassigned",
            type: "boolean",
            default: "true",
            description: (
              <>
                A band collecting records with no group. <C>unassignedLabel</C> names
                it.
              </>
            ),
          },
          {
            name: "resolveGroups / resolveGroupForRow",
            type: "functions",
            description: "Bands computed rather than derived. See below.",
          },
        ]}
      />

      <H2 id="groups">Bands that are not just a key</H2>

      <P>
        <C>groupKey</C> derives the bands from the records, which means an empty room
        does not exist. When the bands are a known set — every room, every engineer,
        whether or not anything is booked — resolve them instead.
      </P>

      <CodeBlock>{RESOLVE}</CodeBlock>

      <Callout kind="tip" title="An empty band is information">
        <P>
          A scheduling screen is read to find the gap. Derived bands hide exactly the
          rows a planner is looking for.
        </P>
      </Callout>

      <H2 id="locale">Locale</H2>

      <P>
        Month names, day headers and the day a week starts on all come from the{" "}
        <C>dateLocale</C> port — Sunday in en-US, Monday in French — so one call
        settles both layouts.
      </P>

      <CodeBlock>{LOCALE}</CodeBlock>

      <H2 id="choosing">Which one, when</H2>

      <Ul>
        <Li>
          <strong>Calendar</strong> when the question is about a moment: what is on
          today, is that week busy.
        </Li>
        <Li>
          <strong>Timeline</strong> when the question is about a resource: is this
          room free, is that person double-booked.
        </Li>
        <Li>
          Declare both. They are two entries in <C>viewVariants</C> and the reader
          switches between them —{" "}
          <A href="/docs/resource-view/layouts">as with any other layout</A>.
        </Li>
      </Ul>
    </DocArticle>
  )
}
