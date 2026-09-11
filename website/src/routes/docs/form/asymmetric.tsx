import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Ul } from "@/components/prose"
import { BuilderStudio } from "@/demo/builder/BuilderStudio"
import { BUILDER_KITS } from "@/demo/builder/kits"

export const Route = createFileRoute("/docs/form/asymmetric")({
  head: () => ({
    meta: [
      { title: "Asymmetric forms — react-data-form" },
      {
        name: "description",
        content:
          "Page builders and résumés: describing a form whose fields are not known in advance, because the content decides them — a palette of block types, one array field, and a payload of typed objects.",
      },
    ],
  }),
  component: Asymmetric,
})

const SYMMETRIC = `// Symmetric: five fields, always the same five, in the same order.
const contactForm = {
  inputs: {
    name: { label: "Name", required: true },
    email: { label: "Email", controller: EmailInputController },
    subject: { label: "Subject" },
    message: { label: "Message", controller: TextAreaInputController },
    consent: { label: "Keep me posted", controller: SwitchInputController },
  },
}`

const BLOCKS = `import {
  addForm,
  SelectInputController,
  WysiwygInputController,
} from "react-data-form"
import { AlignLeft, Sparkles } from "lucide-react"

// The first tag identifies the block: it is stored on the item as \`type\`, and
// it is what resolves that item back to this form. The tags after it classify
// it — "page-block" is the one the palette selects on.
addForm("page.hero", {
  name: "Hero",
  icon: Sparkles,
  "@for": ["page.hero", "page-block"],
  inputs: {
    title: { label: "Title", required: true },
    subtitle: { label: "Subtitle" },
    image: {
      label: "Backdrop",
      controller: SelectInputController,
      valueOptions: MEDIA_LIBRARY,
    },
  },
})

addForm("page.text", {
  name: "Text",
  icon: AlignLeft,
  "@for": ["page.text", "page-block"],
  inputs: {
    title: { label: "Heading" },
    body: { label: "Body", controller: WysiwygInputController },
  },
})`

const FIELD = `import { createFormArrayInputController } from "react-data-form"

const pageForm = {
  label: { title: "Landing page", submit: "Publish" },
  inputs: {
    blocks: createFormArrayInputController({
      label: "Content",
      // The palette: every form carrying that tag, and nothing else.
      forms: ["page-block"],
      draggable: true,
    }),
  },
}`

const PAYLOAD = `{
  "blocks": [
    {
      "id": "k3f9",
      "type": "page.hero",
      "order": 0,
      "title": "Coffee, from the farm to your kitchen",
      "image": "sunrise"
    },
    {
      "id": "p1a2",
      "type": "page.text",
      "order": 1,
      "title": "What we do",
      "body": "<p>We roast in small batches…</p>"
    }
  ]
}`

const RENDER = `function Block({ block }: { block: BuilderBlock }) {
  switch (block.type) {
    case "page.hero":
      return <Hero block={block} />
    case "page.text":
      return <Text block={block} />
    case "page.gallery":
      return <Gallery block={block} />
    default:
      // A type the application does not draw yet: skipped, not crashed.
      return null
  }
}

export function Page({ blocks }: { blocks: BuilderBlock[] }) {
  return blocks.map((block) => <Block key={block.id} block={block} />)
}`

