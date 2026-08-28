import { createFileRoute } from "@tanstack/react-router"
import { NumberInputController } from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { FormDemo } from "@/components/FormDemo"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, H3, Li, Ol, P, Ul } from "@/components/prose"

export const Route = createFileRoute("/docs/form/validation")({
  head: () => ({
    meta: [
      { title: "Validation and API errors — react-data-form" },
      {
        name: "description",
        content:
          "A validator is a function that throws. Zod issues are unpacked, and an API Platform 422 is mapped back onto the fields that caused it.",
      },
    ],
  }),
  component: Validation,
})

const THROWING = `inputs: {
  slug: {
    label: "Slug",
    validator: (value) => {
      if (!/^[a-z0-9-]+$/.test(String(value ?? ""))) {
        throw new Error("Lowercase letters, digits and dashes only")
      }
      return value
    },
  },
}`

const ZOD = `import { z } from "zod"

inputs: {
  email: {
    label: "Email",
    // Any error carrying \`issues\` is read as a Zod error, and each issue
    // becomes one violation — so a schema with three rules shows three messages.
    validator: (value) => z.string().email("That is not an email").parse(value),
  },
}`

const API_ERROR = `{
  "@type": "ConstraintViolationList",
  "title": "An error occurred",
  "violations": [
    { "propertyPath": "email", "message": "This email is already registered." },
    { "propertyPath": "", "message": "The account could not be created." }
  ]
}`

const MAPPING = `import { addErrorFromViolations } from "react-data-form"

const formContext = useForm({
  form: {
    inputs: { email: { label: "Email" }, name: { label: "Name" } },
    onSubmit: async (data) => {
      try {
        return await api.post("/users", data)
      } catch (error) {
        // \`error.data\` is the problem+json body above.
        formContext.updateForm(
          addErrorFromViolations(formContext.form, error.data)
        )
        throw error
      }
    },
  },
})`

const FORM_VALIDATOR = `{
  // Runs over the whole payload, for rules that span fields.
  validator: (data) => {
    if (data.endsAt < data.startsAt) throw new Error("The end is before the start")
    return data
  },
}`

function Validation() {
  return (
    <DocArticle
      toc={[
        { id: "throwing", title: "A validator throws" },
        { id: "zod", title: "Zod, without a dependency on it" },
        { id: "when", title: "When validation runs" },
        { id: "api", title: "Errors from the API" },
        { id: "violation", title: "The violation shape" },
        { id: "form-level", title: "Form-level errors" },
      ]}
    >
      <H2 id="throwing">A validator throws</H2>

      <P>
        There is no schema language and no rule registry. A field's <C>validator</C>{" "}
        is a function that receives the value and throws if it is unhappy. The
        message becomes the violation shown under the field.
      </P>

      <CodeBlock>{THROWING}</CodeBlock>

      <Demo label="Submit with an invalid slug" code={THROWING}>
        <FormDemo
          form={{
            label: { title: "New page", submit: "Create" },
            inputs: {
              title: { label: "Title", required: true },
              slug: {
                label: "Slug",
                description: "Try “Hello World”, then “hello-world”.",
                validator: (value) => {
                  if (!/^[a-z0-9-]+$/.test(String(value ?? ""))) {
                    throw new Error("Lowercase letters, digits and dashes only")
                  }
                  return value
                },
              },
              weight: {
                label: "Weight",
                controller: NumberInputController,
                validator: (value) => {
                  if (Number(value) < 0) throw new Error("Cannot be negative")
                  return value
                },
              },
            },
          }}
        />
      </Demo>

      <H2 id="zod">Zod, without a dependency on it</H2>

      <P>
        The library does not depend on Zod, but it recognises its errors: any thrown
        error carrying an <C>issues</C> array is unpacked into one violation per
        issue, each keeping its <C>code</C>.
      </P>

      <CodeBlock>{ZOD}</CodeBlock>

      <Callout kind="note" title="Any library with the same shape works">
        <P>
          The check is structural — <C>Object.hasOwn(error, "issues")</C>. Throw an
          error with an <C>issues</C> array of <C>{"{ code, message, path }"}</C>{" "}
          from anywhere and it will be read the same way.
        </P>
      </Callout>

      <H2 id="when">When validation runs</H2>

      <Ol>
        <Li>
          The reader submits. <C>validateForm</C> runs over every field that is not{" "}
          <C>generatedValue</C>.
        </Li>
        <Li>
          Each field's <C>violations</C> array is cleared, then repopulated by its
          validator.
        </Li>
        <Li>
          If any field carries a violation, <C>onSubmit</C> never fires and the form
          re-renders with the messages in place.
        </Li>
        <Li>
          Otherwise the form's own <C>onSubmit</C> runs, then the hook's, then{" "}
          <C>onSuccess</C> publishes.
        </Li>
      </Ol>

      <Callout kind="warning" title="Not on every keystroke">
        <P>
          Validators run on submit, not on change. A field that turns red while the
          reader is still typing their email address is a worse experience, and the
          library takes that position for you.
        </P>
      </Callout>

      <H2 id="api">Errors from the API</H2>

      <P>
        Client-side validation is a convenience; the server is the authority. An{" "}
        <A href="https://api-platform.com">API Platform</A> backend answers a
        rejected write with <C>application/problem+json</C>:
      </P>

      <CodeBlock lang="json" filename="422 Unprocessable Entity">
        {API_ERROR}
      </CodeBlock>

      <P>
        <C>addErrorFromViolations</C> maps that body back onto the form: each
        violation lands on the field named by its <C>propertyPath</C>, and a
        violation with an empty path becomes a form-level error.
      </P>

      <CodeBlock>{MAPPING}</CodeBlock>

      <Callout kind="tip" title="Nothing about the HTTP client is assumed">
        <P>
          <C>ApiJsonLdError</C> is declared inside the library purely as a shape.
          Fetch, Axios or openapi-fetch — only the body matters, so any client works.
        </P>
      </Callout>

      <H2 id="violation">The violation shape</H2>

      <PropsTable
        rows={[
          {
            name: "propertyPath",
            type: "string",
            description: (
              <>
                Which field it belongs to. An empty string means the form as a whole.
              </>
            ),
          },
          {
            name: "message",
            type: "string",
            description: "What is shown under the field.",
          },
          {
            name: "code",
            type: "string",
            description:
              "Machine-readable identifier, kept as-is from Zod or from your API.",
          },
        ]}
      />

      <P>
        <C>createViolation</C> builds one, should you want to attach an error to a
        field from a controller of your own.
      </P>

      <H2 id="form-level">Form-level errors</H2>

      <P>
        Some rules span several fields and belong to none of them. The form takes a{" "}
        <C>validator</C> of its own, and <C>errors</C> holds the messages{" "}
        <C>FormErrors</C> renders above the submit button.
      </P>

      <CodeBlock>{FORM_VALIDATOR}</CodeBlock>

      <H3>See also</H3>
      <Ul>
        <Li>
          <A href="/docs/form/steps">Multi-step forms</A> — validation runs per step,
          and a failing submit jumps back to the first step holding a violation.
        </Li>
        <Li>
          <A href="/docs/resource-view/resources">Resource views</A> — the create and
          edit views wire this up for you, including the 422 mapping.
        </Li>
      </Ul>
    </DocArticle>
  )
}
