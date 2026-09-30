import type { CSSProperties, ReactNode } from "react"

/**
 * The drawings at the top of the landing's two package cards: a description
 * that becomes a form, and a declared resource that becomes every view of its
 * collection.
 *
 * They are drawn as a pair — the same frame, the same code panel on the left,
 * the same arrow — so only what comes out on the right differs, in the hue of
 * its package. Like the other drawings of the landing they are inline SVG
 * coloured through the theme's utilities, and decoration: the card's text says
 * what they show. The motion over the card lives in app.css (`package-*`).
 */

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 360 150"
      className="h-full w-full font-mono"
      fill="none"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** The object on the left: one line per key, the key in the package's hue. */
function CodePanel({
  lines,
  keyClassName,
}: {
  lines: [key: string, value: string][]
  keyClassName: string
}) {
  const top = 75 - (lines.length + 2) * 7

  return (
    <g>
      <rect
        x="12"
        y="14"
        width="132"
        height="122"
        rx="8"
        className="fill-code-bg stroke-border"
      />
      <circle cx="24" cy="25" r="2" className="fill-muted-foreground/30" />
      <circle cx="31" cy="25" r="2" className="fill-muted-foreground/30" />
      <circle cx="38" cy="25" r="2" className="fill-muted-foreground/30" />

      <text fontSize="8.5" className="fill-muted-foreground">
        <tspan x="22" y={top + 10}>
          {"{"}
        </tspan>
        {lines.map(([key, value], index) => (
          <tspan key={key} x="30" y={top + 24 + index * 14}>
            <tspan className={keyClassName}>{key}</tspan>
            <tspan className="fill-foreground">: </tspan>
            {value}
          </tspan>
        ))}
        <tspan x="22" y={top + 24 + lines.length * 14}>
          {"}"}
        </tspan>
      </text>
    </g>
  )
}

/** From the description to what it becomes. */
function Arrow({ className }: { className: string }) {
  return (
    <g className="transition-transform duration-300 motion-safe:group-hover:translate-x-1">
      <path d="M152 75h24" className={className} strokeWidth={1.5} />
      <path d="M171 70l5 5-5 5" className={className} strokeWidth={1.5} />
    </g>
  )
}

/** The panel on the right, where the result is drawn. */
function ResultPanel() {
  return (
    <rect
      x="184"
      y="14"
      width="164"
      height="122"
      rx="8"
      className="fill-card stroke-border"
    />
  )
}

const delay = (ms: number) => ({ "--fill-delay": `${ms}ms` }) as CSSProperties

/* -------------------------------------------------------------------------- */

/** A text field: its label, an empty bar at rest, its value over the card. */
function TextField({
  y,
  label,
  value,
  wait,
}: {
  y: number
  label: string
  value: string
  wait: number
}) {
  return (
    <g>
      <text x="194" y={y} fontSize="7" className="fill-muted-foreground">
        {label}
      </text>
      <rect
        x="194"
        y={y + 4}
        width="144"
        height="16"
        rx="4"
        className="fill-background stroke-border"
      />
      <rect
        x="200"
        y={y + 10}
        width="44"
        height="4"
        rx="2"
        className="package-blank fill-muted-foreground/20"
        style={delay(wait)}
      />
      <text
        x="200"
        y={y + 15}
        fontSize="8"
        className="package-fill fill-foreground"
        style={delay(wait)}
      >
        {value}
      </text>
    </g>
  )
}

