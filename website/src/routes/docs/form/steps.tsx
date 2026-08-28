import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import {
  FormElement,
  SelectCardInputController,
  SelectInputController,
  useForm,
} from "react-data-form"
import { createStepForm } from "react-data-form/step"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/form/steps")({
  head: () => ({
    meta: [
      { title: "Multi-step forms — react-data-form" },
      {
        name: "description",
        content:
          "createStepForm turns the same description into a wizard: one section at a time, validated per step, with an async hook between them.",
      },
    ],
  }),
  component: Steps,
})

const SNIPPET = `import { createStepForm } from "react-data-form/step"

const form = createStepForm({
  label: { title: "New project", submit: "Create the project" },
  groupOption: {
    itemGroups: [
      { group: "type", title: "What are we building?", order: 10 },
      { group: "details", title: "The details", order: 20 },
      {
        group: "team",
        title: "Who is on it?",
        order: 30,
        // Runs before moving on — reserve a slug, check a quota…
        onNextStep: async ({ form }) => {
          await api.post("/projects/precheck", form.data)
          return form
        },
      },
    ],
  },
  inputs: {
    kind:    { label: "Project type", groups: ["type"], controller: SelectCardInputController, valueOptions: KINDS },
    name:    { label: "Name", groups: ["details"], required: true },
    summary: { label: "Summary", groups: ["details"] },
    lead:    { label: "Project lead", groups: ["team"] },
  },
})`

const USE_STEP = `import { useFormStep } from "react-data-form/step"

function StepFooter() {
  const { currentStep, steps, progress, goToNextStep, goToPrevStep, onSubmit } =
    useFormStep()

  return (
    <footer>
      <progress value={progress} max={100} />
      <button onClick={goToPrevStep}>Back</button>
      <button onClick={goToNextStep}>Next</button>
    </footer>
  )
}`

const KINDS = [
  { label: "Website", value: "website", description: "Marketing or content" },
  { label: "API", value: "api", description: "A backend service" },
  { label: "Mobile", value: "mobile", description: "iOS and Android" },
]

function StepDemo() {
  const [form] = useState(() =>
    createStepForm({
      label: { title: "New project", submit: "Create the project" },
      groupOption: {
        itemGroups: [
          { group: "type", title: "What are we building?", order: 10 },
          { group: "details", title: "The details", order: 20 },
          { group: "team", title: "Who is on it?", order: 30 },
        ],
      },
      inputs: {
        kind: {
          label: "Project type",
          groups: ["type"],
          controller: SelectCardInputController,
          valueOptions: KINDS,
        },
        name: {
          label: "Name",
          groups: ["details"],
          required: true,
          validator: (value) => {
            if (!value) throw new Error("A project needs a name")
            return value
          },
        },
        summary: { label: "Summary", groups: ["details"] },
        lead: {
          label: "Project lead",
          groups: ["team"],
          controller: SelectInputController,
          valueOptions: [
            { label: "Ada Lovelace", value: "ada" },
            { label: "Grace Hopper", value: "grace" },
          ],
        },
      },
    })
  )

  const formContext = useForm({ form })

  return <FormElement {...formContext} />
}

