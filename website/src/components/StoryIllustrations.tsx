import type { ReactNode } from "react"

/**
 * The three drawings of the landing's "Where it comes from" story: a notes app
 * reading one set of records three ways, a React app frozen on one screen, and
 * one description feeding every view.
 *
 * The same three records — coloured primary, view and form — appear in each
 * drawing, so the eye follows the data from one step to the next. Like the
 * feature illustrations, they are plain inline SVG coloured through the theme's
 * utilities, so they follow the light and dark themes, and they are decoration:
 * the caption under each one says what it shows.
 */

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 240 170"
      className="h-auto w-full font-mono"
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

/** The three records every drawing shows, one colour each. */
const RECORDS = ["fill-primary", "fill-view", "fill-form"]

/** A row of a table: the record's colour, then its title and one more column. */
function Row({
  x,
  y,
  width,
  fill,
}: {
  x: number
  y: number
  width: number
  fill: string
}) {
  return (
    <g>
      <circle cx={x + 3} cy={y + 2} r="2.5" className={fill} />
      <rect
        x={x + 9}
        y={y}
        width={width * 0.55}
        height="4"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x={x + width - width * 0.2}
        y={y}
        width={width * 0.2}
        height="4"
        rx="2"
        className="fill-muted-foreground/20"
      />
    </g>
  )
}

/** A card of a board: a coloured stripe and two lines of text. */
function Card({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="3"
        className="fill-background stroke-border"
      />
      <rect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height="3"
        rx="1.5"
        className={fill}
      />
      <rect
        x={x + 3}
        y={y + 9}
        width={(width - 6) * 0.8}
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25"
      />
    </g>
  )
}

/* -------------------------------------------------------------------------- */

