import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, Li, P, Ul } from "@/components/prose"
import { spotlightResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/custom-variant")({
  head: () => ({
    meta: [
      { title: "Create your own view variant — react-resource-view" },
      {
        name: "description",
        content:
          "One command scaffolds a layout of your own: a single file, three components and a factory, ready to sit beside the built-in variants.",
      },
    ],
  }),
  component: CustomVariant,
})

const COMMAND = `npx react-resource-view create-view-variant Heatmap --dir src/views`

const BARE = `npx react-resource-view create-view-variant`

const SCAFFOLD = `// src/views/heatmapViewFactory.tsx — comments trimmed
import { Flame } from "lucide-react"
import {
  createView,
  ItemRender,
  ListPagination,
  ListResourceViewButton,
  useCurrentViewResourceContext,
  type ItemComponentPropsInterface,
  type ListComponentPropsInterface,
  type RowComponentPropsInterface,
  type ViewInterface,
} from "react-resource-view"

export interface HeatmapViewInterface extends ViewInterface {
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
  const view = useCurrentViewResourceContext().view as HeatmapViewInterface
  const dense = view?.dense ?? false

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

export default function heatmapViewFactory(
  args?: Partial<HeatmapViewInterface>
): HeatmapViewInterface {
  const defaultArgs: Partial<HeatmapViewInterface> = { dense: false, ...args }

  return createView({
    name: "Heatmap",
    icon: Flame,
    listComponent: HeatmapList,
    rowComponent: HeatmapRow,
    itemComponent: HeatmapItem,
    ...defaultArgs,
  })
}`

const DECLARING = `import { tableViewOptionFactory } from "react-resource-view"
import heatmapViewFactory from "./views/heatmapViewFactory"

view: {
  form: articleForm,
  viewVariants: [
    heatmapViewFactory(),      // the default: the first one listed
    tableViewOptionFactory(),
  ],
}`

const OPTIONS = `// Anything the interface declares travels to the components…
viewVariants: [heatmapViewFactory({ dense: true, itemsPerPage: 50 })]

// …and is read back from the view, inside any of the three.
const view = useCurrentViewResourceContext().view as HeatmapViewInterface
const dense = view?.dense ?? false`

const RENAMING = `heatmapViewFactory()                     // id: "heatmap"
heatmapViewFactory({ name: "Compact" })  // id: "compact"`

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
        like — and it is one file: three components and a factory over{" "}
        <C>createView</C>.
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
                <C>"Kanban board"</C>. The file, the components and the id are all
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

      <CodeBlock filename="src/views/heatmapViewFactory.tsx">{SCAFFOLD}</CodeBlock>

      <H2 id="slots">The three slots</H2>

      <P>A variant is a view, and a view renders through three components:</P>

      <Ul>
        <Li>
          <C>listComponent</C> draws the collection. It receives <C>rows</C> — the
          current page, filtered and paginated.
        </Li>
        <Li>
          <C>rowComponent</C> draws one record. It receives <C>row</C>, whose{" "}
          <C>data</C> is the record as the API answered it.
        </Li>
        <Li>
          <C>itemComponent</C> draws one field. It receives <C>formInput</C>, and{" "}
          <C>ItemRender</C> is the package's own renderer for a value — booleans,
          relations, arrays and objects included.
        </Li>
      </Ul>

      <P>
        Everything else is one hook away: <C>useCurrentViewResourceContext</C> gives
        the resource, the loading state, the filters, the selection and the view
        itself, and <C>useList</C> gives the rows with the mutations that go with
        them.
      </P>

      <H2 id="declaring">Declaring it</H2>

      <P>
        A scaffolded variant is declared exactly like a built-in one — it is the
        same kind of object:
      </P>

      <CodeBlock>{DECLARING}</CodeBlock>

      <P>
        The list below runs a variant this command wrote. The file was not touched
        afterwards, which is why it draws every field it finds: switch to the table
        to see the same records through a layout that ships with the package.
      </P>

      <Demo label="A scaffolded layout, beside the table" code={SCAFFOLD} wide>
        <ResourceDemo resource={spotlightResource} variant="spotlight" />
      </Demo>

      <H2 id="options">Options of your own</H2>

      <P>
        The generated interface extends <C>ViewInterface</C>, so a variant of yours
        takes both what a view accepts — <C>form</C>, <C>itemsPerPage</C>,{" "}
        <C>behavior</C>, <C>components</C> — and whatever you add to it. The{" "}
        <C>dense</C> option in the scaffold is there to be replaced:
      </P>

      <CodeBlock>{OPTIONS}</CodeBlock>

      <Callout kind="note" title="The name is the id">
        <P>
          A variant is identified by the slug of its name, and that id is what
          travels in the URL. Pass a <C>name</C> to change it — which you have to do
          when the same factory appears twice in one <C>viewVariants</C>.
        </P>
        <CodeBlock>{RENAMING}</CodeBlock>
      </Callout>

      <H2 id="by-hand">Without the command</H2>

      <P>
        There is no registration step and no plugin: the command saves you the
        typing, nothing more. A variant written by hand is a <C>createView</C> call
        with the components you already have, and the{" "}
        <A href="/docs/resource-view/layouts">layouts page</A> covers what every
        variant shares with the seven built-in ones.
      </P>
    </DocArticle>
  )
}
