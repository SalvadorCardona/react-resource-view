import { createFileRoute } from "@tanstack/react-router"
import { ActionList } from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, H3, Li, P, Ul } from "@/components/prose"
import { drawerArticlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/forms")({
  head: () => ({
    meta: [
      { title: "Asymmetric forms — react-resource-view" },
      {
        name: "description",
        content:
          "One description for every action, and a different form for creating, editing, reading and deleting when the actions genuinely differ.",
      },
    ],
  }),
  component: Forms,
})

const SHARED = `createViewResource("articles", {
  path: "/api/articles",
  view: {
    // Read by the list's columns, the create form, the edit form and the
    // detail page — all four at once.
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
        status: { label: "Status", controller: SelectInputController, valueOptions: STATUSES },
      },
    },
  },
})`

const ASYMMETRIC = `createViewResource("articles", {
  path: "/api/articles",
  view: {
    // The columns, and the edit form: everything an article has.
    form: articleForm,
  },
  views: {
    // Creating asks for what a draft cannot exist without. The rest is
    // filled in afterwards, from the edit form.
    [ActionList.create]: {
      form: {
        inputs: {
          title: articleForm.inputs.title,
          category: articleForm.inputs.category,
        },
      },
    },
  },
})`

const TYPES = `interface Article {          // what the API returns
  "@id": string
  title: string
  author: { "@id": string; name: string }
  publishedAt: string
}

interface ArticleWrite {      // what the API accepts
  title: string
  author: string              // an IRI, not the embedded record
  publish: boolean            // no column shows it, no read returns it
}

// <Item, Collection, Update> — the third one is the write shape.
createViewResource<Article, Article, ArticleWrite>("articles", {
  path: "/api/articles",
  views: {
    [ActionList.create]: { form: writeForm },   // typed against ArticleWrite
    [ActionList.update]: { form: writeForm },
  },
})`

const TRIMMING = `views: {
  [ActionList.create]: {
    form: {
      inputs: {
        title: { label: "Title", required: true },
        // Never asked for, never validated, never a column — supplied below.
        workspace: { generatedValue: true },
      },
    },
  },
  [ActionList.update]: {
    form: {
      inputs: {
        title: { label: "Title", required: true },
        // Shown, but the reader cannot move it.
        slug: { label: "Slug", readonly: true },
      },
    },
  },
},

// The value the create form deliberately does not ask for.
preCreate: (data, context) => ({
  ...data,
  workspace: context?.viewResourceContext?.filter?.workspace,
}),`

const READ_DELETE = `views: {
  // A detail page carrying more than the list does.
  [ActionList.read]: { form: detailForm },
  // The confirmation is a form too — usually an empty one.
  [ActionList.delete]: { label: { delete: "Delete this article" } },
}`

