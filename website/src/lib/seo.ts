import type { DocPage, DocSection } from "@/lib/navigation"
import { stripTrailingSlash } from "@/lib/navigation"

/** The domain the site is actually reachable at — GitHub Pages only hosts it. */
export const SITE_ORIGIN = "https://cardona.digital"

const AUTHOR = { "@type": "Person", name: "Salvador Cardona", url: SITE_ORIGIN }

/**
 * An absolute, canonical URL for a path served under the site's base.
 *
 * `import.meta.env.BASE_URL` already carries the `/<repository>/` prefix
 * GitHub Pages serves a project site under (see vite.config.ts), so building
 * the canonical from it is what keeps it correct in both dev and production
 * without a second constant to fall out of sync.
 */
export function canonicalUrl(pathname: string): string {
  const path = stripTrailingSlash(pathname)
  const suffix = path === "/" ? "" : path.slice(1)
  return `${SITE_ORIGIN}${import.meta.env.BASE_URL}${suffix}`
}

/** The image every page falls back to for Open Graph and Twitter Card. */
export function defaultOgImageUrl(): string {
  return `${SITE_ORIGIN}${import.meta.env.BASE_URL}og-image.jpg`
}

/** Structured data for a documentation page — read by crawlers, not readers. */
export function techArticleJsonLd(
  page: DocPage,
  section: DocSection,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.summary,
    url,
    inLanguage: "en",
    about: section.pkg,
    author: AUTHOR,
    publisher: AUTHOR,
    isPartOf: {
      "@type": "SoftwareSourceCode",
      name: section.pkg,
      codeRepository: section.repository,
    },
  }
}

/** Structured data for the packages the landing page introduces. */
export function softwareSourceCodeJsonLd(section: DocSection) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: section.pkg,
    description: section.tagline,
    codeRepository: section.repository,
    programmingLanguage: "TypeScript",
    license: "https://opensource.org/licenses/MIT",
    author: AUTHOR,
  }
}
