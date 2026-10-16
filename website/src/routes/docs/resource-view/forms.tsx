import { createFileRoute } from "@tanstack/react-router"
import { ActionList } from "react-data-form"
import { Callout } from "@/components/Callout"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { DocArticle } from "@/components/DocArticle"
import { PropsTable } from "@/components/PropsTable"
import { ResourceDemo } from "@/components/ResourceDemo"
import { A, C, H2, H3, Li, P, Term, Ul } from "@/components/prose"
import { drawerArticlesResource } from "@/demo/resources"

export const Route = createFileRoute("/docs/resource-view/forms")({
  head: () => ({
    meta: [
      { title: "A form per action — react-resource-view" },
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
  // Read by the list's columns, the create form, the edit form and the
  // detail page — all four at once.
  form: {
    inputs: {
      title: { label: "Title", required: true },
      author: { label: "Author" },
      status: { label: "Status", controller: SelectInputController, valueOptions: STATUSES },
    },
  },
})`

const ASYMMETRIC = `createViewResource("articles", {
  path: "/api/articles",
  // The columns, and the edit form: everything an article has.
  form: articleForm,
  views: {
    // Creating asks for what a draft cannot exist without. The rest is
    // filled in afterwards, from the edit form. The create form is merged
    // over the shared one, so it only says what it takes away.
    create: {
      form: {
        inputs: {
          author: false,
          status: false,
          readingTime: false,
          publishedAt: false,
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

// <Item, Write> — the second one is the write shape.
createViewResource<Article, ArticleWrite>("articles", {
  path: "/api/articles",
  form: writeForm,            // typed against ArticleWrite
})`

const TRIMMING = `views: {
  create: {
    form: {
      inputs: {
        // Never asked for, never validated, never a column — supplied below.
        workspace: { generatedValue: true },
      },
    },
  },
  update: {
    form: {
      inputs: {
        // Shown, but the reader cannot move it.
        slug: { readonly: true },
      },
    },
  },
},

hooks: {
  // The value the create form deliberately does not ask for.
  beforeCreate: (data, { viewResourceContext }) => ({
    ...data,
    workspace: viewResourceContext?.filter?.workspace,
  }),
},`

const READ_DELETE = `views: {
  // A detail page carrying more than the list does.
  read: { form: detailForm },
  // The confirmation is a form too — usually an empty one.
  delete: { buttonLabel: "Delete this article" },
}`

function Forms() {
  return (
    <DocArticle
      toc={[
        { id: "shared", title: "One description, four screens" },
        { id: "asymmetric", title: "When creating is not editing" },
        { id: "replacing", title: "A form merges, it does not replace" },
        { id: "types", title: "The read shape and the write shape" },
        { id: "trimming", title: "Fields the reader never fills" },
        { id: "read-delete", title: "Reading and deleting" },
      ]}
    >
      <P>
        The default is that every action of a <Term id="resource">resource</Term>{" "}
        shares one <Term id="form">form</Term>: the columns of the list, the create
        form and the edit form are the same description read four times, and that is
        what makes a resource cheap to declare.
      </P>

      <P>
        It is also, often enough, a lie. Creating an article is not editing one —
        half the fields do not exist yet, and a couple of them the reader is never
        allowed to touch again. This page is about saying so.
      </P>

      <H2 id="shared">One description, four screens</H2>

      <P>
        The root <C>form</C> is the description every action starts from. Declared
        alone, it drives the lot:
      </P>

      <CodeBlock>{SHARED}</CodeBlock>

      <PropsTable
        rows={[
          {
            name: "form",
            type: "FormDefinition",
            description:
              "The shared description. The table's columns, and the form every action falls back to.",
          },
          {
            name: "views.create.form",
            type: "FormDefinition",
            description: "Only the creation form, merged over the shared one.",
          },
          {
            name: "views.update.form",
            type: "FormDefinition",
            description: "Only the edit form — the one a row's edit button opens.",
          },
          {
            name: "views.read.form",
            type: "FormDefinition",
            description: (
              <>
                The detail page. Rendered with the form's <C>action</C> forced to{" "}
                <C>read</C>, so the fields display rather than accept input.
              </>
            ),
          },
          {
            name: "views.list.form",
            type: "FormDefinition",
            description: (
              <>
                The columns, when the table should show something other than what the
                forms ask for. A <A href="/docs/resource-view/layouts">layout</A> can
                narrow it further still, with <C>fields</C>.
              </>
            ),
          },
        ]}
      />

      <H2 id="asymmetric">When creating is not editing</H2>

      <P>
        A per-action declaration is the shared form plus what differs. Below, the
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
        the filters and the <Term id="repository">repository</Term> are still read
        from the same place.
      </P>

      <Callout kind="tip" title="Each action names itself">
        <P>
          An action that declares no <C>title</C> takes the resource's name,
          prefixed:{" "}
          <C>Create — Articles</C>, <C>Edit — Articles</C>, <C>Delete — Articles</C>.
          That name is what a dialog and a drawer are titled with, so an overlay
          always says which record it is about. <C>views.create.title</C> overrides
          it, and <C>views.create.buttonLabel</C> renames the button rather than the
          screen.
        </P>
      </Callout>

      <H2 id="replacing">A form merges, it does not replace</H2>

      <Callout kind="tip" title="The one to know before writing an override">
        <P>
          <C>views.&lt;action&gt;</C> is merged over the root of the declaration,
          deeply. So <C>views.create.form</C> only says what differs: an input it
          names is adjusted, an input it sets to <C>false</C> is gone, and every
          other field is inherited as it is.
        </P>
      </Callout>

      <P>
        Which keeps the override next to the shared description without the two
        drifting — the label, the <Term id="controller">controller</Term> and the
        validation of a field stay written once:
      </P>

      <Ul>
        <Li>
          adjust a field — <C>title: {"{"} required: false {"}"}</C> — and the rest of
          its description is kept;
        </Li>
        <Li>
          remove one — <C>publishedAt: false</C> — when the action has no use for it;
        </Li>
        <Li>
          add one the shared form does not have, with its full description.
        </Li>
      </Ul>

      <P>
        Arrays and functions are replaced rather than merged: a{" "}
        <C>valueOptions</C> declared on an action is the whole list.
      </P>

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
            description:
              "What a read returns. Types the detail view, the rows, and every field option — titleField, layout.board({ groupBy })…",
          },
          {
            name: "Write",
            type: "object",
            default: "Item",
            description: (
              <>
                What a write accepts. Types the <C>form</C>s, <C>beforeCreate</C>{" "}
                and <C>beforeUpdate</C>.
              </>
            ),
          },
        ]}
      />

      <P>
        The second defaults to the first, so a resource whose API round-trips the
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
                from the table's columns. Pair it with <C>hooks.beforeCreate</C>.
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
            name: "hooks.beforeCreate",
            type: "(data, context) => data",
            description:
              "Runs on the payload of a create only. The tenant, the owner, the parent of a sub-view.",
          },
          {
            name: "hooks.beforeUpdate",
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
        The other two actions are forms as well, and differ from the shared one more
        often than they look.
      </P>

      <CodeBlock>{READ_DELETE}</CodeBlock>

      <Ul>
        <Li>
          <C>views.read</C> is the one place a resource can afford to show
          everything — a row has a width, a detail page does not. It is also where{" "}
          <A href="/docs/resource-view/sub-views">tabs</A> hang.
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
