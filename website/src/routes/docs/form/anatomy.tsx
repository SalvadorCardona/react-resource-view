import { createFileRoute } from "@tanstack/react-router"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { FormDemo } from "@/components/FormDemo"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, H3, Li, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/form/anatomy")({
  head: () => ({
    meta: [
      { title: "Anatomy of a form — react-data-form" },
      {
        name: "description",
        content:
          "useForm builds and owns the form, FormElement renders it. What the context holds, and the round trip a value makes between the two.",
      },
    ],
  }),
  component: Anatomy,
})

const SHAPE = `const formContext = useForm({
  form,        // the description
  data,        // initial values, as your API hands them over
  onChange,    // fires on every keystroke
  onSubmit,    // fires once the validators pass
  asyncData,   // a promise resolving to the initial values
})`

const PIECES = `import {
  FormProvider,
  FormDecorator,
  FormHeader,
  FormInputs,
  FormErrors,
  FormSubmitAction,
} from "react-data-form"

// This *is* FormElement — nothing more.
<FormProvider formContext={formContext}>
  <FormDecorator>
    <FormHeader />
    <FormInputs />
    <FormErrors />
    <FormSubmitAction />
  </FormDecorator>
</FormProvider>`

const SWAP = `useForm({
  form: {
    inputs: { email: { label: "Email", type: "email" } },
    components: {
      // Replace one piece, keep the rest.
      formSubmitAction: MyOwnSubmitBar,
    },
  },
})`

const ASYNC = `const formContext = useForm({
  form: { inputs: { name: { label: "Name" } } },
  // The form renders straight away; \`ready\` flips once the promise settles.
  asyncData: () => api.get("/me").then((response) => response.data),
})

if (!formContext.ready) return <Loader />`

const SAVE_ON_CHANGE = `{
  saveOnChange: true, // submits 1.5s after the last keystroke
  onSubmit: (data) => api.patch("/settings", data),
}`

