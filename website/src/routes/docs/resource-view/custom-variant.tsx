import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Term, Ul } from "@/components/prose"
import { spotlightResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/custom-variant")({
  head: () => ({
    meta: [
      { title: "Create your own layout — react-resource-view" },
      {
        name: "description",
        content:
          "One command scaffolds a layout of your own: a single file, three components and a layout.custom() call, ready to sit beside the built-in layouts.",
      },
    ],
  }),
  component: CustomVariant,
})

const COMMAND = `npx react-resource-view create-view-variant Heatmap --dir src/views`

const BARE = `npx react-resource-view create-view-variant`

const SCAFFOLD = `// src/views/heatmapLayout.tsx — comments trimmed
import { Flame } from "lucide-react"
import {
  ItemRender,
  layout,
  ListPagination,
  ListResourceViewButton,
  useLayout,
  type ItemComponentPropsInterface,
  type LayoutOptions,
  type ListComponentPropsInterface,
  type RowComponentPropsInterface,
} from "react-resource-view"

export interface HeatmapOptions {
  dense?: boolean
}

/** One field of a record. */
export function HeatmapItem({ formInput }: ItemComponentPropsInterface) {
  if (!formInput) return null

  return <>{ItemRender(formInput.value)}</>
}

/** One record. */
export function HeatmapRow({ row }: RowComponentPropsInterface) {
  const data = row?.data ?? {}
  const fields = Object.entries(data).filter(
    ([key]) => !key.startsWith("@") && key !== "id"
  )

  return (
    <div className="min-w-0 space-y-1">
      {fields.map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-muted-foreground">{key}</span>
          <div className="min-w-0 [&_p]:mt-0">
            <HeatmapItem formInput={{ name: key, value }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** The whole collection. */
export function HeatmapList({ rows = [] }: ListComponentPropsInterface) {
  const { dense = false } = useLayout<HeatmapOptions>().options

  return (
    <div className="w-full">
      <ul className={dense ? "space-y-1" : "space-y-3"}>
        {rows.map((row, index) => (
          <li key={"row-" + index} className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <HeatmapRow row={row} />
            </div>
            <ListResourceViewButton data={row.data} />
          </li>
        ))}
      </ul>
      <ListPagination />
    </div>
  )
}

export default function heatmapLayout(
  { dense = false, components, ...options }: LayoutOptions & HeatmapOptions = {}
) {
  return layout.custom({
    type: "heatmap",
    label: "Heatmap",
    icon: Flame,
    ...options,
    components: {
      list: HeatmapList,
      row: HeatmapRow,
      item: HeatmapItem,
      ...components,
    },
    options: { dense },
  })
}`

const DECLARING = `import { layout } from "react-resource-view"
import heatmapLayout from "./views/heatmapLayout"

form: articleForm,
views: {
  list: {
    layouts: [
      heatmapLayout(), // the default: the first one listed
      layout.table(),
    ],
  },
}`

const OPTIONS = `// Its own options travel to the components…
layouts: [heatmapLayout({ dense: true, fields: ["title", "status"] })]

// …and are read back with useLayout(), inside any of the three.
const { dense = false } = useLayout<HeatmapOptions>().options`

const RENAMING = `heatmapLayout()                                    // id: "heatmap"
heatmapLayout({ label: "Compact" })                // id: "heatmap" still
heatmapLayout({ id: "compact", label: "Compact" }) // id: "compact"`

