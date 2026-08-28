import { createFileRoute } from "@tanstack/react-router"
import {
  ArrayInputController,
  AutocompleteInputController,
  BooleanInputController,
  CheckboxInputController,
  DateInputController,
  DatePickerInputController,
  DurationInputController,
  EmailInputController,
  IconInputController,
  MultiSelectInputController,
  NumberInputController,
  PasswordInputController,
  PhoneInputController,
  PriceInputController,
  SearchInputController,
  SelectButtonInputController,
  SelectCardInputController,
  SelectInputController,
  SelectRadioInputController,
  SelectSearchInputController,
  SelectTimeInputController,
  SwitchInputController,
  TextAreaInputController,
  TimeInputController,
  WebsiteInputController,
  WysiwygInputController,
  type ValueOptionInterface,
} from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { FormDemo } from "@/components/FormDemo"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, P } from "@/components/prose"

export const Route = createFileRoute("/docs/form/controllers")({
  head: () => ({
    meta: [
      { title: "Field controllers — react-data-form" },
      {
        name: "description",
        content:
          "The full catalogue of field controllers: text, numbers, dates, choices and composites — each one running on the page.",
      },
    ],
  }),
  component: Controllers,
})

const USAGE = `import { PriceInputController } from "react-data-form"

inputs: {
  amount: { label: "Amount", controller: PriceInputController },
}`

const STATUSES: ValueOptionInterface[] = [
  { label: "Draft", value: "draft", description: "Only you can see it" },
  { label: "In review", value: "review", description: "Waiting for an editor" },
  { label: "Published", value: "published", description: "Live on the site" },
]

const AUTHORS: ValueOptionInterface[] = [
  { label: "Ada Lovelace", value: "/api/authors/1" },
  { label: "Grace Hopper", value: "/api/authors/2" },
  { label: "Alan Turing", value: "/api/authors/3" },
  { label: "Barbara Liskov", value: "/api/authors/4" },
]

async function searchAuthors(query: string): Promise<ValueOptionInterface[]> {
  // A real one would call your API; this is the same shape, resolved locally.
  return AUTHORS.filter((author) =>
    String(author.label).toLowerCase().includes(query.toLowerCase())
  )
}