function Forms() {
  return (
    <DocArticle
      toc={[
        { id: "shared", title: "One description, four screens" },
        { id: "asymmetric", title: "When creating is not editing" },
        { id: "replacing", title: "A form replaces, it does not merge" },
        { id: "types", title: "The read shape and the write shape" },
        { id: "trimming", title: "Fields the reader never fills" },
        { id: "read-delete", title: "Reading and deleting" },
      ]}
    >
      <P>
        The default is that every action of a resource shares one form: the columns
        of the list, the create form and the edit form are the same description read
        four times, and that is what makes a resource cheap to declare.
      </P>

      <P>
        It is also, often enough, a lie. Creating an article is not editing one —
        half the fields do not exist yet, and a couple of them the reader is never
        allowed to touch again. This page is about saying so.
      </P>

      <H2 id="shared">One description, four screens</H2>

      <P>
        <C>view.form</C> is the description every action starts from. Declared alone,
        it drives the lot:
      </P>

      <CodeBlock>{SHARED}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "view.form",
            type: "FormInterface",
            description:
              "The shared description. The table's columns, and the form every action falls back to.",
          },
          {
            name: "views.create.form",
            type: "FormInterface",
            description: "Only the creation form.",
          },
          {
            name: "views.update.form",
            type: "FormInterface",
            description: "Only the edit form — the one a row's edit button opens.",
          },
          {
            name: "views.read.form",
            type: "FormInterface",
            description: (
              <>
                The detail page. Rendered with the form's <C>action</C> forced to{" "}
                <C>read</C>, so the fields display rather than accept input.
              </>
            ),
          },
          {
            name: "views.list.form",
            type: "FormInterface",
            description: (
              <>
                The columns, when the table should show something other than what the
                forms ask for. A <A href="/docs/resource-view/layouts">variant</A> can
                narrow it further still.
              </>
            ),
          },
        ]}
      />

      <H2 id="asymmetric">When creating is not editing</H2>

      <P>
        An asymmetric declaration is the shared form plus one override. Below, the
        create form asks for two fields and the edit form for six — the article is
        started in a sentence and completed later.
      </P>

      <CodeBlock>{ASYMMETRIC}</CodeBlock>

      <Demo
        label="Create asks for two fields, edit for six — both in a drawer"
        code={ASYMMETRIC}
        wide
      >
        <ResourceDemo
          resource={drawerArticlesResource}
          action={ActionList.list}
          variant="table"
        />
      </Demo>

      <P>
        Add an article and then edit it: the panel that opens is not the panel that
        opened a moment ago. Nothing else in the declaration changed — the columns,
        the filters and the repository are still read from the same place.
      </P>

      <Callout kind="tip" title="Each action names itself">
        <P>
          An action that declares no <C>name</C> takes the resource's, prefixed:{" "}
          <C>Create — Articles</C>, <C>Edit — Articles</C>, <C>Delete — Articles</C>.
          That name is what a dialog and a drawer are titled with, so an overlay
          always says which record it is about. <C>views.create.name</C> overrides it,
          and <C>view.label.create</C> renames the button rather than the screen.
        </P>
      </Callout>

      <H2 id="replacing">A form replaces, it does not merge</H2>

      <Callout kind="danger" title="The one to know before writing an override">
        <P>
          <C>views.&lt;action&gt;</C> is spread over <C>view</C> one key deep. So{" "}
          <C>views.create.form</C> <strong>replaces</strong> the shared form outright:
          the fields it does not list are not inherited, they are gone.
        </P>
      </Callout>

      <P>
        Which is the behaviour you want — an override that quietly kept six fields you
        did not name would be worse — but it means the override has to be built out of
        the shared description rather than declared next to it, or the two drift:
      </P>

      <Ul>
        <Li>
          reference the fields, as the example above does —{" "}
          <C>title: articleForm.inputs.title</C> — and the label, the controller and
          the validation stay written once;
        </Li>
        <Li>
          or subtract from it —{" "}
          <C>{"const { publishedAt, ...createInputs } = articleForm.inputs"}</C> —
          when the override drops more than it keeps.
        </Li>
      </Ul>

      <P>
        A resource that declares neither a shared form nor one for the action falls
        back to the <C>defaultForm</C> of{" "}
        <A href="/docs/form/configuration">the form configuration</A> — the
        application-wide labels and components, and no fields of its own.
      </P>

      <H2 id="types">The read shape and the write shape</H2>

      <P>
        Asymmetry is rarely only about which fields are shown. An API that returns an
        embedded author and accepts an IRI is returning one type and accepting
        another, and <C>createViewResource</C> takes both:
      </P>

      <CodeBlock>{TYPES}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "Item",
            type: "extends BaseJsonLdItemInterface",
            required: true,
            description: "What a read returns. Types the detail view and the rows.",
          },
          {
            name: "Collection",
            type: "extends BaseJsonLdItemInterface",
            default: "Item",
            description:
              "What a list returns, for an API whose collection is thinner than its item.",
          },
          {
            name: "Update",
            type: "object",
            default: "Item",
            description: (
              <>
                What a write accepts. Types <C>views.create.form</C>,{" "}
                <C>views.update.form</C>, <C>preCreate</C> and <C>preUpdate</C>.
              </>
            ),
          },
        ]}
      />

      <P>
        The three default to one another, so a resource whose API round-trips the
        same shape names one type and stops there.
      </P>

      <H2 id="trimming">Fields the reader never fills</H2>

      <P>
        Not every difference between creating and editing is a field being removed.
        Two field keys and two hooks cover the rest:
      </P>

      <CodeBlock>{TRIMMING}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "generatedValue",
            type: "boolean",
            description: (
              <>
                The field exists but nobody types it: excluded from validation and
                from the table's columns. Pair it with <C>preCreate</C>.
              </>
            ),
          },
          {
            name: "readonly",
            type: "boolean",
            description:
              "Shown, and changes to it dropped. An identifier the API owns after the first write.",
          },
          {
            name: "preCreate",
            type: "(data, context) => data",
            description:
              "Runs on the payload of a create only. The tenant, the owner, the parent of a sub-view.",
          },
          {
            name: "preUpdate",
            type: "(data, context) => data",
            description: "Runs on the payload of an update only.",
          },
        ]}
      />

      <P>
        Both hooks receive the surrounding{" "}
        <A href="/docs/resource-view/sub-views">view context</A>, which is how a
        record created from a tab arrives already attached to the record whose tab it
        was created from — without a hidden field carrying the parent's id through
        the form.
      </P>

      <H2 id="read-delete">Reading and deleting</H2>

      <P>
        The other two actions are forms as well, and are asymmetric more often than
        they look.
      </P>

      <CodeBlock>{READ_DELETE}</CodeBlock>

      <Ul>
        <Li>
          <C>views.read</C> is the one place a resource can afford to show
          everything — a row has a width, a detail page does not. It is also where{" "}
          <A href="/docs/resource-view/sub-views">sub-views</A> hang.
        </Li>
        <Li>
          <C>views.delete</C> is the one action that starts as a dialog rather than a
          page: a confirmation that replaced the page would take away the list it is
          asking about.
        </Li>
      </Ul>

      <H3>Next</H3>

      <P>
        The forms of a resource are ordinary <A href="/docs/form">react-data-form</A>{" "}
        descriptions, so everything that library documents applies here —{" "}
        <A href="/docs/form/groups">groups</A>,{" "}
        <A href="/docs/form/steps">multi-step forms</A> and{" "}
        <A href="/docs/form/validation">the mapping of a 422 back onto fields</A>. And{" "}
        <A href="/docs/resource-view/backends">the dialect</A> is what decides how a
        validation failure was spelled in the first place.
      </P>
    </DocArticle>
  )
}