/** react-data-form: a plain object on the left, the form it renders on the right. */
export function FormPackageIllustration() {
  return (
    <Frame>
      <CodePanel
        keyClassName="fill-form"
        lines={[
          ["name", '"text"'],
          ["email", '"email"'],
          ["role", '"select"'],
          ["terms", '"checkbox"'],
        ]}
      />
      <Arrow className="stroke-form" />
      <ResultPanel />

      <TextField y={28} label="Name" value="Ada Lovelace" wait={0} />
      <TextField y={56} label="Email" value="ada@example.org" wait={180} />

      {/* The select, its chevron on the right */}
      <text x="194" y="84" fontSize="7" className="fill-muted-foreground">
        Role
      </text>
      <rect
        x="194"
        y="88"
        width="144"
        height="16"
        rx="4"
        className="fill-background stroke-border"
      />
      <path d="M326 94l3 3 3-3" className="stroke-muted-foreground" />
      <text
        x="200"
        y="99"
        fontSize="8"
        className="package-blank fill-muted-foreground/60"
        style={delay(360)}
      >
        Choose…
      </text>
      <text
        x="200"
        y="99"
        fontSize="8"
        className="package-fill fill-foreground"
        style={delay(360)}
      >
        Editor
      </text>

      {/* The checkbox, ticked over the card, and the submit button */}
      <rect
        x="194"
        y="113"
        width="10"
        height="10"
        rx="2.5"
        className="fill-background stroke-border"
      />
      <g className="package-fill" style={delay(540)}>
        <rect
          x="194"
          y="113"
          width="10"
          height="10"
          rx="2.5"
          className="fill-form"
        />
        <path
          d="M196.5 118l2 2 3.5-4"
          className="stroke-background"
          strokeWidth={1.5}
        />
      </g>
      <text x="209" y="121" fontSize="7" className="fill-muted-foreground">
        Accept terms
      </text>
      <rect x="290" y="111" width="48" height="15" rx="4" className="fill-form" />
      <text
        x="314"
        y="121"
        fontSize="7.5"
        textAnchor="middle"
        className="fill-background font-sans font-semibold"
      >
        Save
      </text>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

/** The five records every view shows, one colour each. */
const RECORDS = [
  "fill-view",
  "fill-primary",
  "fill-form",
  "fill-view/50",
  "fill-muted-foreground/40",
]

/** The table: a header, then one row per record. */
function TableView() {
  return (
    <g>
      <rect
        x="194"
        y="48"
        width="40"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/40"
      />
      <rect
        x="296"
        y="48"
        width="24"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/40"
      />
      {RECORDS.map((fill, index) => {
        const y = 58 + index * 14
        return (
          <g key={fill}>
            <path d={`M194 ${y - 3}h144`} className="stroke-border" />
            <circle cx="197" cy={y + 3} r="2.5" className={fill} />
            <rect
              x="204"
              y={y + 1}
              width={70 - index * 6}
              height="4"
              rx="2"
              className="fill-muted-foreground/30"
            />
            <rect
              x="296"
              y={y + 1}
              width="30"
              height="4"
              rx="2"
              className="fill-muted-foreground/20"
            />
          </g>
        )
      })}
    </g>
  )
}

/** The cards: the same records as a grid, three and two. */
function CardsView() {
  return (
    <g>
      {RECORDS.map((fill, index) => {
        const x = 194 + (index % 3) * 49
        const y = 46 + Math.floor(index / 3) * 40
        return (
          <g key={fill}>
            <rect
              x={x}
              y={y}
              width="44"
              height="34"
              rx="4"
              className="fill-background stroke-border"
            />
            <rect
              x={x + 4}
              y={y + 4}
              width="36"
              height="10"
              rx="2"
              className={fill}
            />
            <rect
              x={x + 4}
              y={y + 19}
              width="30"
              height="3"
              rx="1.5"
              className="fill-muted-foreground/30"
            />
            <rect
              x={x + 4}
              y={y + 26}
              width="20"
              height="3"
              rx="1.5"
              className="fill-muted-foreground/20"
            />
          </g>
        )
      })}
    </g>
  )
}

/** The calendar: a month grid, each record on its day. */
function CalendarView() {
  const days = [
    [1, 0],
    [4, 1],
    [2, 2],
    [5, 3],
    [0, 3],
  ]

  return (
    <g>
      {Array.from({ length: 8 }, (_, column) => (
        <path
          key={column}
          d={`M${194 + column * 20.5} 46v80`}
          className="stroke-border"
        />
      ))}
      {Array.from({ length: 5 }, (_, row) => (
        <path key={row} d={`M194 ${46 + row * 20}h144`} className="stroke-border" />
      ))}
      <path d="M194 126h144" className="stroke-border" />
      {RECORDS.map((fill, index) => {
        const [column, row] = days[index]
        return (
          <rect
            key={fill}
            x={196 + column * 20.5}
            y={56 + row * 20}
            width="16.5"
            height="5"
            rx="2"
            className={fill}
          />
        )
      })}
    </g>
  )
}

const VIEWS = [
  { label: "Table", View: TableView },
  { label: "Cards", View: CardsView },
  { label: "Calendar", View: CalendarView },
]

/** Each view comes on stage a third of the loop after the one before it. */
const viewDelay = (index: number) =>
  ({ "--view-delay": `${index === 0 ? 0 : -6 + index * 2}s` }) as CSSProperties

/**
 * react-resource-view: one declared resource on the left, its collection on
 * the right — a table at rest, sliding to cards and a calendar over the card.
 */
export function ViewPackageIllustration() {
  return (
    <Frame>
      <CodePanel
        keyClassName="fill-view"
        lines={[
          ["resource", '"books"'],
          ["path", '"/api/books"'],
          ["form", "{ … }"],
          ["views", "[ … ]"],
        ]}
      />
      <Arrow className="stroke-view" />

      {/* The other views, stacked behind the one on stage */}
      <rect
        x="192"
        y="8"
        width="156"
        height="122"
        rx="8"
        className="fill-card stroke-border opacity-50"
      />
      <rect
        x="188"
        y="11"
        width="160"
        height="122"
        rx="8"
        className="fill-card stroke-border opacity-75"
      />
      <ResultPanel />

      {/* The switcher: the tab of the view on stage lights up with it */}
      {VIEWS.map(({ label }, index) => {
        const x = 194 + index * 48
        return (
          <g key={label}>
            <rect
              x={x}
              y="22"
              width="44"
              height="14"
              rx="4"
              className="stroke-border"
            />
            <g
              className="package-view package-tab"
              data-resting={index === 0 ? "" : undefined}
              style={viewDelay(index)}
            >
              <rect
                x={x}
                y="22"
                width="44"
                height="14"
                rx="4"
                className="fill-view/10 stroke-view"
              />
            </g>
            <text
              x={x + 22}
              y="31.5"
              fontSize="7"
              textAnchor="middle"
              className="fill-muted-foreground"
            >
              {label}
            </text>
          </g>
        )
      })}

      {VIEWS.map(({ label, View }, index) => (
        <g
          key={label}
          className="package-view"
          data-resting={index === 0 ? "" : undefined}
          style={viewDelay(index)}
        >
          <View />
        </g>
      ))}
    </Frame>
  )
}