function CustomVariant() {
  return (
    <DocArticle
      toc={[
        { id: "command", title: "One command" },
        { id: "written", title: "What it writes" },
        { id: "slots", title: "The three slots" },
        { id: "declaring", title: "Declaring it" },
        { id: "options", title: "Options of your own" },
        { id: "by-hand", title: "Without the command" },
      ]}
    >
      <P>
        The <A href="/docs/resource-view/layouts">seven layouts</A> that ship with
        the package answer the usual questions about a collection. The eighth is
        yours — a heatmap, a map, a gallery, whatever your records actually look
        like — and it is one file: three components and a{" "}
        <C>layout.custom()</C> call.
      </P>

      <P>Rather than copy that file from this page, have the command write it.</P>

      <H2 id="command">One command</H2>

      <CodeBlock lang="bash">{COMMAND}</CodeBlock>

      <P>
        Nothing is installed and nothing is configured: the command ships with the
        package, writes one file, and prints how to declare it. Run it bare and it
        asks for what it needs — the name, then where the file goes, offering the
        first of <C>src/views</C>, <C>src/components</C> or the current directory
        that exists:
      </P>

      <CodeBlock lang="bash">{BARE}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "name",
            type: "argument",
            default: "asked",
            description: (
              <>
                What the layout switcher shows — <C>Heatmap</C>,{" "}
                <C>"Kanban board"</C>. The file, the components and the type are all
                derived from it.
              </>
            ),
          },
          {
            name: "--dir, -d",
            type: "path",
            default: "asked",
            description: "Where the file goes. Created if it does not exist.",
          },
          {
            name: "--icon, -i",
            type: "string",
            default: "LayoutGrid",
            description: (
              <>
                A <C>lucide-react</C> icon name for the switcher tab.
              </>
            ),
          },
          {
            name: "--jsx",
            type: "flag",
            default: "—",
            description: "Write JavaScript rather than TypeScript.",
          },
          {
            name: "--force, -f",
            type: "flag",
            default: "—",
            description: "Overwrite the file if it is already there.",
          },
          {
            name: "--dry-run",
            type: "flag",
            default: "—",
            description: "Print the file instead of writing it.",
          },
          {
            name: "--yes, -y",
            type: "flag",
            default: "—",
            description:
              "Never ask: take the defaults for whatever was not passed. What a script wants.",
          },
        ]}
      />

      <H2 id="written">What it writes</H2>

      <P>
        One file, importing nothing but the package and an icon. It runs as it
        lands — the point is that you then delete what it drew and draw your own:
      </P>

      <CodeBlock filename="src/views/heatmapLayout.tsx">{SCAFFOLD}</CodeBlock>

      <H2 id="slots">The three slots</H2>

      <P>
        A <Term id="view-variant">layout</Term> draws a list through three
        components, given in <C>components</C>:
      </P>

      <Ul>
        <Li>
          <C>list</C> draws the collection. It receives <C>rows</C> — the
          current page, filtered and paginated.
        </Li>
        <Li>
          <C>row</C> draws one record. It receives <C>row</C>, whose{" "}
          <C>data</C> is the record as the API answered it.
        </Li>
        <Li>
          <C>item</C> draws one field. It receives <C>formInput</C>, and{" "}
          <C>ItemRender</C> is the package's own renderer for a value — booleans,
          relations, arrays and objects included.
        </Li>
      </Ul>

      <P>
        Everything else is one hook away: <C>useLayout</C> gives the layout and its
        own options, <C>useCurrentViewResourceContext</C> the{" "}
        <Term id="resource">resource</Term>, the loading state, the filters, the
        selection and the <Term id="view">view</Term> itself, and <C>useList</C> the
        rows with the mutations that go with them.
      </P>

      <H2 id="declaring">Declaring it</H2>

      <P>
        A scaffolded layout is declared exactly like a built-in one — it is the same
        kind of object:
      </P>

      <CodeBlock>{DECLARING}</CodeBlock>

      <P>
        The list below runs a layout this command wrote. The file was not touched
        afterwards, which is why it draws every field it finds: switch to the table
        to see the same records through a layout that ships with the package.
      </P>

      <Demo label="A scaffolded layout, beside the table" code={SCAFFOLD} wide>
        <ResourceDemo resource={spotlightResource} variant="spotlight" />
      </Demo>

      <H2 id="options">Options of your own</H2>

      <P>
        The generated function takes <C>LayoutOptions</C> — what every layout
        accepts: <C>id</C>, <C>label</C>, <C>icon</C>, <C>fields</C>,{" "}
        <C>form</C>, <C>fullWidth</C>, <C>components</C> — and whatever you add to
        its options interface. The <C>dense</C> option in the scaffold is there to
        be replaced:
      </P>

      <CodeBlock>{OPTIONS}</CodeBlock>

      <Callout kind="note" title="The type is the id">
        <P>
          A layout is identified by its <C>type</C>, and that id is what travels in
          the URL — a new <C>label</C> breaks no shared link. Pass an <C>id</C> when
          the same layout appears twice in one <C>layouts</C>.
        </P>
        <CodeBlock>{RENAMING}</CodeBlock>
      </Callout>

      <H2 id="by-hand">Without the command</H2>

      <P>
        There is no registration step and no plugin: the command saves you the
        typing, nothing more. A layout written by hand is a{" "}
        <C>layout.custom({"{"} type, components {"}"})</C> call with the components
        you already have, and the{" "}
        <A href="/docs/resource-view/layouts">layouts page</A> covers what every
        layout shares with the seven built-in ones.
      </P>
    </DocArticle>
  )
}
