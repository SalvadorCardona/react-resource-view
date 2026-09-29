/**
 * An `href` leading out of the application — `https://…`, `mailto:…` — rather
 * than to one of its pages.
 */
export function isExternalHref(href?: string): boolean {
  return !!href && /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href)
}

/**
 * Props for an anchor leaving the application: a web page opens in a new tab,
 * so the back office stays where it was; a `mailto:` or `tel:` link just hands
 * over to the application that handles it.
 */
export function externalLinkProps(href: string) {
  return /^(https?:)?\/\//i.test(href)
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href }
}