function Steps() {
  return (
    <DocArticle
      toc={[
        { id: "usage", title: "createStepForm" },
        { id: "validation", title: "Validation per step" },
        { id: "on-next", title: "Doing work between steps" },
        { id: "use-form-step", title: "useFormStep" },
        { id: "options", title: "Step options" },
      ]}
    >
      <P>
        A wizard is a grouped form walked one section at a time. The field
        descriptions do not change at all — only the entry point and two of the
        form's components.
      </P>

      <H2 id="usage">createStepForm</H2>

      <CodeBlock filename="ProjectWizard.tsx">{SNIPPET}</CodeBlock>

      <Demo label="A three-step form — try submitting with no name">
        <StepDemo />
      </Demo>

      <P>
        <C>createStepForm</C> builds the form, applies the lowest-order step, and
        swaps two components: <C>formSubmitAction</C> becomes the step navigation,
        and <C>formDecorator</C> the progress header.
      </P>

      <H2 id="validation">Validation per step</H2>

      <P>Two things happen that an ordinary form does not do:</P>

      <Ul>
        <Li>
          <strong>Moving forward validates the current step.</strong>{" "}
          <C>goToNextStep</C> runs the validators and refuses to advance while a
          field is in violation — so an error never scrolls off behind the reader.
        </Li>
        <Li>
          <strong>A failed submit walks back.</strong> When the final submit raises a
          violation on a field belonging to an earlier step, the wizard returns to
          the first step holding one, instead of showing a message about a field that
          is not on screen.
        </Li>
      </Ul>

      <Callout kind="tip" title="This is why the last step is not enough">
        <P>
          Server-side violations arrive after the whole payload is sent. Without that
          walk-back the reader would be told the form is invalid while looking at a
          page where everything is filled in.
        </P>
      </Callout>

      <H2 id="on-next">Doing work between steps</H2>

      <P>
        <C>onNextStep</C> is awaited before the wizard advances, and can return a
        modified form. That is the hook for anything the next step depends on —
        reserving an identifier, checking a quota, fetching the options of a field
        further along.
      </P>

      <CodeBlock>{`onNextStep: async ({ step, form }) => {
  const { data } = await api.post("/projects/precheck", form.data)

  // Fill the next step's options from what the server just answered.
  form.inputs.lead.valueOptions = valueOptionMapper(data.members, "name", "@id")
  return form
}`}</CodeBlock>

      <P>
        It exists in two places: on <C>groupOption</C>, where it runs between every
        pair of steps, and on a single step, where it runs only when leaving that
        one. Both run, the shared one first.
      </P>

      <H2 id="use-form-step">useFormStep</H2>

      <P>
        The default navigation covers most wizards. When it does not, drive your own
        from the hook — it works anywhere inside the form's provider.
      </P>

      <CodeBlock>{USE_STEP}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "currentStep",
            type: "FormStep | undefined",
            description: "The step on screen.",
          },
          {
            name: "nextStep / previousStep",
            type: "FormStep | undefined",
            description: "Its neighbours, or undefined at either end.",
          },
          {
            name: "steps",
            type: "FormStep[]",
            description: "Every step, sorted by order.",
          },
          {
            name: "progress",
            type: "number",
            description: "0–100, from the current step's position.",
          },
          {
            name: "goToNextStep",
            type: "() => void",
            description: "Validates, runs onNextStep, then advances.",
          },
          {
            name: "goToPrevStep",
            type: "() => void",
            description: "Goes back. No validation — going back is never blocked.",
          },
          {
            name: "onSubmit",
            type: "() => void",
            description: "Submits, and walks back to the first step in violation.",
          },
          {
            name: "form",
            type: "FormWithStepsBuild",
            description: "The form itself, should you need to read it.",
          },
        ]}
      />

      <H2 id="options">Step options</H2>

      <P>
        A step is an <A href="/docs/form/groups">item group</A> with one extra key,
        so everything on the groups page applies — <C>title</C>, <C>description</C>,{" "}
        <C>icon</C>, <C>order</C>.
      </P>

      <PropsTable
        rows={[
          {
            name: "groupOption.itemGroups",
            type: "FormStep[]",
            required: true,
            description: "The steps. Empty throws rather than rendering nothing.",
          },
          {
            name: "groupOption.currentStep",
            type: "FormStep",
            description: "Where the wizard is. Set for you; read it if you need to.",
          },
          {
            name: "groupOption.hideStepNumber",
            type: "boolean",
            description: "Hides the “2 / 4” counter in the header.",
          },
          {
            name: "groupOption.onNextStep",
            type: "({ step, form }) => Promise<Form>",
            description: "Runs between every pair of steps.",
          },
          {
            name: "step.onNextStep",
            type: "({ step, form }) => Promise<Form>",
            description: "Runs when leaving that step in particular.",
          },
        ]}
      />
    </DocArticle>
  )
}
