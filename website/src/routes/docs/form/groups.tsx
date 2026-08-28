import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { FormElement, useForm, SelectInputController } from "react-data-form"
import { createGroupForm } from "react-data-form/group"
import { Building2, CreditCard, User } from "lucide-react"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { A, C, H2, P } from "@/components/prose"

export const Route = createFileRoute("/docs/form/groups")({
  head: () => ({
    meta: [
      { title: "Groups — react-data-form" },
      {
        name: "description",
        content:
          "Splitting a long form into titled, collapsible sections with createGroupForm, without changing the field descriptions.",
      },
    ],
  }),
  component: Groups,
})

const SNIPPET = `import { createGroupForm } from "react-data-form/group"
import { FormElement, useForm } from "react-data-form"

const form = createGroupForm({
  label: { title: "Company account" },
  groupOption: {
    itemGroups: [
      { group: "identity", title: "Identity", order: 10, icon: User },
      { group: "company", title: "Company", order: 20, icon: Building2 },
      {
        group: "billing",
        title: "Billing",
        description: "Only used for invoices.",
        order: 30,
        icon: CreditCard,
        collapsible: true,
      },
    ],
  },
  inputs: {
    firstName: { label: "First name", groups: ["identity"] },
    lastName:  { label: "Last name", groups: ["identity"] },
    company:   { label: "Legal name", groups: ["company"] },
    vat:       { label: "VAT number", groups: ["company"] },
    iban:      { label: "IBAN", groups: ["billing"] },
  },
})

// \`createGroupForm\` returns a *built* form, so pass it straight through.
const formContext = useForm({ form })
return <FormElement {...formContext} />`

function GroupedDemo() {
  const [form] = useState(() =>
    createGroupForm({
      label: { title: "Company account", submit: "Create the account" },
      groupOption: {
        itemGroups: [
          { group: "identity", title: "Identity", order: 10, icon: User },
          { group: "company", title: "Company", order: 20, icon: Building2 },
          {
            group: "billing",
            title: "Billing",
            description: "Only used for invoices.",
            order: 30,
            icon: CreditCard,
            collapsible: true,
          },
        ],
      },
      inputs: {
        firstName: { label: "First name", groups: ["identity"], required: true },
        lastName: { label: "Last name", groups: ["identity"] },
        company: { label: "Legal name", groups: ["company"] },
        vat: { label: "VAT number", groups: ["company"] },
        country: {
          label: "Country",
          groups: ["company"],
          controller: SelectInputController,
          valueOptions: [
            { label: "France", value: "FR" },
            { label: "Spain", value: "ES" },
            { label: "Portugal", value: "PT" },
          ],
        },
        iban: { label: "IBAN", groups: ["billing"] },
        bic: { label: "BIC", groups: ["billing"] },
      },
    })
  )

  const formContext = useForm({ form })

  return <FormElement {...formContext} />
}

function Groups() {
  return (
    <DocArticle
      toc={[
        { id: "why", title: "What a group changes" },
        { id: "usage", title: "createGroupForm" },
        { id: "item-group", title: "The section description" },
        { id: "membership", title: "A field can be in several groups" },
      ]}
    >
      <P>
        Past a dozen fields a form stops being readable as one column. Groups cut it
        into titled sections without touching a single field description — each field
        simply declares which sections it belongs to.
      </P>

      <H2 id="why">What a group changes</H2>

      <P>
        Only the rendering. <C>createGroupForm</C> swaps the form's{" "}
        <C>components.formInputs</C> for one that walks the sections, and leaves
        everything else alone: the payload, the validation and the submit handling
        are identical to an ungrouped form.
      </P>

      <H2 id="usage">createGroupForm</H2>

      <CodeBlock filename="CompanyForm.tsx">{SNIPPET}</CodeBlock>

      <Demo label="Grouped form — the last section collapses">
        <GroupedDemo />
      </Demo>

      <Callout kind="warning" title="It returns a built form">
        <P>
          <C>createGroupForm</C> hands back a <em>built</em> form, not a description.
          Pass it to <C>useForm</C> as-is; building it twice would throw away the
          values already in it. It also throws when <C>groupOption.itemGroups</C> is
          empty, rather than rendering an empty form.
        </P>
      </Callout>

      <H2 id="item-group">The section description</H2>

      <PropsTable
        rows={[
          {
            name: "group",
            type: "string",
            required: true,
            description: (
              <>
                The identifier fields refer to in their own <C>groups</C> array.
              </>
            ),
          },
          {
            name: "order",
            type: "number",
            required: true,
            description:
              "Ascending. Sections are sorted by it, never by declaration order.",
          },
          {
            name: "title",
            type: "string",
            description: "The section heading.",
          },
          {
            name: "description",
            type: "string",
            description: "A line under the heading.",
          },
          {
            name: "icon",
            type: "FC",
            description: "Shown beside the heading.",
          },
          {
            name: "collapsible",
            type: "boolean",
            description: "Lets the reader fold the section away.",
          },
          {
            name: "name",
            type: "string",
            description:
              "Free label, used by the step navigation when the form is a wizard.",
          },
          {
            name: "component.submitButton",
            type: "FC",
            description: "A submit action for this section alone.",
          },
        ]}
      />

      <H2 id="membership">A field can be in several groups</H2>

      <P>
        <C>groups</C> is an array, so the same field can appear in more than one
        section — useful when a summary section repeats a key field. A field with no{" "}
        <C>groups</C> at all belongs to none, and a grouped form will not render it.
      </P>

      <Callout kind="tip" title="Steps are groups, walked one at a time">
        <P>
          <A href="/docs/form/steps">Multi-step forms</A> reuse this exact model: a
          step <em>is</em> an item group, and the wizard shows one at a time instead
          of all of them.
        </P>
      </Callout>
    </DocArticle>
  )
}
