import { createFileRoute } from "@tanstack/react-router"
import type { InputControllerProps } from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { FormDemo } from "@/components/FormDemo"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/form/custom-controller")({
  head: () => ({
    meta: [
      { title: "Writing a field controller — react-data-form" },
      {
        name: "description",
        content:
          "Two props, no registration step: a controller is a component that receives a field and hands it back changed.",
      },
    ],
  }),
  component: CustomController,
})

const INTERFACE = `interface InputControllerInterface<F extends FormInputInterface = FormInputInterface> {
  formInput: F
  onChange: (formInput: F) => void
}`

const COLOR = `import type { InputControllerProps } from "react-data-form"

export function ColorInputController({
  formInput,
  onChange,
}: InputControllerProps<string>) {
  return (
    <input
      type="color"
      value={formInput.value ?? "#7c5cff"}
      disabled={formInput.readonly}
      onChange={(event) =>
        // Hand the whole field back, not just the value.
        onChange({ ...formInput, value: event.target.value })
      }
    />
  )
}

// Then, anywhere:
inputs: {
  brand: { label: "Brand colour", controller: ColorInputController },
}`

const RATING = `export function RatingInputController({
  formInput,
  onChange,
}: InputControllerProps<number>) {
  const value = formInput.value ?? 0
  const max = formInput.max ?? 5

  return (
    <div role="radiogroup" aria-label={String(formInput.label ?? "Rating")}>
      {Array.from({ length: max }, (_, index) => index + 1).map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={score === value}
          disabled={formInput.readonly}
          onClick={() => onChange({ ...formInput, value: score })}
        >
          ★
        </button>
      ))}
    </div>
  )
}`

const CONTEXT = `import { useFormContext } from "react-data-form"

export function DependentController({ formInput, onChange }: InputControllerProps) {
  // The surrounding form, when a field genuinely needs it.
  const { form, updateData } = useFormContext()
  const country = form.inputs.country?.value
  …
}`

const OPTIONS_AWARE = `export function MyPicker({ formInput, onChange }: InputControllerProps<string>) {
  const [options, setOptions] = useState(formInput.valueOptions ?? [])

  useEffect(() => {
    formInput.getValueOptions?.(formInput).then(setOptions)
  }, [formInput.id])
  …
}`

function ColorInputController({
  formInput,
  onChange,
}: InputControllerProps<string>) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={formInput.value ?? "#7c5cff"}
        onChange={(event) => onChange({ ...formInput, value: event.target.value })}
        className="size-9 cursor-pointer rounded-md border border-border bg-transparent"
      />
      <code className="font-mono text-xs text-muted-foreground">
        {formInput.value ?? "#7c5cff"}
      </code>
    </div>
  )
}

function RatingInputController({
  formInput,
  onChange,
}: InputControllerProps<number>) {
  const value = formInput.value ?? 0
  const max = formInput.max ?? 5

  return (
    <div
      role="radiogroup"
      aria-label={String(formInput.label ?? "Rating")}
      className="flex gap-1"
    >
      {Array.from({ length: max }, (_, index) => index + 1).map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={score === value}
          onClick={() => onChange({ ...formInput, value: score })}
          className={
            score <= value
              ? "text-xl leading-none text-form"
              : "text-xl leading-none text-muted-foreground/40 hover:text-muted-foreground"
          }
        >
          ★
        </button>
      ))}
    </div>
  )
}

function CustomController() {
  return (
    <DocArticle
      toc={[
        { id: "contract", title: "The whole contract" },
        { id: "first", title: "A first controller" },
        { id: "reading", title: "Reading the rest of the field" },
        { id: "context", title: "Reaching the surrounding form" },
        { id: "checklist", title: "Checklist" },
      ]}
    >
      <P>
        The catalogue covers a lot, but not your domain. A controller is an ordinary
        component with two props, and nothing has to be registered for the library to
        use it.
      </P>

      <H2 id="contract">The whole contract</H2>

      <CodeBlock lang="ts">{INTERFACE}</CodeBlock>

      <P>
        That is the entire extension point. <C>InputControllerProps&lt;T&gt;</C> is
        the same thing with the value typed, which is what you will normally write.
      </P>

      <H2 id="first">A first controller</H2>

      <CodeBlock filename="ColorInputController.tsx">{COLOR}</CodeBlock>

      <Demo label="Two controllers written in this page" code={RATING}>
        <FormDemo
          form={{
            label: { title: "Feedback", submit: "Send" },
            inputs: {
              brand: {
                label: "Brand colour",
                controller: ColorInputController,
              },
              score: {
                label: "How was it?",
                controller: RatingInputController,
                max: 5,
                description: "A controller in twenty lines.",
              },
              comment: { label: "Anything else?" },
            },
          }}
        />
      </Demo>

      <Callout kind="tip" title="Spread the field, don’t rebuild it">
        <P>
          Always call <C>onChange({"{ ...formInput, value }"})</C>. The field carries
          more than its value — its violations, its options, its id — and replacing
          it with a fresh object drops all of that.
        </P>
      </Callout>

      <H2 id="reading">Reading the rest of the field</H2>

      <P>
        A controller decides for itself which keys it honours. Reading these four is
        what makes a custom controller feel like the built-in ones:
      </P>

      <PropsTable
        rows={[
          {
            name: "formInput.value",
            type: "T | undefined",
            description: "The current value. Always handle undefined.",
          },
          {
            name: "formInput.readonly",
            type: "boolean",
            description: (
              <>
                Disable the control. <C>useForm</C> drops the change anyway, but an
                enabled control that ignores clicks is worse than a disabled one.
              </>
            ),
          },
          {
            name: "formInput.placeholder / description",
            type: "string",
            description: "Passed through to whatever you render.",
          },
          {
            name: "formInput.valueOptions / getValueOptions / onSearch",
            type: "options",
            description:
              "For a choice control, so a field can move between your controller and a built-in one unchanged.",
          },
        ]}
      />

      <P>
        A controller fetching its own options should read <C>valueOptions</C> first
        and fall back to <C>getValueOptions</C>:
      </P>

      <CodeBlock>{OPTIONS_AWARE}</CodeBlock>

      <H2 id="context">Reaching the surrounding form</H2>

      <P>
        Most controllers never need it — that is the point of the two-prop contract.
        When one genuinely does, <C>useFormContext</C> gives the whole form context.
      </P>

      <CodeBlock>{CONTEXT}</CodeBlock>

      <Callout kind="warning" title="Prefer hidden() for conditional fields">
        <P>
          Reading a sibling field from inside a controller couples the two. A field's
          own{" "}
          <A href="/docs/form/fields">
            <C>hidden</C>
          </A>{" "}
          function does the same job in the description, where it can be read.
        </P>
      </Callout>

      <H2 id="checklist">Checklist</H2>

      <Ul>
        <Li>Spread the field back, never replace it.</Li>
        <Li>
          Handle <C>undefined</C>: a create form starts with nothing.
        </Li>
        <Li>
          Honour <C>readonly</C>.
        </Li>
        <Li>
          Label the control — the field's <C>label</C> is rendered by the group
          provider, not by you, so a bare <C>&lt;div&gt;</C> of buttons still needs
          its own accessible name.
        </Li>
        <Li>
          Submit the value in the shape your API wants. A controller is free to show
          hours and store seconds, as the duration one does.
        </Li>
      </Ul>
    </DocArticle>
  )
}
