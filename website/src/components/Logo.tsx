import { cn } from "@/lib/cn"

/**
 * Two overlapping rounded squares: the form on the left, the view on the right,
 * in the same two hues the sidebar is split with.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden
      fill="none"
    >
      <rect
        x="2"
        y="7"
        width="17"
        height="18"
        rx="5"
        className="fill-form"
        opacity="0.9"
      />
      <rect
        x="13"
        y="7"
        width="17"
        height="18"
        rx="5"
        className="fill-view"
        opacity="0.85"
      />
      <path
        d="M7 13h7M7 17h5"
        className="stroke-background"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 13h5M20 17h5M20 21h5"
        className="stroke-background"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}