/** A notes app: one set of records, a table, a board and a calendar a click apart. */
export function NotesViewsIllustration() {
  const tabs = [
    { x: 20, label: "Table" },
    { x: 88, label: "Board" },
    { x: 156, label: "Calendar" },
  ]

  return (
    <Frame>
      <rect
        x="8"
        y="8"
        width="224"
        height="154"
        rx="8"
        className="fill-background stroke-border"
      />
      <rect
        x="20"
        y="20"
        width="9"
        height="11"
        rx="1.5"
        className="stroke-muted-foreground"
      />
      <path d="M22.5 24h4M22.5 27h3" className="stroke-muted-foreground" />
      <text x="35" y="29" fontSize="9" className="fill-foreground">
        Reading list
      </text>

      {/* The view switcher, "Table" picked and the pointer on "Board" */}
      {tabs.map(({ x, label }, index) => (
        <g key={label}>
          <rect
            x={x}
            y="40"
            width="64"
            height="17"
            rx="5"
            className={
              index === 0 ? "fill-primary/10 stroke-primary" : "stroke-border"
            }
          />
          <text
            x={x + 32}
            y="51.5"
            fontSize="8"
            textAnchor="middle"
            className={index === 0 ? "fill-primary" : "fill-muted-foreground"}
          >
            {label}
          </text>
        </g>
      ))}
      <path
        d="M137 51l0 11 3-3 2.5 5 2-1-2.5-5 4.5 0z"
        className="fill-background stroke-foreground"
      />

      {/* Under each tab, what it shows: the same three records */}
      {tabs.map(({ x, label }, index) => (
        <rect
          key={label}
          x={x}
          y="66"
          width="64"
          height="84"
          rx="5"
          strokeDasharray={index === 0 ? undefined : "3 3"}
          className={index === 0 ? "stroke-primary" : "stroke-border"}
        />
      ))}

      {/* Table */}
      <rect
        x="26"
        y="74"
        width="52"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/40"
      />
      {RECORDS.map((fill, index) => (
        <g key={fill}>
          <path d={`M26 ${87 + index * 16}h52`} className="stroke-border" />
          <Row x={26} y={93 + index * 16} width={52} fill={fill} />
        </g>
      ))}

      {/* Board: two columns, the records spread across them */}
      <rect
        x="94"
        y="74"
        width="16"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/40"
      />
      <rect
        x="122"
        y="74"
        width="16"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/40"
      />
      <Card x={94} y={82} width={24} height={16} fill={RECORDS[0]} />
      <Card x={94} y={102} width={24} height={16} fill={RECORDS[2]} />
      <Card x={122} y={82} width={24} height={16} fill={RECORDS[1]} />

      {/* Calendar: a month grid, one record per day */}
      {[0, 1, 2, 3, 4].map((line) => (
        <path
          key={`h${line}`}
          d={`M162 ${78 + line * 16}h52`}
          className="stroke-border"
        />
      ))}
      {[0, 1, 2, 3, 4].map((line) => (
        <path
          key={`v${line}`}
          d={`M${162 + line * 13} 78v64`}
          className="stroke-border"
        />
      ))}
      <rect x="176.5" y="84" width="10" height="4" rx="2" className={RECORDS[0]} />
      <rect x="202.5" y="100" width="10" height="4" rx="2" className={RECORDS[1]} />
      <rect x="163.5" y="116" width="10" height="4" rx="2" className={RECORDS[2]} />
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

/** A React app: the table is the screen, and every other view is another file. */
export function FrozenScreenIllustration() {
  return (
    <Frame>
      {/* The copies another view costs, stacked behind */}
      {[
        { x: 56, y: 8, file: "ArticleCalendar.tsx" },
        { x: 32, y: 26, file: "ArticleBoard.tsx" },
      ].map(({ x, y, file }) => (
        <g key={file}>
          <rect
            x={x}
            y={y}
            width="176"
            height="118"
            rx="7"
            strokeDasharray="3 3"
            className="fill-background stroke-muted-foreground/60"
          />
          <text
            x={x + 10}
            y={y + 12}
            fontSize="7.5"
            className="fill-muted-foreground"
          >
            {file}
          </text>
        </g>
      ))}

      {/* The screen that exists, a table */}
      <rect
        x="8"
        y="44"
        width="176"
        height="118"
        rx="7"
        className="fill-background stroke-border"
      />
      <text x="18" y="56" fontSize="7.5" className="fill-foreground">
        ArticleTable.tsx
      </text>
      <path d="M8 62h176" className="stroke-border" />
      <rect
        x="18"
        y="70"
        width="156"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/40"
      />
      {[...RECORDS, "fill-muted-foreground/30", "fill-muted-foreground/30"].map(
        (fill, index) => (
          <g key={index}>
            <path d={`M18 ${80 + index * 16}h156`} className="stroke-border" />
            <Row x={18} y={86 + index * 16} width={156} fill={fill} />
          </g>
        )
      )}

      {/* Locked: the view was chosen when the code was written */}
      <circle
        cx="184"
        cy="46"
        r="13"
        className="fill-background stroke-foreground"
      />
      <rect
        x="178"
        y="45"
        width="12"
        height="9"
        rx="2"
        className="stroke-foreground"
      />
      <path d="M180.5 45v-3a3.5 3.5 0 0 1 7 0v3" className="stroke-foreground" />
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

/** One description, every view — and the one being read written in the URL. */
export function OneDescriptionIllustration() {
  const code = [
    { text: "createViewResource({" },
    { text: "  form," },
    { text: "  viewVariants: [" },
    { text: "    table()," },
    { text: "    cards()," },
    { text: "    calendar(),", active: true },
    { text: "  ]," },
    { text: "})" },
  ]

  return (
    <Frame>
      <rect
        x="8"
        y="8"
        width="224"
        height="20"
        rx="6"
        className="fill-background stroke-border"
      />
      <circle cx="19" cy="18" r="3" className="stroke-muted-foreground" />
      <text x="27" y="21" fontSize="8" className="fill-muted-foreground">
        /articles?view=<tspan className="fill-primary">calendar</tspan>
      </text>

      {/* The description */}
      <rect
        x="8"
        y="38"
        width="110"
        height="124"
        rx="6"
        className="fill-code-bg stroke-border"
      />
      {code.map(({ text, active }, index) => (
        <text
          key={index}
          x="14"
          y={54 + index * 14}
          fontSize="7.5"
          xmlSpace="preserve"
          className={active ? "fill-primary" : "fill-muted-foreground"}
        >
          {text}
        </text>
      ))}

      {/* Each variant, wired to the view it draws */}
      <path d="M70 93C112 93 116 56 140 56" className="stroke-muted-foreground/50" />
      <path
        d="M70 107C112 107 116 100 140 100"
        className="stroke-muted-foreground/50"
      />
      <path d="M84 121C112 121 116 144 140 144" className="stroke-primary" />

      {/* table() */}
      <rect
        x="140"
        y="38"
        width="92"
        height="36"
        rx="5"
        className="fill-background stroke-border"
      />
      {RECORDS.map((fill, index) => (
        <Row key={fill} x={147} y={45 + index * 9} width={78} fill={fill} />
      ))}

      {/* cards() */}
      <rect
        x="140"
        y="82"
        width="92"
        height="36"
        rx="5"
        className="fill-background stroke-border"
      />
      {RECORDS.map((fill, index) => (
        <Card
          key={fill}
          x={146 + index * 28}
          y={89}
          width={24}
          height={22}
          fill={fill}
        />
      ))}

      {/* calendar(), the view the URL asks for */}
      <rect
        x="140"
        y="126"
        width="92"
        height="36"
        rx="5"
        className="fill-primary/10 stroke-primary"
      />
      {[0, 1, 2].map((line) => (
        <path
          key={`h${line}`}
          d={`M146 ${132 + line * 12}h80`}
          className="stroke-border"
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <path
          key={`v${line}`}
          d={`M${146 + line * 16} 132v24`}
          className="stroke-border"
        />
      ))}
      <rect x="164" y="136" width="12" height="4" rx="2" className={RECORDS[0]} />
      <rect x="196" y="136" width="12" height="4" rx="2" className={RECORDS[1]} />
      <rect x="148" y="148" width="12" height="4" rx="2" className={RECORDS[2]} />
    </Frame>
  )
}
