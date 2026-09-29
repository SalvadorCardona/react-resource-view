import type { ReactNode } from "react"

/**
 * One drawing per argument of the landing's "agnostic" grid.
 *
 * Each one shows the mechanism rather than a mood: the query string that drives
 * the view, the ports an adapter plugs into, the 422 that lands back on its
 * field. They are plain inline SVG coloured through the theme's utilities
 * (`stroke-primary`, `fill-muted-foreground`…), so they follow the light and
 * dark themes without a colour of their own — and they are decoration: the text
 * of the cell says everything they show, so they are hidden from assistive
 * technology.
 */

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 150"
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

/* -------------------------------------------------------------------------- */

/** The address bar, and the view each of its parameters decides. */
export function UrlIllustration() {
  return (
    <Frame>
      <rect
        x="12"
        y="12"
        width="296"
        height="26"
        rx="7"
        className="fill-background stroke-border"
      />
      <circle cx="26" cy="25" r="3.5" className="stroke-muted-foreground" />
      <text x="36" y="28.5" fontSize="9" className="fill-muted-foreground">
        /articles?view=
        <tspan className="fill-primary">cards</tspan>
        &amp;page=
        <tspan className="fill-primary">2</tspan>
        &amp;q=
        <tspan className="fill-primary">react</tspan>
        &amp;open=
        <tspan className="fill-primary">42</tspan>
      </text>

      {/* q=react */}
      <rect
        x="12"
        y="50"
        width="70"
        height="16"
        rx="8"
        className="fill-primary/10 stroke-primary"
      />
      <text x="22" y="61" fontSize="8" className="fill-primary">
        q: react
      </text>

      {/* view=cards: the switcher, cards picked */}
      <rect x="252" y="50" width="16" height="16" rx="3" className="stroke-border" />
      <rect
        x="272"
        y="50"
        width="16"
        height="16"
        rx="3"
        className="fill-primary/10 stroke-primary"
      />
      <rect x="292" y="50" width="16" height="16" rx="3" className="stroke-border" />
      <path d="M256 55h8M256 58h8M256 61h8" className="stroke-muted-foreground" />
      <path
        d="M276 54h3v3h-3zM281 54h3v3h-3zM276 59h3v3h-3zM281 59h3v3h-3z"
        className="stroke-primary"
      />
      <path
        d="M296 55h2M296 61h2M300 55h4M300 61h4"
        className="stroke-muted-foreground"
      />

      {/* The cards, the open one drawn out */}
      {[12, 112, 212].map((x, index) => {
        const open = index === 1
        return (
          <g key={x}>
            <rect
              x={x}
              y="76"
              width="96"
              height="44"
              rx="6"
              className={
                open
                  ? "fill-primary/10 stroke-primary"
                  : "fill-background stroke-border"
              }
            />
            <rect
              x={x + 8}
              y="84"
              width="30"
              height="5"
              rx="2.5"
              className={open ? "fill-primary" : "fill-muted-foreground/40"}
            />
            <rect
              x={x + 8}
              y="95"
              width="72"
              height="4"
              rx="2"
              className="fill-muted-foreground/25"
            />
            <rect
              x={x + 8}
              y="103"
              width="54"
              height="4"
              rx="2"
              className="fill-muted-foreground/25"
            />
            {open && (
              <text x={x + 70} y="89" fontSize="8" className="fill-primary">
                #42
              </text>
            )}
          </g>
        )
      })}

      {/* page=2 */}
      {[136, 160, 184].map((cx, index) => (
        <g key={cx}>
          <rect
            x={cx - 8}
            y="128"
            width="16"
            height="14"
            rx="4"
            className={index === 1 ? "fill-primary stroke-primary" : "stroke-border"}
          />
          <text
            x={cx}
            y="138"
            fontSize="8"
            textAnchor="middle"
            className={
              index === 1 ? "fill-primary-foreground" : "fill-muted-foreground"
            }
          >
            {index + 1}
          </text>
        </g>
      ))}
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

/** A core with three sockets, and the adapters an application plugs in. */
export function PortsIllustration() {
  return (
    <Frame>
      <text
        x="160"
        y="22"
        fontSize="9"
        textAnchor="middle"
        className="fill-muted-foreground"
      >
        configure({"{ "}
        <tspan className="fill-primary">router</tspan>,{" "}
        <tspan className="fill-primary">api</tspan>,{" "}
        <tspan className="fill-primary">brand</tspan>
        {" })"}
      </text>

      {/* The core */}
      <rect
        x="116"
        y="48"
        width="88"
        height="46"
        rx="10"
        className="fill-muted stroke-border"
      />
      <text
        x="160"
        y="68"
        fontSize="8.5"
        textAnchor="middle"
        className="fill-foreground"
      >
        resource
      </text>
      <text
        x="160"
        y="80"
        fontSize="8.5"
        textAnchor="middle"
        className="fill-foreground"
      >
        view
      </text>

      {/* Sockets: left, right, bottom */}
      <path d="M116 64a7 7 0 0 1 0 14" className="fill-background stroke-primary" />
      <path d="M204 64a7 7 0 0 0 0 14" className="fill-background stroke-primary" />
      <path d="M153 94a7 7 0 0 0 14 0" className="fill-background stroke-primary" />

      {/* Router, plugged in */}
      <rect
        x="12"
        y="56"
        width="70"
        height="30"
        rx="7"
        className="fill-background stroke-border"
      />
      <text
        x="47"
        y="74"
        fontSize="8.5"
        textAnchor="middle"
        className="fill-foreground"
      >
        router
      </text>
      <path d="M82 71h26" className="stroke-primary" />
      <path d="M108 67.5h6M108 74.5h6" className="stroke-primary" strokeWidth={2} />

      {/* API client, plugged in */}
      <rect
        x="238"
        y="56"
        width="70"
        height="30"
        rx="7"
        className="fill-background stroke-border"
      />
      <text
        x="273"
        y="74"
        fontSize="8.5"
        textAnchor="middle"
        className="fill-foreground"
      >
        api client
      </text>
      <path d="M238 71h-26" className="stroke-primary" />
      <path
        d="M212 67.5h-6M212 74.5h-6"
        className="stroke-primary"
        strokeWidth={2}
      />

      {/* Brand, on its way in */}
      <rect
        x="125"
        y="116"
        width="70"
        height="26"
        rx="7"
        className="fill-background stroke-border"
      />
      <text
        x="160"
        y="132"
        fontSize="8.5"
        textAnchor="middle"
        className="fill-foreground"
      >
        brand
      </text>
      <path d="M160 116v-8" className="stroke-primary" />
      <path
        d="M156.5 108v-5M163.5 108v-5"
        className="stroke-primary"
        strokeWidth={2}
      />

      <text
        x="47"
        y="100"
        fontSize="7.5"
        textAnchor="middle"
        className="fill-muted-foreground"
      >
        port
      </text>
      <text
        x="273"
        y="100"
        fontSize="7.5"
        textAnchor="middle"
        className="fill-muted-foreground"
      >
        port
      </text>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

const BACKENDS = [
  { y: 14, label: "API Platform" },
  { y: 46, label: "Strapi" },
  { y: 78, label: "Supabase" },
  { y: 110, label: "your own", dashed: true },
]

/** One declaration, one dialect per backend, four backends. */
export function BackendsIllustration() {
  return (
    <Frame>
      {/* The declared resource */}
      <rect
        x="12"
        y="30"
        width="92"
        height="90"
        rx="8"
        className="fill-background stroke-border"
      />
      <text x="22" y="47" fontSize="8.5" className="fill-primary">
        articles
      </text>
      {["title", "author", "tags", "date"].map((field, index) => (
        <g key={field}>
          <circle
            cx="25"
            cy={62 + index * 14}
            r="2"
            className="fill-muted-foreground/50"
          />
          <text
            x="32"
            y={65 + index * 14}
            fontSize="8"
            className="fill-muted-foreground"
          >
            {field}
          </text>
        </g>
      ))}

      <path d="M104 75h28" className="stroke-border" />

      {/* The dialect */}
      <rect
        x="132"
        y="62"
        width="58"
        height="26"
        rx="13"
        className="fill-primary/10 stroke-primary"
      />
      <text
        x="161"
        y="78"
        fontSize="8.5"
        textAnchor="middle"
        className="fill-primary"
      >
        dialect
      </text>

      {BACKENDS.map(({ y, label, dashed }) => (
        <g key={label}>
          <path
            d={`M190 75C204 75 198 ${y + 12} 212 ${y + 12}`}
            className={dashed ? "stroke-muted-foreground/60" : "stroke-primary/60"}
            strokeDasharray={dashed ? "3 3" : undefined}
          />
          <rect
            x="212"
            y={y}
            width="96"
            height="24"
            rx="6"
            className={
              dashed ? "stroke-muted-foreground/60" : "fill-background stroke-border"
            }
            strokeDasharray={dashed ? "3 3" : undefined}
          />
          {/* A generic database, not anyone's logo */}
          <ellipse
            cx="226"
            cy={y + 8.5}
            rx="5"
            ry="2"
            className="stroke-muted-foreground"
          />
          <path
            d={`M221 ${y + 8.5}v7c0 1.1 2.2 2 5 2s5-.9 5-2v-7`}
            className="stroke-muted-foreground"
          />
          <text
            x="238"
            y={y + 15}
            fontSize="8"
            className={dashed ? "fill-muted-foreground" : "fill-foreground"}
          >
            {label}
          </text>
        </g>
      ))}
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

/** A field the browser refused, and a 422 the server sends back to another. */
export function ValidationIllustration() {
  return (
    <Frame>
      <text x="12" y="18" fontSize="7.5" className="fill-muted-foreground">
        BROWSER
      </text>
      <text
        x="308"
        y="18"
        fontSize="7.5"
        textAnchor="end"
        className="fill-muted-foreground"
      >
        SERVER
      </text>

      {/* Refused in the browser */}
      <text x="12" y="34" fontSize="8" className="fill-foreground">
        email
      </text>
      <rect
        x="12"
        y="39"
        width="150"
        height="22"
        rx="6"
        className="fill-background stroke-destructive"
      />
      <text x="20" y="53" fontSize="8.5" className="fill-muted-foreground">
        ana@
      </text>
      <text x="12" y="72" fontSize="7.5" className="fill-destructive">
        ✕ not a valid email
      </text>

      {/* Refused by the server, and put back here */}
      <text x="12" y="92" fontSize="8" className="fill-foreground">
        slug
      </text>
      <rect
        x="12"
        y="97"
        width="150"
        height="22"
        rx="6"
        className="fill-background stroke-destructive"
      />
      <text x="20" y="111" fontSize="8.5" className="fill-muted-foreground">
        hello-world
      </text>
      <text x="12" y="130" fontSize="7.5" className="fill-destructive">
        ✕ already taken
      </text>

      {/* The server's answer */}
      <rect
        x="226"
        y="30"
        width="82"
        height="66"
        rx="8"
        className="fill-background stroke-border"
      />
      <rect
        x="234"
        y="38"
        width="30"
        height="14"
        rx="4"
        className="fill-destructive/15"
      />
      <text
        x="249"
        y="48"
        fontSize="8.5"
        textAnchor="middle"
        className="fill-destructive"
      >
        422
      </text>
      <text x="234" y="66" fontSize="7.5" className="fill-muted-foreground">
        violations:
      </text>
      <text x="240" y="78" fontSize="7.5" className="fill-foreground">
        slug → taken
      </text>

      {/* POST out, 422 back onto the slug field */}
      <path d="M170 50h48" className="stroke-muted-foreground/60" />
      <path d="M214 46.5l4 3.5-4 3.5" className="stroke-muted-foreground/60" />
      <text
        x="194"
        y="45"
        fontSize="7"
        textAnchor="middle"
        className="fill-muted-foreground"
      >
        POST
      </text>
      <path
        d="M267 96C267 118 220 108 170 108"
        className="feature-flow stroke-primary"
        strokeDasharray="4 4"
      />
      <path d="M174 104.5l-4 3.5 4 3.5" className="stroke-primary" />
      <text
        x="232"
        y="126"
        fontSize="7"
        textAnchor="middle"
        className="fill-primary"
      >
        mapper
      </text>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

/** One dictionary, read by the application and by both libraries. */
export function DictionaryIllustration() {
  return (
    <Frame>
      {/* The dictionary */}
      <rect
        x="118"
        y="18"
        width="84"
        height="114"
        rx="8"
        className="fill-background stroke-primary"
      />
      <rect x="126" y="26" width="30" height="14" rx="4" className="fill-primary" />
      <text
        x="141"
        y="36"
        fontSize="8"
        textAnchor="middle"
        className="fill-primary-foreground"
      >
        FR
      </text>
      <rect x="160" y="26" width="30" height="14" rx="4" className="stroke-border" />
      <text
        x="175"
        y="36"
        fontSize="8"
        textAnchor="middle"
        className="fill-muted-foreground"
      >
        EN
      </text>
      {["save", "cancel", "next", "search", "filter"].map((key, index) => (
        <g key={key}>
          <text
            x="128"
            y={58 + index * 15}
            fontSize="8"
            className="fill-muted-foreground"
          >
            {key}
          </text>
          <rect
            x="164"
            y={53 + index * 15}
            width={28 - (index % 3) * 6}
            height="4"
            rx="2"
            className="fill-primary/40"
          />
        </g>
      ))}

      {/* The application */}
      <text x="12" y="38" fontSize="7.5" className="fill-muted-foreground">
        YOUR APP
      </text>
      <rect
        x="12"
        y="44"
        width="86"
        height="72"
        rx="8"
        className="fill-background stroke-border"
      />
      <rect
        x="20"
        y="54"
        width="46"
        height="4"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect
        x="20"
        y="64"
        width="62"
        height="4"
        rx="2"
        className="fill-muted-foreground/30"
      />
      <rect x="20" y="90" width="70" height="18" rx="5" className="fill-primary" />
      <text
        x="55"
        y="102"
        fontSize="8"
        textAnchor="middle"
        className="fill-primary-foreground"
      >
        Enregistrer
      </text>

      {/* The libraries */}
      <text
        x="308"
        y="38"
        fontSize="7.5"
        textAnchor="end"
        className="fill-muted-foreground"
      >
        LIBRARIES
      </text>
      <rect
        x="222"
        y="44"
        width="86"
        height="72"
        rx="8"
        className="fill-background stroke-border"
      />
      <rect x="230" y="52" width="70" height="16" rx="5" className="stroke-border" />
      <text x="238" y="63" fontSize="8" className="fill-muted-foreground">
        Rechercher…
      </text>
      <rect x="230" y="74" width="70" height="16" rx="5" className="stroke-border" />
      <text
        x="265"
        y="85"
        fontSize="8"
        textAnchor="middle"
        className="fill-foreground"
      >
        Suivant
      </text>
      <rect x="230" y="94" width="70" height="16" rx="5" className="stroke-border" />
      <text
        x="265"
        y="105"
        fontSize="8"
        textAnchor="middle"
        className="fill-foreground"
      >
        Annuler
      </text>

      {/* Read from the same place */}
      <path d="M118 80h-16" className="stroke-primary" />
      <path d="M106 76.5l-4 3.5 4 3.5" className="stroke-primary" />
      <path d="M202 80h16" className="stroke-primary" />
      <path d="M214 76.5l4 3.5-4 3.5" className="stroke-primary" />
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */

/** The same records seven ways, and an eighth left for the application. */
export function LayoutsIllustration() {
  const glyph = "fill-muted-foreground/35"
  const line = "stroke-muted-foreground/60"
  const layouts: { label: string; draw: ReactNode }[] = [
    {
      label: "table",
      draw: (
        <>
          <rect x="0" y="0" width="48" height="5" rx="1.5" className={glyph} />
          <path d="M0 11h48M0 18h48M0 25h48M16 6v22M32 6v22" className={line} />
        </>
      ),
    },
    {
      label: "cards",
      draw: (
        <>
          <rect x="0" y="0" width="22" height="12" rx="2" className={glyph} />
          <rect x="26" y="0" width="22" height="12" rx="2" className={glyph} />
          <rect x="0" y="16" width="22" height="12" rx="2" className={glyph} />
          <rect x="26" y="16" width="22" height="12" rx="2" className={glyph} />
        </>
      ),
    },
    {
      label: "list",
      draw: (
        <>
          {[2, 11, 20].map((y) => (
            <g key={y}>
              <circle cx="3" cy={y + 2} r="2.5" className={glyph} />
              <rect x="9" y={y} width="39" height="4" rx="2" className={glyph} />
            </g>
          ))}
        </>
      ),
    },
    {
      label: "columns",
      draw: (
        <>
          {[0, 17, 34].map((x, index) => (
            <g key={x}>
              <rect x={x} y="0" width="14" height="28" rx="2" className={line} />
              <rect
                x={x + 2}
                y="3"
                width="10"
                height="6"
                rx="1.5"
                className={glyph}
              />
              {index !== 2 && (
                <rect
                  x={x + 2}
                  y="12"
                  width="10"
                  height="6"
                  rx="1.5"
                  className={glyph}
                />
              )}
            </g>
          ))}
        </>
      ),
    },
    {
      label: "split",
      draw: (
        <>
          <rect x="0" y="0" width="18" height="28" rx="2" className={line} />
          <path d="M3 6h12M3 13h12M3 20h12" className={line} />
          <rect x="22" y="0" width="26" height="28" rx="2" className={glyph} />
        </>
      ),
    },
    {
      label: "calendar",
      draw: (
        <>
          <rect x="0" y="0" width="48" height="28" rx="2" className={line} />
          <path d="M0 9.3h48M0 18.6h48M12 0v28M24 0v28M36 0v28" className={line} />
          <rect x="13.5" y="11" width="21" height="6" rx="1.5" className={glyph} />
        </>
      ),
    },
    {
      label: "timeline",
      draw: (
        <>
          <path d="M0 27h48" className={line} />
          <rect x="0" y="1" width="20" height="5" rx="2.5" className={glyph} />
          <rect x="12" y="9" width="24" height="5" rx="2.5" className={glyph} />
          <rect x="26" y="17" width="22" height="5" rx="2.5" className={glyph} />
        </>
      ),
    },
  ]

  return (
    <Frame>
      {layouts.map(({ label, draw }, index) => {
        const x = 12 + (index % 4) * 76
        const y = 14 + Math.floor(index / 4) * 66
        return (
          <g key={label} transform={`translate(${x} ${y})`}>
            <rect
              width="68"
              height="56"
              rx="7"
              className="fill-background stroke-border"
            />
            {/* The one the reader has picked; it moves on, one layout a beat. */}
            <rect
              width="68"
              height="56"
              rx="7"
              className="feature-layout-pick fill-primary/10 stroke-primary"
              data-resting={index === 0 || undefined}
              style={{ animationDelay: `${index - layouts.length}s` }}
            />
            <g transform="translate(10 8)">{draw}</g>
            <text
              x="34"
              y="49"
              fontSize="7.5"
              textAnchor="middle"
              className="fill-muted-foreground"
            >
              {label}
            </text>
          </g>
        )
      })}

      <g transform="translate(240 80)">
        <rect
          width="68"
          height="56"
          rx="7"
          className="stroke-primary/70"
          strokeDasharray="3 3"
        />
        <path d="M34 17v12M28 23h12" className="stroke-primary" />
        <text
          x="34"
          y="49"
          fontSize="7.5"
          textAnchor="middle"
          className="fill-primary"
        >
          yours
        </text>
      </g>
    </Frame>
  )
}
