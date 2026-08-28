import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Boxes,
  Braces,
  Compass,
  Github,
  Languages,
  LayoutGrid,
  Link2,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react"
import { CodeBlock } from "@/components/CodeBlock"
import { Demo } from "@/components/Demo"
import { FormDemo } from "@/components/FormDemo"
import { Header } from "@/components/Header"
import { Logo } from "@/components/Logo"
import { ResourceDemo } from "@/components/ResourceDemo"
import { articlesResource } from "@/demo/resources"
import { FORM_SECTION, VIEW_SECTION } from "@/lib/navigation"
import { cn } from "@/lib/cn"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Packages />
      <OneDescription />
      <Features />
      <Closing />
      <Footer />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-dotted absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-accent/40 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-24 text-center lg:px-8 lg:py-32">
        <p className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          Two packages, one idea: describe it, don’t draw it
        </p>

        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Forms and CRUD views that come out of a{" "}
          <span className="bg-gradient-to-r from-form to-view bg-clip-text text-transparent">
            description
          </span>
          , not a template
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          <strong className="font-medium text-foreground">react-data-form</strong>{" "}
          turns an object into a form that holds its own state, validates, and
          reports what your API sends back.{" "}
          <strong className="font-medium text-foreground">
            react-resource-view
          </strong>{" "}
          takes one resource declaration and renders its list, detail, create, edit
          and delete screens — wired to a JSON-LD API and to the URL.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/docs/form"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Read the documentation
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/playground"
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            <Compass className="size-4" />
            Open the playground
          </Link>
        </div>

        <div className="mx-auto mt-10 w-fit rounded-lg border border-border bg-background/80 px-4 py-2 backdrop-blur">
          <code className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Terminal className="size-3.5" />
            pnpm add react-data-form react-resource-view
          </code>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

const PACKAGES = [
  {
    section: FORM_SECTION,
    icon: Braces,
    points: [
      "Forty-odd field controllers, from a text input to a page builder",
      "Groups, steps, sub-forms and repeatable rows",
      "API Platform violations mapped straight back onto the fields",
    ],
    install: "pnpm add react-data-form react-mini-i18n resource-registry",
  },
  {
    section: VIEW_SECTION,
    icon: LayoutGrid,
    points: [
      "Seven layouts over one collection — table, cards, split, calendar…",
      "Filters, pagination and the chosen layout all live in the URL",
      "Bring your own router: four primitives, or the TanStack adapter",
    ],
    install: "pnpm add react-resource-view react-data-form",
  },
]

function Packages() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        {PACKAGES.map(({ section, icon: Icon, points, install }) => {
          const isForm = section.accent === "form"

          return (
            <Link
              key={section.id}
              to={`/docs/${section.id}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:shadow-lg",
                isForm ? "hover:border-form/50" : "hover:border-view/50"
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-1",
                  isForm ? "bg-form" : "bg-view"
                )}
              />

              <div className="flex items-start justify-between gap-4">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    isForm ? "bg-form-soft text-form" : "bg-view-soft text-view"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight">
                {section.label}
              </h2>
              <p
                className={cn(
                  "mt-1 font-mono text-xs",
                  isForm ? "text-form" : "text-view"
                )}
              >
                {section.pkg}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{section.tagline}</p>

              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <span
                      className={cn(
                        "mt-2 size-1 shrink-0 rounded-full",
                        isForm ? "bg-form" : "bg-view"
                      )}
                    />
                    {point}
                  </li>
                ))}
              </ul>

              <code className="mt-6 block overflow-x-auto rounded-lg border border-border bg-code-bg px-3 py-2 font-mono text-[11px] text-muted-foreground">
                {install}
              </code>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

const DESCRIPTION_SNIPPET = `const articleForm = {
  inputs: {
    title: { label: "Title", required: true },
    author: { label: "Author" },
    status: {
      label: "Status",
      controller: SelectInputController,
      valueOptions: ARTICLE_STATUSES,
    },
    readingTime: { label: "Minutes", controller: NumberInputController },
    publishedAt: { label: "Published on", controller: DatePickerInputController },
  },
}

// The same description is the form…
useForm({ form: articleForm })

// …and the list's columns.
createViewResource("articles", {
  path: "/api/articles",
  view: { form: articleForm, viewVariants: [tableViewOptionFactory()] },
})`

function OneDescription() {
  return (
    <section className="border-y border-border bg-muted/25 py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Written once
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            One description, every screen
          </h2>
          <p className="mt-3 text-muted-foreground">
            A list has no separate column definition. The fields you describe are the
            form the reader edits, the columns the table shows and the payload your
            API receives. Both examples below read the same object.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <CodeBlock filename="articles.ts">{DESCRIPTION_SNIPPET}</CodeBlock>
          </div>

          <div className="space-y-6">
            <Demo label="The form">
              <FormDemo
                showPayload={false}
                form={{
                  label: { title: "New article", submit: "Publish" },
                  inputs: {
                    title: { label: "Title", required: true },
                    author: { label: "Author" },
                  },
                }}
              />
            </Demo>

            <Demo label="The list, same fields">
              <ResourceDemo resource={articlesResource} variant="table" />
            </Demo>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: Link2,
    title: "The URL is the state",
    body: "Filters, pagination, the chosen layout and the open item all live in the address bar. A shared link reopens exactly what the sender was looking at.",
  },
  {
    icon: PlugZap,
    title: "Ports, not assumptions",
    body: "Neither package knows your router, your API client or your brand. Each touch point is a port with a default, injected once at startup.",
  },
  {
    icon: Boxes,
    title: "Built for JSON-LD",
    body: "Hydra collections, IRIs and API Platform violations are first-class — and nothing stops you pointing them at a plain REST API instead.",
  },
  {
    icon: ShieldCheck,
    title: "Validation on both sides",
    body: "A validator per field for the browser, and a mapper that puts a 422 from the server back on the fields that caused it.",
  },
  {
    icon: Languages,
    title: "One dictionary",
    body: "Labels go through react-mini-i18n, so your application and the libraries translate from the same place.",
  },
  {
    icon: LayoutGrid,
    title: "Seven layouts, one resource",
    body: "Table, cards, item list, columns, split, calendar and timeline — declared side by side, switched by the reader.",
  },
]

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
      <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
        Opinionated about description, agnostic about everything else
      </h2>

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <article key={title} className="bg-background p-6">
            <Icon className="size-5 text-primary" />
            <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function Closing() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-form-soft/60 via-background to-view-soft/60 p-10 text-center">
        <Logo className="mx-auto size-10" />
        <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
          Start with the forms, then declare a resource
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          The view package builds on the form package, so the documentation reads in
          that order — but each half stands on its own.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/docs/form"
            className="rounded-lg bg-form px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            react-data-form
          </Link>
          <Link
            to="/docs/resource-view"
            className="rounded-lg bg-view px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            react-resource-view
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p className="flex items-center gap-2">
          <Logo className="size-5" />
          MIT · built by Salvador Cardona
        </p>

        <nav className="flex flex-wrap items-center gap-4">
          <a
            href={FORM_SECTION.repository}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Github className="size-3.5" />
            react-data-form
          </a>
          <a
            href={VIEW_SECTION.repository}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Github className="size-3.5" />
            react-resource-view
          </a>
        </nav>
      </div>
    </footer>
  )
}
