import { createFileRoute } from "@tanstack/react-router"
import { NumberInputController, SelectInputController } from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { FormDemo } from "@/components/FormDemo"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, H3, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/form/fields")({
  head: () => ({
    meta: [
      { title: "Fields — react-data-form" },
      {
        name: "description",
        content:
          "Every key a field description accepts: label, type, controller, valueOptions, defaultValue, required, readonly, hidden, order and the rest.",
      },
    ],
  }),
  component: Fields,
})

const KEYED = `inputs: {
  // The key is the field's name, and the key of the submitted payload.
  emailAddress: { label: "Email", type: "email" },
}
// → onSubmit receives { emailAddress: "…" }`

const TYPES = `inputs: {
  name:     { label: "Name" },                     // text
  age:      { label: "Age", type: "number" },
  email:    { label: "Email", type: "email" },
  secret:   { label: "Password", type: "password" },
  agreed:   { label: "I agree", type: "checkbox" },
  internal: { type: "hidden" },                    // never rendered
}`

const OPTIONS = `import { valueOptionMapper, valueOptionFromArray } from "react-data-form"

// Written by hand
valueOptions: [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
]

// From a plain array
valueOptions: valueOptionFromArray(["S", "M", "L"])

// From records, naming the label and value keys
valueOptions: valueOptionMapper(authors, "name", "@id")

// Fetched, once, when the field first renders
getValueOptions: async () => valueOptionMapper(await api.authors(), "name", "@id")

// Fetched on every keystroke — for a search field
onSearch: async (query) => valueOptionMapper(await api.authors({ query }), "name", "@id")`

const CONDITIONAL = `inputs: {
  shipping: {
    label: "Shipping method",
    controller: SelectInputController,
    valueOptions: [
      { label: "Pickup", value: "pickup" },
      { label: "Delivery", value: "delivery" },
    ],
  },
  address: {
    label: "Delivery address",
    // Re-evaluated on every render, so it follows the field above.
    hidden: () => getFormInputInForm(form, "shipping")?.value !== "delivery",
  },
}`

const ORDER = `inputs: {
  reference: { label: "Reference", order: 30 },
  title:     { label: "Title", order: 10 },
  notes:     { label: "Notes", order: 20 },
}
// Rendered: Title, Notes, Reference.`

