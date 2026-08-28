import { createFileRoute } from "@tanstack/react-router"
import {
  ArrayInputController,
  FormInputController,
  NumberInputController,
  PriceInputController,
  SelectInputController,
} from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { FormDemo } from "@/components/FormDemo"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/form/nested")({
  head: () => ({
    meta: [
      { title: "Nested forms and arrays — react-data-form" },
      {
        name: "description",
        content:
          "Sub-forms, repeatable rows and the page-builder controller: describing a payload that is not flat.",
      },
    ],
  }),
  component: Nested,
})

const SUBFORM = `inputs: {
  name: { label: "Customer" },
  address: {
    label: "Billing address",
    // A field carrying \`form\` is rendered as a sub-form…
    form: {
      inputs: {
        street: { label: "Street" },
        city: { label: "City" },
        zip: { label: "Postcode" },
      },
    },
  },
}
// → { name: "…", address: { street: "…", city: "…", zip: "…" } }`

const LAZY = `inputs: {
  child: {
    label: "Reply",
    // Resolved on render, so a shape can refer to itself.
    getForm: () => commentForm,
  },
}`

const BUILDER = `import { addForm, createFormArrayInputController } from "react-data-form"

// 1. Register the block types. \`@for\` is the tag the palette filters on.
addForm("block.hero", {
  name: "Hero",
  "@for": ["page-block"],
  inputs: {
    title: { label: "Title" },
    subtitle: { label: "Subtitle" },
  },
})

addForm("block.gallery", {
  name: "Gallery",
  "@for": ["page-block"],
  inputs: { images: { label: "Images", controller: FileInputController } },
})

// 2. One field holds the whole page.
inputs: {
  blocks: createFormArrayInputController({
    label: "Content",
    forms: ["page-block"], // the palette offered on “Add”
    draggable: true,
  }),
}`

function Nested() {
  return (
    <DocArticle
      toc={[
        { id: "subform", title: "A field that is a form" },
        { id: "lazy", title: "Recursive shapes" },
        { id: "arrays", title: "Repeating a scalar" },
        { id: "builder", title: "The page builder" },
        { id: "gotchas", title: "Things worth knowing" },
      ]}
    >
      <P>
        Most payloads are not flat. Three mechanisms cover the shapes that come up: a
        field that is itself a form, a field holding a list of scalars, and a field
        holding a list of forms.
      </P>

      <H2 id="subform">A field that is a form</H2>

      <P>
        Give a field a <C>form</C> key and it renders as a sub-form. Its values are
        submitted as a nested object under the field's name — no flattening, no
        naming convention.
      </P>

      <CodeBlock>{SUBFORM}</CodeBlock>

      <Demo label="A nested address — submit and read the payload" code={SUBFORM}>
        <FormDemo
          form={{
            label: { title: "Invoice", submit: "Save" },
            inputs: {
              customer: { label: "Customer", required: true },
              amount: { label: "Amount", controller: PriceInputController },
              address: {
                label: "Billing address",
                controller: FormInputController,
                form: {
                  inputs: {
                    street: { label: "Street" },
                    city: { label: "City" },
                    zip: { label: "Postcode" },
                    country: {
                      label: "Country",
                      controller: SelectInputController,
                      valueOptions: [
                        { label: "France", value: "FR" },
                        { label: "Spain", value: "ES" },
                      ],
                    },
                  },
                },
              },
            },
          }}
        />
      </Demo>

      <Callout
        kind="note"
        title="The controller is implicit, but naming it is clearer"
      >
        <P>
          A field carrying <C>form</C> falls through to <C>FormInputController</C>.
          Naming it explicitly, as above, costs one line and makes the intent obvious
          to the next reader.
        </P>
      </Callout>

      <H2 id="lazy">Recursive shapes</H2>

      <P>
        <C>form</C> is evaluated when the description is written, which cannot work
        for a shape that refers to itself — a comment with replies, a category with
        children. <C>getForm</C> is the lazy version.
      </P>

      <CodeBlock>{LAZY}</CodeBlock>

      <H2 id="arrays">Repeating a scalar</H2>

      <P>
        For a list of plain values — tags, aliases, email addresses —{" "}
        <C>ArrayInputController</C> is enough. It submits an array of strings, and{" "}
        <C>min</C> and <C>max</C> bound its length.
      </P>

      <Demo
        label="Type a tag and press Enter"
        code={`inputs: {
  tags: { label: "Tags", controller: ArrayInputController, max: 5 },
}`}
      >
        <FormDemo
          form={{
            label: { title: "Metadata" },
            inputs: {
              tags: {
                label: "Tags",
                controller: ArrayInputController,
                max: 5,
                description: "Up to five. Enter adds one.",
              },
              priority: {
                label: "Priority",
                controller: NumberInputController,
                min: 1,
                max: 5,
              },
            },
          }}
        />
      </Demo>

      <H2 id="builder">The page builder</H2>

      <P>
        <C>FormArrayInputController</C> holds a list of <em>forms</em>: the reader
        adds blocks from a palette, fills each one, and reorders them. That is a page
        builder, and it is about fifteen lines of description.
      </P>

      <CodeBlock filename="pageForm.ts">{BUILDER}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "forms",
            type: "string[]",
            description: (
              <>
                Which registered forms the palette offers, by their <C>@for</C> tag.
                An empty array offers every registered form; omitting the key adds a
                blank block based on <C>form</C> instead.
              </>
            ),
          },
          {
            name: "draggable",
            type: "boolean",
            description: "Lets the reader reorder the blocks by dragging.",
          },
          {
            name: "identifierKey",
            type: "string",
            default: `"order"`,
            description: "The key the ordering is written to on each block.",
          },
          {
            name: "form",
            type: "FormInterface",
            description:
              "The single block shape, when there is no palette to choose from.",
          },
        ]}
      />

      <P>
        The palette is fed by the <A href="/docs/form/registry">form registry</A>:{" "}
        <C>addForm</C> puts a form in it under an identifier, and the <C>@for</C>{" "}
        tags are how a builder selects the subset it accepts.
      </P>

      <H2 id="gotchas">Things worth knowing</H2>

      <Ul>
        <Li>
          <strong>A sub-form saves on change.</strong> <C>FormInputController</C>{" "}
          sets <C>saveOnChange</C> on the inner form, so its values reach the parent
          as they are typed rather than on an inner submit — there is only ever one
          submit button.
        </Li>
        <Li>
          <strong>Violations do not cascade.</strong> A validator on an inner field
          marks that field. Rules spanning the two levels belong in the outer form's
          own <C>validator</C>.
        </Li>
        <Li>
          <strong>The action is inherited.</strong> The sub-form is built with the
          parent's <C>action</C>, so a field marked create-only behaves the same at
          both levels.
        </Li>
      </Ul>
    </DocArticle>
  )
}