function Anatomy() {
  return (
    <DocArticle
      toc={[
        { id: "two-halves", title: "Two halves" },
        { id: "context", title: "What useForm returns" },
        { id: "round-trip", title: "The round trip of a value" },
        { id: "pieces", title: "FormElement is four components" },
        { id: "loading", title: "Loading initial values" },
        { id: "save-on-change", title: "Saving on change" },
      ]}
    >
      <H2 id="two-halves">Two halves</H2>

      <P>
        A form is always the same two calls. <C>useForm</C> takes the description and
        gives back a <em>form context</em> — the built form, its current data, and
        the handlers. <C>FormElement</C> takes that context and renders it.
      </P>

      <CodeBlock>{SHAPE}</CodeBlock>

      <P>
        Keeping them apart is what lets a form be rendered somewhere other than where
        it is built: a filter bar in a toolbar, a sub-form inside a dialog, a wizard
        whose navigation lives in a footer.
      </P>

      <H2 id="context">What useForm returns</H2>

      <PropsTable
        rows={[
          {
            name: "form",
            type: "FormBuiltInterface",
            description: (
              <>
                The built form: every field normalised, given a <C>name</C>, and
                carrying its current <C>value</C> and <C>violations</C>.
              </>
            ),
          },
          {
            name: "onChange",
            type: "(input: FormInputInterface) => void",
            description:
              "What a controller calls. It updates one field and rebuilds the form around it.",
          },
          {
            name: "onSubmit",
            type: "() => Promise<Data | undefined>",
            description:
              "Validates, and resolves with the payload — or with undefined when a validator threw.",
          },
          {
            name: "updateData",
            type: "(data: Data, partial?: boolean) => void",
            description:
              "Writes values in from the outside. Partial by default, so a subset merges.",
          },
          {
            name: "updateForm",
            type: "(form: FormBuiltInterface) => FormBuiltInterface",
            description:
              "Replaces the description itself — how steps move, and how a field can add another.",
          },
          {
            name: "ready",
            type: "boolean",
            description: (
              <>
                False until <C>asyncData</C> (or <C>form.getData</C>) has resolved.
                True immediately when there is neither.
              </>
            ),
          },
          {
            name: "isLoading",
            type: "BooleanStateInterface",
            description:
              "True while a submit is in flight; the submit button reads it.",
          },
          {
            name: "onSuccess",
            type: "PubSub<Data>",
            description:
              "Publishes after every successful submit — how a dialog knows to close.",
          },
        ]}
      />

      <H2 id="round-trip">The round trip of a value</H2>

      <P>
        Nothing in the library reads a DOM event. A controller is handed the field
        and a callback, and the loop is closed by the context:
      </P>

      <Ul>
        <Li>
          <C>FormInputs</C> walks <C>form.inputs</C> and renders each field through
          its controller.
        </Li>
        <Li>
          The controller calls <C>onChange({"{ ...formInput, value }"})</C> — the
          whole field, not just the value.
        </Li>
        <Li>
          <C>useForm</C> merges it back into the form and re-renders. A field that is{" "}
          <C>readonly</C> is ignored here, which is where read-only is actually
          enforced.
        </Li>
        <Li>
          On submit, every <C>validator</C> runs, violations are attached to their
          fields, and <C>onSubmit</C> only fires if none was raised.
        </Li>
      </Ul>

      <Callout kind="tip" title="Why the whole field, not just the value">
        A controller sometimes has more to say than a value — a set of options it has
        just fetched, a violation it raised itself, a nested form it built. Passing
        the field back whole lets it change any of that in the same call.
      </Callout>

      <H2 id="pieces">FormElement is four components</H2>

      <P>
        <C>FormElement</C> is a convenience, and a very thin one. It is exactly this:
      </P>

      <CodeBlock>{PIECES}</CodeBlock>

      <P>
        Which means you can assemble those pieces yourself when the layout calls for
        it — or swap a single one through the form's <C>components</C> key and keep
        the rest:
      </P>

      <CodeBlock>{SWAP}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "components.formSubmitAction",
            type: "FC",
            description:
              "The submit bar. Replaced by the step navigation in a wizard.",
          },
          {
            name: "components.formInputs",
            type: "FC",
            description: (
              <>
                How fields are laid out. <C>createGroupForm</C> swaps this one to get
                sections.
              </>
            ),
          },
          {
            name: "components.formDecorator",
            type: "FC<FormDecoratorPropsInterface>",
            description: "The wrapping element — the <form> tag and its layout.",
          },
          {
            name: "components.formErrors",
            type: "FC",
            description: "Form-level errors, as opposed to per-field violations.",
          },
          {
            name: "components.formGroupProvider",
            type: "FC<FormGroupProviderPropsInterface>",
            description:
              "The wrapper around each field — its label, description and violation.",
          },
        ]}
      />

      <H2 id="loading">Loading initial values</H2>

      <P>
        A create form starts empty; an edit form starts with what the API has. Pass{" "}
        <C>data</C> when you already hold it, and <C>asyncData</C> when you do not:
      </P>

      <CodeBlock>{ASYNC}</CodeBlock>

      <Callout kind="warning" title="ready is not isLoading">
        <P>
          <C>ready</C> is about the <em>initial</em> values and flips once.{" "}
          <C>isLoading</C> is about a submit in flight and flips on every submission.
          Rendering a spinner on the wrong one gives a form that disappears every
          time it is saved.
        </P>
      </Callout>

      <H2 id="save-on-change">Saving on change</H2>

      <P>
        Some forms have no submit button — a settings panel, a filter bar. Set{" "}
        <C>saveOnChange</C> and the form submits itself, debounced, 1.5 seconds after
        the last edit.
      </P>

      <CodeBlock>{SAVE_ON_CHANGE}</CodeBlock>

      <Demo
        label="saveOnChange — edit a field and stop typing"
        code={`useForm({
  form: {
    label: { title: "Notification settings" },
    saveOnChange: true,
    inputs: {
      digest: { label: "Weekly digest", type: "checkbox" },
      replyTo: { label: "Reply-to address", type: "email" },
    },
  },
})`}
      >
        <FormDemo
          form={{
            label: { title: "Notification settings" },
            saveOnChange: true,
            inputs: {
              digest: { label: "Weekly digest", type: "checkbox" },
              replyTo: { label: "Reply-to address", type: "email" },
            },
          }}
        />
      </Demo>

      <P>
        This is exactly how the filter bar of{" "}
        <A href="/docs/resource-view/filters">react-resource-view</A> works: it is an
        ordinary form with <C>saveOnChange</C>, whose <C>onChange</C> rewrites the
        query string.
      </P>

      <H3>Next</H3>
      <P>
        The next page goes through every key a field description accepts, and what
        each one changes on screen.
      </P>
    </DocArticle>
  )
}