function Asymmetric() {
  return (
    <DocArticle
      toc={[
        { id: "what", title: "What makes it asymmetric" },
        { id: "where", title: "Where it comes up" },
        { id: "blocks", title: "Describing the blocks" },
        { id: "field", title: "The field that holds them" },
        { id: "demo", title: "The builder, running" },
        { id: "payload", title: "What comes out" },
        { id: "render", title: "Drawing the result" },
        { id: "gotchas", title: "Things worth knowing" },
      ]}
    >
      <P>
        Most forms are symmetric: the fields are known when the description is
        written, and every submission has the same shape as the last one. A contact
        form is five fields, an invoice is a customer and an address, and the
        description can list them.
      </P>

      <CodeBlock>{SYMMETRIC}</CodeBlock>

      <P>
        A page builder cannot be written that way. One page is a hero followed by two
        paragraphs; the next is a gallery, a quote and a button. The fields are not a
        property of the form — they are a property of what the reader decided to put
        on the page, two minutes ago, in an order nobody knew in advance. That is an{" "}
        <strong>asymmetric form</strong>: its shape is decided by its content.
      </P>

      <H2 id="what">What makes it asymmetric</H2>

      <P>
        Three things, and they always come together. The document is a <em>list</em>{" "}
        rather than a record. Its entries are of <em>different types</em>, each with
        its own fields. And the reader chooses which types, how many, and in which
        order.
      </P>

      <P>
        The library answers all three with one field. A block type is a form of its
        own, registered in the <A href="/docs/form/registry">form registry</A>; a
        single array field offers them as a palette, and holds whichever ones were
        picked. Nothing about the page is written down anywhere — only the vocabulary
        it can be written in.
      </P>

      <Callout kind="note" title="Not the same thing as one form per action">
        <P>
          The view package documents{" "}
          <A href="/docs/resource-view/forms">a form per action</A> — creating an
          article asking for two fields where editing it asks for six. That is a
          resource showing a different <em>face</em> per screen. This page is about a
          single form whose <em>content</em> has no fixed shape at all. The two
          compose, and neither implies the other.
        </P>
      </Callout>

      <H2 id="where">Where it comes up</H2>

      <Ul>
        <Li>
          <strong>Page builders.</strong> The case that names the feature: a
          marketing page assembled out of hero, text, image, gallery, quote and
          call-to-action blocks, by someone who will never open the codebase.
        </Li>
        <Li>
          <strong>Résumés.</strong> An identity, then a career of unequal length,
          then diplomas, then a wall of skills — four section types, repeated as
          often as a life required, in whatever order reads best.
        </Li>
        <Li>
          <strong>Catalogue sheets.</strong> A product whose specification depends on
          its category: a table of sizes for a shirt, a datasheet for a drill, an
          allergen list for a jar of jam.
        </Li>
        <Li>
          <strong>Anything with an editorial structure.</strong> Newsletters,
          questionnaires, course chapters, contract clauses. If the answer to "what
          are the fields?" is "it depends on the document", the form is asymmetric.
        </Li>
      </Ul>

      <H2 id="blocks">Describing the blocks</H2>

      <P>
        Each block type is an ordinary form description, handed to <C>addForm</C>{" "}
        under an identifier. What makes it a block is its <C>@for</C> tags, and the
        order of those tags matters.
      </P>

      <CodeBlock filename="blocks.ts">{BLOCKS}</CodeBlock>

      <Callout kind="danger" title="The first tag has to be unique">
        <P>
          <C>@for[0]</C> is what a block stores as its <C>type</C>, and what the
          registry resolves that <C>type</C> back through. Give every block the same
          first tag — <C>["page-block"]</C> alone, say — and every block on the page
          resolves to whichever form was registered first: one block type, repeated,
          whatever the reader picked.
        </P>
      </Callout>

      <P>
        <C>name</C> is the label the palette and the block header show, and{" "}
        <C>icon</C> is the glyph above it. Both are optional; without them a block is
        announced by its identifier, which is nobody's idea of a nice palette.
      </P>

      <H2 id="field">The field that holds them</H2>

      <P>
        One field, of the whole document. <C>createFormArrayInputController</C>{" "}
        builds it: <C>forms</C> turns it into a palette, and <C>draggable</C> lets
        the reader reorder what they have added.
      </P>

      <CodeBlock filename="pageForm.ts">{FIELD}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "forms",
            type: "string[]",
            description: (
              <>
                The <C>@for</C> tags the palette offers. An explicit empty array
                offers every registered form; omitting the key drops the palette
                altogether and adds blank blocks based on <C>form</C>.
              </>
            ),
          },
          {
            name: "draggable",
            type: "boolean",
            description: "Adds the grip to each block header, and reorders on drop.",
          },
          {
            name: "identifierKey",
            type: "string",
            default: `"order"`,
            description:
              "The key the position is written to, and the one the list is sorted on.",
          },
          {
            name: "min",
            type: "number",
            description: "Refuses to add past that many blocks, with a message.",
          },
          {
            name: "form",
            type: "FormInterface",
            description:
              "The single block shape, for a repeater with no palette to choose from.",
          },
        ]}
      />

      <H2 id="demo">The builder, running</H2>

      <P>
        Two documents, one field. Add a block, drag it, type in it — and watch the
        result on the right redraw. Nothing below is written per block type except
        the drawing itself.
      </P>

      <Demo label="Three blocks to start with — add, reorder, type" wide>
        <BuilderStudio
          kit={BUILDER_KITS[0]}
          sample={BUILDER_KITS[0].sample.slice(0, 3)}
        />
      </Demo>

      <P>
        The same field, with <C>forms: ["resume-block"]</C> and four other block
        types registered, is a résumé editor:
      </P>

      <Demo label="An identity and a first position — the palette holds four" wide>
        <BuilderStudio
          kit={BUILDER_KITS[1]}
          sample={BUILDER_KITS[1].sample.slice(0, 2)}
        />
      </Demo>

      <P>
        Both run at full size, side by side, in the{" "}
        <A href="/playground/builder">playground</A>.
      </P>

      <H2 id="payload">What comes out</H2>

      <P>
        An array of plain objects, each carrying the fields of its own block type
        plus three keys the controller maintains: <C>id</C>, <C>type</C> and{" "}
        <C>order</C>.
      </P>

      <CodeBlock lang="json">{PAYLOAD}</CodeBlock>

      <P>
        That is the shape to store — one JSON column, or one API Platform sub
        resource. Read it back into the form as the field's value and the blocks come
        up as they were left, in the order <C>order</C> gives them.
      </P>

      <H2 id="render">Drawing the result</H2>

      <P>
        The library stops at the payload: it knows how to ask for a hero, not what a
        hero looks like. The half you write is a switch on <C>type</C>, which is also
        where the design system of the site belongs.
      </P>

      <CodeBlock filename="Page.tsx">{RENDER}</CodeBlock>

      <P>
        A <C>default</C> branch that returns nothing is worth keeping: a page saved
        against a block type that has since been retired then renders without it,
        instead of taking the page down.
      </P>

      <H2 id="gotchas">Things worth knowing</H2>

      <Ul>
        <Li>
          <strong>The registry is a singleton.</strong> <C>addForm</C> writes into
          it, so block types are registered once at module scope — registering the
          same block from two components offers it twice in the palette.
        </Li>
        <Li>
          <strong>Blocks save as they are typed.</strong> Each block is a sub-form,
          and a sub-form sets <C>saveOnChange</C>: values reach the array as they are
          entered, not on an inner submit. There is one submit button for the whole
          document.
        </Li>
        <Li>
          <strong>
            <C>order</C> is data, not position.
          </strong>{" "}
          The list is sorted on it, the header shows it, and dragging rewrites it
          across every block. Store it, or the page comes back shuffled.
        </Li>
        <Li>
          <strong>A block can nest.</strong> Nothing stops a block type from carrying
          an array field of its own — a section holding its own columns. The reader
          pays for it in depth, so it is worth being sure the document really is that
          deep.
        </Li>
      </Ul>

      <P>
        The mechanics of the array field — a field that is a form, a recursive shape,
        a list of plain scalars — are on{" "}
        <A href="/docs/form/nested">Nested forms &amp; arrays</A>.
      </P>
    </DocArticle>
  )
}
