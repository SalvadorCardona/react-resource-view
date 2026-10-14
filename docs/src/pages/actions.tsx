import { createViewResource } from "react-resource-view"
import { MousePointerClick } from "lucide-react"
import { CodeBlock, PageHeader, Section } from "../DocLayout"

const actionsResource = createViewResource("actions", {
  name: "Actions",
  icon: MousePointerClick,
  components: {
    view: () => (
      <>
        <PageHeader
          title="Actions"
          intro="Read, create, update and delete: where each one opens, and what the list shows while the API is answering."
        />

        <Section
          title="Where an action opens"
          intro="views.<action>.open: the whole page, a dialog over it, or a drawer sliding in. A direct link always opens the page."
        >
          <CodeBlock>{open}</CodeBlock>
        </Section>

        <Section
          title="Open in full page"
          intro="A dialog or a drawer may be too narrow for its record. expandable puts a link to the same view on its own page beside the close button."
        >
          <CodeBlock>{expandable}</CodeBlock>
          <p>
            It is on by default for <code>read</code> and <code>update</code>, whose
            content may be long, and off for <code>create</code> and{" "}
            <code>delete</code> — a confirmation has no page worth opening. The
            records a board opens with <code>openRecord</code> follow the view they
            open, unless <code>layout.board()</code> says otherwise.
          </p>
          <p>
            The button is a real link: Ctrl/Cmd+click opens the page in a new tab and
            leaves the window where it is.
          </p>
        </Section>

        <Section
          title="Optimistic writes"
          intro="Every write — a form saved, a row deleted, a cell edited in place, a card moved — is drawn before the API answers."
        >
          <ul>
            <li>
              the list shows the expected result at once; a record being created
              appears, dimmed, before it has an id;
            </li>
            <li>
              the API's answer replaces it as soon as it comes — its generated id,
              its computed fields;
            </li>
            <li>
              a refusal puts the row back and says why in a toast; a form keeps the
              API's violations on its fields;
            </li>
            <li>
              several writes to one record show the last one, and a list read again
              while a write is in flight — a realtime push — keeps the row as
              written.
            </li>
          </ul>
          <CodeBlock>{optimistic}</CodeBlock>
          <p>
            An in-place edit and a card moved are updates: they follow{" "}
            <code>views.update.optimistic</code>.
          </p>
        </Section>

        <Section
          title="Your own actions"
          intro="useResourceMutation gives an application's business actions the same optimism and the same rollback."
        >
          <CodeBlock>{mutation}</CodeBlock>
          <p>
            Every call resolves with the API's answer, or rejects once the record is
            back to what it was — after a toast, unless <code>notify: false</code>. A
            board's <code>bulkActions</code> receive the same object as their second
            argument.
          </p>
        </Section>
      </>
    ),
  },
})

const open = `views: {
  read: { open: "drawer" },
  update: { open: "dialog", afterSave: "close" },
  delete: { open: "dialog" }, // the default for a deletion
}`

const expandable = `views: {
  read: { open: "drawer", expandable: true },    // the default
  update: { open: "dialog", expandable: false }, // no link to the page
}

layout.board({ groupBy: "status", columns: STATUSES, openRecord: "drawer", expandable: true })`

const optimistic = `createViewResource<Task>("tasks", {
  path: "/api/tasks",
  optimistic: true, // the default
  views: {
    // A deletion the server must confirm before the row goes.
    delete: { optimistic: false },
  },
})`

const mutation = `import { useResourceMutation } from "react-resource-view"

function AssignToMe({ task }: { task: Task }) {
  const tasks = useResourceMutation(tasksResource)

  return (
    <button
      onClick={() =>
        tasks.mutate({
          item: task,
          change: { assignee: me["@id"] },
          request: () => api.post(\`/api/tasks/\${task.id}/assign\`),
        })
      }
    >
      Assign to me
    </button>
  )
}

// Also: tasks.create(data), tasks.update(data), tasks.remove(task),
// tasks.isPending(task)`

export default actionsResource
