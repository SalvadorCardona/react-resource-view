import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Boxes,
  Braces,
  Compass,
  Languages,
  LayoutGrid,
  Link2,
  MousePointerClick,
  PlugZap,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Header } from "@/components/Header"
import { HeroBackdrop } from "@/components/HeroBackdrop"
import { HomeBuilder } from "@/components/HomeBuilder"
import { InstallCommand } from "@/components/InstallCommand"
import { LayoutGallery } from "@/components/LayoutGallery"
import { Logo } from "@/components/Logo"
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
      <Layouts />
      <Features />
      <Closing />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

const STATS = [
  { value: "2", label: "packages" },
  { value: "40+", label: "field controllers" },
  { value: "7", label: "layouts" },
  { value: "0", label: "column definitions" },
]

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <HeroBackdrop />

      <div className="relative mx-auto max-w-5xl px-4 py-24 text-center lg:px-8 lg:py-32">
        <p
          className="rise mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          style={{ animationDelay: "40ms" }}
        >
          <Sparkles className="size-3.5 text-primary" />
          Two packages, one idea: describe it, don’t draw it
        </p>

        <h1
          className="rise mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ animationDelay: "100ms" }}
        >
          Forms and CRUD views that come out of a{" "}
          <span className="bg-gradient-to-r from-form to-view bg-clip-text text-transparent">
            description
          </span>
          , not a template
        </h1>

        <p
          className="rise mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          <strong className="font-medium text-foreground">react-data-form</strong>{" "}
          turns an object into a form that holds its own state, validates, and
          reports what your API sends back.{" "}
          <strong className="font-medium text-foreground">
            react-resource-view
          </strong>{" "}
          takes one resource declaration and renders its list, detail, create, edit
          and delete screens — wired to your API and to the URL.
        </p>

        <div
          className="rise mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "220ms" }}
        >
          <a
            href="#try"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <MousePointerClick className="size-4" />
            Try it right here
          </a>
          <Link
            to="/docs/form"
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Read the documentation
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/playground"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <Compass className="size-4" />
            Playground
          </Link>
        </div>

        <div className="rise mt-10" style={{ animationDelay: "280ms" }}>
          <InstallCommand packages="react-data-form react-resource-view" />
        </div>

        <dl
          className="rise mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4"
          style={{ animationDelay: "340ms" }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <dt className="text-2xl font-semibold tracking-tight">{value}</dt>
              <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
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
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl",
                isForm ? "hover:border-form/50" : "hover:border-view/50"
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-1",
                  isForm ? "bg-form" : "bg-view"
                )}
              />

              {/* A wash of the package's own hue, on hover. */}
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100",
                  isForm
                    ? "bg-gradient-to-br from-form-soft/50 to-transparent"
                    : "bg-gradient-to-br from-view-soft/50 to-transparent"
                )}
                aria-hidden
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110",
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
                <p className="mt-3 text-sm text-muted-foreground">
                  {section.tagline}
                </p>

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
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function OneDescription() {
  return (
    <section id="try" className="scroll-mt-20 border-y border-border bg-muted/25 py-20">
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
            API receives — so take the description below apart and watch both halves
            follow.
          </p>
        </header>

        <div className="mt-10">
          <HomeBuilder />
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function Layouts() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-view">
          Read many ways
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Seven layouts, one resource
        </h2>
        <p className="mt-3 text-muted-foreground">
          A layout is a line in <code className="font-mono text-sm">viewVariants</code>
          , not a screen you build. Declare several and the reader picks — the
          filters, the permissions and the forms carry over untouched.
        </p>
      </header>

      <div className="mt-10">
        <LayoutGallery />
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
    title: "API Platform, Strapi, Supabase",
    body: "A dialect holds what each backend spells differently — pages, filters, envelopes, errors — so one declared resource renders against any of the three, or a fourth you write.",
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
    <section className="mx-auto max-w-6xl px-4 pb-20 lg:px-8">
      <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
        Opinionated about description, agnostic about everything else
      </h2>

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="group relative bg-background p-6 transition-colors hover:bg-muted/40"
          >
            <span
              className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden
            />
            <Icon className="size-5 text-primary transition-transform duration-300 group-hover:-translate-y-0.5" />
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

        <p className="mt-7 text-sm text-muted-foreground">
          Both are written and maintained by Salvador Cardona — the rest of his work
          is on{" "}
          <a
            href="https://cardona.digital"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            the author’s portfolio
          </a>
          .
        </p>
      </div>
    </section>
  )
}