function Controllers() {
  return (
    <DocArticle
      toc={[
        { id: "how", title: "How to use one" },
        { id: "text", title: "Text" },
        { id: "numbers", title: "Numbers" },
        { id: "dates", title: "Dates and time" },
        { id: "choices", title: "Choices" },
        { id: "search", title: "Searching a large set" },
        { id: "composite", title: "Composite" },
        { id: "media", title: "Files and media" },
      ]}
    >
      <P>
        Every field is rendered by a controller. Name one on a field and that is the
        whole wiring — there is no registration step, and a controller is an ordinary
        component you could have written yourself.
      </P>

      <H2 id="how">How to use one</H2>

      <CodeBlock>{USAGE}</CodeBlock>

      <Callout kind="note" title="They all come from the main entry point">
        <P>
          Every controller on this page is exported from <C>react-data-form</C>. Only
          the image editor lives elsewhere, in <C>react-data-form/media</C>, because
          it pulls a cropping library in.
        </P>
      </Callout>

      <H2 id="text">Text</H2>

      <P>
        <C>DefaultInputController</C> is what a field falls back to, driven by its{" "}
        <C>type</C>. The others add behaviour a bare input has not got — masking, a
        text area, a rich editor.
      </P>

      <Demo
        label="Text controllers"
        code={`inputs: {
  title:       { label: "Title" },                                        // Default
  summary:     { label: "Summary", controller: TextAreaInputController },
  email:       { label: "Email", controller: EmailInputController },
  password:    { label: "Password", controller: PasswordInputController },
  website:     { label: "Website", controller: WebsiteInputController },
  phone:       { label: "Phone", controller: PhoneInputController },
  tags:        { label: "Tags", controller: ArrayInputController },
  body:        { label: "Body", controller: WysiwygInputController },
}`}
      >
        <FormDemo
          form={{
            label: { title: "An article" },
            inputs: {
              title: { label: "Title", placeholder: "Describing a form as data" },
              summary: {
                label: "Summary",
                controller: TextAreaInputController,
                description: "Two or three sentences.",
              },
              email: { label: "Contact email", controller: EmailInputController },
              password: { label: "Password", controller: PasswordInputController },
              website: { label: "Website", controller: WebsiteInputController },
              phone: { label: "Phone", controller: PhoneInputController },
              tags: {
                label: "Tags",
                controller: ArrayInputController,
                description: "Type and press Enter.",
              },
              body: { label: "Body", controller: WysiwygInputController },
            },
          }}
        />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "DefaultInputController",
            type: "string",
            description: (
              <>
                An HTML input driven by the field's <C>type</C>. Used when no
                controller is named.
              </>
            ),
          },
          {
            name: "TextAreaInputController",
            type: "string",
            description: "A multi-line text area.",
          },
          {
            name: "EmailInputController",
            type: "string",
            description: "An email input with the matching keyboard on mobile.",
          },
          {
            name: "PasswordInputController",
            type: "string",
            description: "A masked input with a reveal toggle.",
          },
          {
            name: "WebsiteInputController",
            type: "string",
            description: "A URL input, normalising what is typed.",
          },
          {
            name: "PhoneInputController",
            type: "string",
            description: "A telephone input.",
          },
          {
            name: "ArrayInputController",
            type: "string[]",
            description: (
              <>
                Free-form tags. <C>min</C> and <C>max</C> bound how many.
              </>
            ),
          },
          {
            name: "WysiwygInputController",
            type: "string (HTML)",
            description:
              "A rich text editor built on TipTap. The HTML is sanitised on the way out.",
          },
          {
            name: "SearchInputController",
            type: "string",
            description: "A text input styled as a search box, with a clear button.",
          },
        ]}
      />

      <H2 id="numbers">Numbers</H2>

      <P>
        Two of these do not store what they show, which is the point of using them: a
        price is held in the smallest currency unit and a duration in seconds, so
        neither ever loses a rounding.
      </P>

      <Demo
        label="Number controllers"
        code={`inputs: {
  quantity: { label: "Quantity", controller: NumberInputController, min: 1, max: 99 },
  amount:   { label: "Price", controller: PriceInputController },     // stored in cents
  duration: { label: "Duration", controller: DurationInputController }, // stored in seconds
}`}
      >
        <FormDemo
          form={{
            label: { title: "A line item" },
            inputs: {
              quantity: {
                label: "Quantity",
                controller: NumberInputController,
                min: 1,
                max: 99,
                defaultValue: 1,
              },
              amount: {
                label: "Unit price",
                controller: PriceInputController,
                description: "Displayed as an amount, submitted in cents.",
              },
              duration: {
                label: "Estimated duration",
                controller: DurationInputController,
                description: "Displayed as hours and minutes, submitted in seconds.",
              },
            },
          }}
        />
      </Demo>

      <Callout kind="tip" title="Submit the form above">
        <P>
          €12.50 arrives as <C>1250</C>, and “1 h 30” as <C>5400</C>. The reader sees
          an amount and a duration; your API receives integers.
        </P>
      </Callout>

      <H2 id="dates">Dates and time</H2>

      <P>
        The date fields format and parse through the <C>dateLocale</C> port, so a
        single call at startup localises all of them — see{" "}
        <A href="/docs/form/configuration">Configuration</A>.
      </P>

      <Demo
        label="Date and time controllers"
        code={`inputs: {
  dueDate:   { label: "Due date", controller: DatePickerInputController },
  birthDate: { label: "Born on", controller: DateInputController },
  startTime: { label: "Starts at", controller: TimeInputController },
  slot:      { label: "Slot", controller: SelectTimeInputController },
}`}
      >
        <FormDemo
          form={{
            label: { title: "Scheduling" },
            inputs: {
              dueDate: {
                label: "Due date",
                controller: DatePickerInputController,
                description: "A calendar in a popover.",
              },
              birthDate: {
                label: "Born on",
                controller: DateInputController,
                description: "A plain date input, for a date you already know.",
              },
              startTime: { label: "Starts at", controller: TimeInputController },
              slot: {
                label: "Length",
                controller: SelectTimeInputController,
                description: "Preset durations, in seconds.",
              },
            },
          }}
        />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "DatePickerInputController",
            type: "string (ISO date)",
            description: "A calendar in a popover. The everyday choice.",
          },
          {
            name: "DateInputController",
            type: "string (ISO date)",
            description:
              "A native date input — faster to fill when the reader knows the date.",
          },
          {
            name: "DateRangeInputController",
            type: "{ start, end }",
            description: (
              <>
                A period. Build the field with <C>createDateRangeFormInput</C>, which
                names both ends.
              </>
            ),
          },
          {
            name: "TimeInputController",
            type: "string (HH:mm)",
            description: "A time of day.",
          },
          {
            name: "SelectTimeInputController",
            type: "number (seconds)",
            description: "Preset durations from 15 minutes upwards.",
          },
          {
            name: "MomentInputController",
            type: "string (ISO datetime)",
            description: "A date and a time together, in one control.",
          },
        ]}
      />

      <H2 id="choices">Choices</H2>

      <P>
        All of these read the same <C>valueOptions</C>. They differ only in how much
        room they take and how many values they hold — which means changing your mind
        later is a one-word edit.
      </P>

      <Demo
        label="Single choice, four presentations"
        code={`// The same options, four controllers.
inputs: {
  a: { label: "Dropdown",  controller: SelectInputController,       valueOptions: STATUSES },
  b: { label: "Radio",     controller: SelectRadioInputController,  valueOptions: STATUSES },
  c: { label: "Buttons",   controller: SelectButtonInputController, valueOptions: STATUSES },
  d: { label: "Cards",     controller: SelectCardInputController,   valueOptions: STATUSES },
}`}
      >
        <FormDemo
          form={{
            label: { title: "Status" },
            inputs: {
              dropdown: {
                label: "As a dropdown",
                controller: SelectInputController,
                valueOptions: STATUSES,
              },
              radio: {
                label: "As radio buttons",
                controller: SelectRadioInputController,
                valueOptions: STATUSES,
              },
              buttons: {
                label: "As a button group",
                controller: SelectButtonInputController,
                valueOptions: STATUSES,
              },
              cards: {
                label: "As cards",
                controller: SelectCardInputController,
                valueOptions: STATUSES,
              },
            },
          }}
        />
      </Demo>

      <Demo
        label="Booleans and multiple choice"
        code={`inputs: {
  published: { label: "Published", controller: SwitchInputController },
  featured:  { label: "Featured", controller: CheckboxInputController },
  archived:  { label: "Archived", controller: BooleanInputController },
  authors:   { label: "Authors", controller: MultiSelectInputController, valueOptions: AUTHORS },
  emoji:     { label: "Icon", controller: IconInputController },
}`}
      >
        <FormDemo
          form={{
            label: { title: "Flags and sets" },
            inputs: {
              published: {
                label: "Published",
                controller: SwitchInputController,
              },
              featured: {
                label: "Featured on the home page",
                controller: CheckboxInputController,
              },
              archived: {
                label: "Archived",
                controller: BooleanInputController,
                description: "Yes / no, as a pair of buttons.",
              },
              authors: {
                label: "Authors",
                controller: MultiSelectInputController,
                valueOptions: AUTHORS,
              },
              emoji: {
                label: "Icon",
                controller: IconInputController,
                description: "An emoji picker, searchable.",
              },
            },
          }}
        />
      </Demo>

      <H2 id="search">Searching a large set</H2>

      <P>
        A dropdown stops working somewhere around fifty options. Past that, the field
        should ask the server instead: <C>onSearch</C> is called on every keystroke
        and returns the options to show.
      </P>

      <Demo
        label="Type a name — the options are fetched per keystroke"
        code={`inputs: {
  author: {
    label: "Author",
    controller: SelectSearchInputController,
    onSearch: async (query) =>
      valueOptionMapper(await api.authors({ query }), "name", "@id"),
  },
}`}
      >
        <FormDemo
          form={{
            label: { title: "Attribution" },
            inputs: {
              author: {
                label: "Author",
                controller: SelectSearchInputController,
                onSearch: searchAuthors,
                description: "Try “a”, “gr”, or “lisk”.",
              },
              reviewers: {
                label: "Reviewers",
                controller: SelectSearchInputController,
                onSearch: searchAuthors,
              },
              freeText: {
                label: "Or type one in",
                controller: AutocompleteInputController,
                valueOptions: AUTHORS,
                description:
                  "Suggests, but accepts a value that is not in the list.",
              },
              quickFind: {
                label: "Quick find",
                controller: SearchInputController,
              },
            },
          }}
        />
      </Demo>

      <PropsTable
        rows={[
          {
            name: "SelectSearchInputController",
            type: "Primitive",
            description: "One value, chosen from a searched, remote set.",
          },
          {
            name: "MultiSelectSearchInputController",
            type: "Primitive[]",
            description: "The same, holding several values.",
          },
          {
            name: "AutocompleteInputController",
            type: "string",
            description:
              "Suggests from the options but accepts anything typed — a free field with hints.",
          },
          {
            name: "MultiSelectInputController",
            type: "Primitive[]",
            description: "Several values from a set already in memory.",
          },
        ]}
      />

      <Callout kind="tip" title="Showing an IRI as a name">
        <P>
          When an option's value is an IRI, the label shown once it is chosen comes
          from the <C>iriLabel</C> port. Configure it once and every dropdown in the
          application reads resource names instead of <C>/api/authors/4</C>.
        </P>
      </Callout>

      <H2 id="composite">Composite</H2>

      <P>
        Three controllers hold structure rather than a scalar. They have{" "}
        <A href="/docs/form/nested">a page of their own</A>, since what they submit
        is nested.
      </P>

      <PropsTable
        rows={[
          {
            name: "FormInputController",
            type: "object",
            description: (
              <>
                Renders the field's <C>form</C> inline as a sub-form, and submits it
                as a nested object.
              </>
            ),
          },
          {
            name: "FormArrayInputController",
            type: "object[]",
            description:
              "A page builder: the reader adds blocks from a palette, each block being a registered form.",
          },
          {
            name: "BlockOrderInput",
            type: "object[]",
            description: "Reorders the blocks of the field above.",
          },
        ]}
      />

      <H2 id="media">Files and media</H2>

      <PropsTable
        rows={[
          {
            name: "FileInputController",
            type: "string",
            description:
              "A file input. Uploading is yours to do — the controller stores whatever reference you give back.",
          },
          {
            name: "IaImageInputController",
            type: "string",
            description:
              "An image field with a generation affordance, for backends that offer one.",
          },
          {
            name: "ImageEditor",
            type: "component",
            description: (
              <>
                Cropping and rotation, from <C>react-data-form/media</C>. Not a
                controller: a component to plug into the upload flow your API needs.
              </>
            ),
          },
        ]}
      />

      <Callout kind="note" title="No upload endpoint is assumed">
        <P>
          The library never issues a request. <C>FileInputController</C> hands you
          the file and stores the reference you put back on the field, so it works
          the same against S3, an API Platform media object, or a data URL.
        </P>
      </Callout>
    </DocArticle>
  )
}
