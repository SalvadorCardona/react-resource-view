import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  createViewResource,
  NavigationProgressBar,
  useDelayedVisibility,
} from "react-resource-view"
import { LoaderCircle } from "lucide-react"
import { CodeBlock, LiveExample, PageHeader, Section } from "../DocLayout"

const views = ["Tasks", "Projects", "Members"]

/** Fades its children in on mount, the way a view enters. */
function FadeIn({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    ref.current?.animate?.(
      [
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }
    )
  }, [])
  return <div ref={ref}>{children}</div>
}

/**
 * A slow navigation, simulated: the next view takes as long as chosen to load,
 * and the bar the library draws by default runs over it meanwhile.
 */
function SlowNavigationStory() {
  const [current, setCurrent] = useState(views[0])
  const [pending, setPending] = useState<{ to: string; duration: number }>()
  const visible = useDelayedVisibility(pending !== undefined)

  useEffect(() => {
    if (!pending) return
    const timer = setTimeout(() => {
      setCurrent(pending.to)
      setPending(undefined)
    }, pending.duration)
    return () => clearTimeout(timer)
  }, [pending])

  const next = views[(views.indexOf(current) + 1) % views.length]

  return (
    <div className="relative overflow-hidden rounded-lg border border-border">
      <NavigationProgressBar visible={visible} className="absolute" />
      <div className="flex flex-wrap gap-2 border-b border-border p-3">
        {[
          ["Instant (80 ms)", 80],
          ["Slow (1.5 s)", 1500],
          ["Very slow (4 s)", 4000],
        ].map(([label, duration]) => (
          <button
            key={label}
            type="button"
            disabled={pending !== undefined}
            onClick={() => setPending({ to: next, duration: Number(duration) })}
            className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
          >
            {label} → {next}
          </button>
        ))}
      </div>
      <div className="p-4" aria-busy={pending !== undefined || undefined}>
        <FadeIn key={current}>
          <h3 className="text-lg font-semibold">{current}</h3>
          <p className="text-sm text-muted-foreground">
            The view on screen. Pick a speed above to move to the next one.
          </p>
        </FadeIn>
      </div>
    </div>
  )
}

const navigationResource = createViewResource("navigation", {
  name: "Navigation",
  icon: LoaderCircle,
  components: {
    view: () => (
      <>
        <PageHeader
          title="Navigation"
          intro="Moving to another view takes the time the next one needs to load — its code, its permissions, its data. A thin bar along the top of the screen says the click was heard, and the new view fades in once it is there."
        />

        <Section
          title="By default"
          intro="Nothing to configure, and nothing to install: React and a few inline styles, in the theme's primary colour."
        >
          <LiveExample label="A slow navigation, simulated">
            <SlowNavigationStory />
          </LiveExample>
          <p>
            The bar waits 150 ms before showing, so a navigation that is instant
            flashes nothing; once shown, it stays 300 ms at least, so it does not
            jump away. It runs quickly, then slower and slower, and fills up only
            when the new view has its data. The view slides up a few pixels as it
            fades in — it only fades for a reader who prefers reduced motion.
          </p>
          <p>
            While it loads, the view is marked <code>aria-busy</code> and the bar has{" "}
            <code>role=&quot;progressbar&quot;</code>; neither takes the focus.
          </p>
        </Section>

        <Section
          title="Your own loader, or none"
          intro="ResourceViewProvider takes two options."
        >
          <CodeBlock>{configuration}</CodeBlock>
          <p>
            A node is drawn while a navigation is under way; a component is always
            mounted and receives <code>isNavigating</code>. Both are already delayed.{" "}
            <code>useIsNavigating()</code> gives the raw signal, and{" "}
            <code>useDelayedVisibility()</code> the delay, for an indicator drawn
            elsewhere.
          </p>
        </Section>

        <Section
          title="With any router"
          intro="The library counts a navigation from a click on one of its links, or a call to its navigate, until the new view has loaded."
        >
          <p>
            A router that knows more — the code and loaders of a route it is
            resolving — says so through the optional <code>useIsNavigating</code> of
            the navigation port. The TanStack Router adapter does:
          </p>
          <CodeBlock>{port}</CodeBlock>
        </Section>
      </>
    ),
  },
})

const configuration = `<ResourceViewProvider
  configuration={{
    // a node, a component, or false for nothing
    navigationLoader: ({ isNavigating }) => <PageLoader isLoading={isNavigating} />,
    // true by default
    viewTransition: false,
  }}
/>`

const port = `configurePorts({
  navigation: {
    ...myRouterAdapter,
    useIsNavigating: () =>
      useRouterState({ select: (state) => state.status === "pending" }),
  },
})`

export default navigationResource