function Fields() {
  return (
    <DocArticle
      toc={[
        { id: "key", title: "The key is the name" },
        { id: "reference", title: "Every key of a field" },
        { id: "types", title: "type, without a controller" },
        { id: "options", title: "Choices" },
        { id: "conditional", title: "Showing a field conditionally" },
        { id: "order", title: "Ordering" },
        { id: "generated", title: "Generated values" },
      ]}
    >
      <H2 id="key">The key is the name</H2>

      <P>
        <C>inputs</C> is a record. Its keys are the field names, and they are the
        keys your <C>onSubmit</C> handler receives — there is no mapping step in
        between.
      </P>

      <CodeBlock>{KEYED}</CodeBlock>

      <H2 id="reference">Every key of a field</H2>

      <PropsTable
        rows={[
          {
            name: "label",
            type: "string | ReactNode | null",
            description: (
              <>
                Shown above the control. Passed through the translation dictionary.{" "}
                <C>null</C> renders no label at all.
              </>
            ),
          },
          {
            name: "description",
            type: "string | ReactNode",
            description: "Help text under the control.",
          },
          {
            name: "placeholder",
            type: "string",
            description: "Placeholder of the underlying input.",
          },
          {
            name: "type",
            type: `"text" | "email" | "number" | "password" | "checkbox" | "hidden" | …`,
            default: `"text"`,
            description: (
              <>
                Only read by <C>DefaultInputController</C>, which is what a field
                falls back to. <C>hidden</C> keeps the value out of the page.
              </>
            ),
          },
          {
            name: "controller",
            type: "FC<InputControllerInterface>",
            default: "DefaultInputController",
            description: "The component that renders the field.",
          },
          {
            name: "required",
            type: "boolean",
            description:
              "Marks the field as required and passes the attribute to the control.",
          },
          {
            name: "readonly",
            type: "boolean",
            description: (
              <>
                Changes are dropped by <C>useForm</C>, so the value cannot move even
                if a controller tries.
              </>
            ),
          },
          {
            name: "defaultValue",
            type: "Value | ((current) => Value)",
            description:
              "Applied when the form is built and no data carries the field.",
          },
          {
            name: "value",
            type: "Value",
            description:
              "The current value. Normally the library's to set, not yours.",
          },
          {
            name: "valueOptions",
            type: "ValueOptionInterface[]",
            description: "Static choices, for any of the select-like controllers.",
          },
          {
            name: "getValueOptions",
            type: "(input?) => Promise<ValueOptionInterface[]>",
            description: "Choices fetched once, when the field first renders.",
          },
          {
            name: "onSearch",
            type: "(query, formContext?) => Promise<ValueOptionInterface[]>",
            description:
              "Choices fetched per keystroke — the search and autocomplete controllers.",
          },
          {
            name: "validator",
            type: "(value: Value) => Value | never",
            description: (
              <>
                Throws to reject. Zod errors are unpacked into one violation per
                issue. See <A href="/docs/form/validation">Validation</A>.
              </>
            ),
          },
          {
            name: "violations",
            type: "ViolationInterface[]",
            description:
              "Errors currently attached to the field, from a validator or from your API.",
          },
          {
            name: "hidden",
            type: "() => boolean",
            description:
              "Re-evaluated on render, so a field can appear as another one changes.",
          },
          {
            name: "order",
            type: "number",
            description:
              "Ascending. Fields without one keep their declaration order.",
          },
          {
            name: "groups",
            type: "string[]",
            description: (
              <>
                Which sections the field belongs to. See{" "}
                <A href="/docs/form/groups">Groups</A> and{" "}
                <A href="/docs/form/steps">Steps</A>.
              </>
            ),
          },
          {
            name: "form",
            type: "FormInterface",
            description: (
              <>
                Renders the field as a nested sub-form. See{" "}
                <A href="/docs/form/nested">Nested forms</A>.
              </>
            ),
          },
          {
            name: "getForm",
            type: "() => FormInterface",
            description:
              "The same, resolved lazily — for a recursive or self-referencing shape.",
          },
          {
            name: "generatedValue",
            type: "boolean",
            description:
              "Excluded from validation and from the table's columns. For values injected by context.",
          },
          {
            name: "min / max",
            type: "number",
            description: "Bounds, read by the number, slider and date controllers.",
          },
          {
            name: "components.decorator",
            type: "FC<BaseDecoratorFormInputInterface>",
            description: "Replaces the wrapper around this one field.",
          },
        ]}
      />

      <H2 id="types">type, without a controller</H2>

      <P>
        A field with no <C>controller</C> falls back to <C>DefaultInputController</C>
        , an HTML <C>&lt;input&gt;</C> driven by its <C>type</C>. That covers the
        ordinary cases with no imports at all.
      </P>

      <CodeBlock>{TYPES}</CodeBlock>

      <Demo
        label="Plain types, no controllers"
        code={`useForm({
  form: {
    label: { title: "Account" },
    inputs: {
      name: { label: "Name", required: true },
      age: { label: "Age", type: "number" },
      email: { label: "Email", type: "email" },
      secret: { label: "Password", type: "password" },
      agreed: { label: "I agree to the terms", type: "checkbox" },
    },
  },
})`}
      >
        <FormDemo
          form={{
            label: { title: "Account" },
            inputs: {
              name: { label: "Name", required: true },
              age: { label: "Age", type: "number" },
              email: { label: "Email", type: "email" },
              secret: { label: "Password", type: "password" },
              agreed: { label: "I agree to the terms", type: "checkbox" },
            },
          }}
        />
      </Demo>

      <H2 id="options">Choices</H2>

      <P>
        Every select-like controller reads the same shape — a list of{" "}
        <C>{"{ label, value }"}</C> — from one of three keys, depending on when the
        choices are known.
      </P>

      <CodeBlock>{OPTIONS}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "label",
            type: "string | ReactNode",
            required: true,
            description: "What the reader sees.",
          },
          {
            name: "value",
            type: "string | number | boolean",
            required: true,
            description: "What ends up in the payload.",
          },
          {
            name: "description",
            type: "string",
            description:
              "A second line, rendered by the card and radio controllers.",
          },
          {
            name: "group",
            type: "string",
            description: "Groups options under a heading in the dropdown.",
          },
          {
            name: "aliases",
            type: "string[]",
            description: "Extra terms the option matches when searching.",
          },
          {
            name: "original",
            type: "T",
            description: (
              <>
                The record the option was built from — <C>valueOptionMapper</C> keeps
                it, so a custom item component can read the rest of it.
              </>
            ),
          },
        ]}
      />

      <Demo
        label="Static options"
        code={`inputs: {
  size: {
    label: "Size",
    controller: SelectInputController,
    valueOptions: valueOptionFromArray(["S", "M", "L", "XL"]),
  },
  quantity: { label: "Quantity", controller: NumberInputController, min: 1 },
}`}
      >
        <FormDemo
          form={{
            label: { title: "Order" },
            inputs: {
              size: {
                label: "Size",
                controller: SelectInputController,
                valueOptions: [
                  { label: "S", value: "S" },
                  { label: "M", value: "M" },
                  { label: "L", value: "L" },
                  { label: "XL", value: "XL" },
                ],
              },
              quantity: {
                label: "Quantity",
                controller: NumberInputController,
                min: 1,
                defaultValue: 1,
              },
            },
          }}
        />
      </Demo>

      <H2 id="conditional">Showing a field conditionally</H2>

      <P>
        <C>hidden</C> is a function, not a boolean, and it is called on every render.
        That is what lets one field depend on another without any subscription
        mechanism.
      </P>

      <CodeBlock>{CONDITIONAL}</CodeBlock>

      <Callout kind="note" title="Hidden is not absent">
        <P>
          A hidden field keeps its value and still ships in the payload. To drop it
          entirely, leave it out of <C>inputs</C>.
        </P>
      </Callout>

      <H2 id="order">Ordering</H2>

      <P>
        Fields render in declaration order until one of them carries an <C>order</C>.
        Useful when a form is assembled from several sources — a base description
        plus additions from a plugin.
      </P>

      <CodeBlock>{ORDER}</CodeBlock>

      <H2 id="generated">Generated values</H2>

      <P>
        <C>generatedValue: true</C> marks a field whose value comes from the
        surrounding context rather than the reader. Two things follow:
      </P>

      <Ul>
        <Li>validation skips it — nobody typed it, so nobody can fix it;</Li>
        <Li>
          <A href="/docs/resource-view/table">the table layout</A> leaves it out of
          the columns, and the filter bar leaves it out of “clear search”.
        </Li>
      </Ul>

      <H3>Next</H3>
      <P>
        The catalogue of controllers is next — the part of the library you will come
        back to most.
      </P>
    </DocArticle>
  )
}
