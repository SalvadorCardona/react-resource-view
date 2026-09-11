/**
 * The media library the builder picks its images from.
 *
 * Every visual is an SVG written here and served as a data URI. A page builder
 * demo that fetched photographs would spend its first second being a demo of
 * the network, and would break the day the host it borrowed them from moved
 * them — these load with the page, work offline, and cost no request.
 *
 * An application would hand the same field a real library instead: the values
 * below are plain strings, and the controller does not care whether they point
 * at a data URI or at a CDN.
 */

export interface Artwork {
  /** Stored on the block, so the value survives a reload of the sample data. */
  id: string
  label: string
  /** Ready for `<img src>`. */
  src: string
}

/**
 * One abstract landscape: a graded sky, a sun and two ridges.
 *
 * The same drawing every time, recoloured — what varies between two entries of
 * the library is only the palette, which is enough to tell them apart in a
 * gallery without pretending to be photography.
 */
function artwork(
  id: string,
  label: string,
  {
    sky,
    dusk,
    sun,
    near,
    far,
  }: Record<"sky" | "dusk" | "sun" | "near" | "far", string>
): Artwork {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${dusk}"/></linearGradient></defs>
<rect width="640" height="400" fill="url(#s)"/>
<circle cx="470" cy="120" r="56" fill="${sun}" opacity="0.9"/>
<path d="M0 300 C 120 230 200 300 300 268 C 400 236 520 292 640 250 L640 400 L0 400 Z" fill="${far}" opacity="0.75"/>
<path d="M0 338 C 140 292 260 356 380 324 C 500 292 580 340 640 320 L640 400 L0 400 Z" fill="${near}"/>
</svg>`

  return { id, label, src: `data:image/svg+xml,${encodeURIComponent(svg)}` }
}

export const MEDIA_LIBRARY: Artwork[] = [
  artwork("sunrise", "Sunrise", {
    sky: "#fde7c7",
    dusk: "#f3b27a",
    sun: "#fb923c",
    near: "#7c2d12",
    far: "#c2410c",
  }),
  artwork("harbour", "Harbour", {
    sky: "#cfe8ff",
    dusk: "#7fb3e8",
    sun: "#fef3c7",
    near: "#1e3a5f",
    far: "#2f5f8f",
  }),
  artwork("orchard", "Orchard", {
    sky: "#e8f5d8",
    dusk: "#a7cf86",
    sun: "#fef08a",
    near: "#1f3d24",
    far: "#3f6b3a",
  }),
  artwork("dusk", "Dusk", {
    sky: "#f3d5f5",
    dusk: "#9a7bd0",
    sun: "#fbcfe8",
    near: "#2e1065",
    far: "#5b21b6",
  }),
  artwork("studio", "Studio", {
    sky: "#f5f5f4",
    dusk: "#d6d3d1",
    sun: "#fafaf9",
    near: "#292524",
    far: "#57534e",
  }),
  artwork("night", "Night", {
    sky: "#1e293b",
    dusk: "#0f172a",
    sun: "#e2e8f0",
    near: "#020617",
    far: "#1e293b",
  }),
]

/** The library as a picker's options — label on screen, id in the payload. */
export const MEDIA_OPTIONS = MEDIA_LIBRARY.map((item) => ({
  label: item.label,
  value: item.id,
}))

/**
 * The `src` a stored value points at.
 *
 * A value is either an id from the library or, when the reader uploaded a file
 * of their own, the data URI `FileInputController` produced — which is already
 * a `src`, and is returned as it stands.
 */
export function artworkSrc(value?: string | null): string | undefined {
  if (!value) return undefined

  return MEDIA_LIBRARY.find((item) => item.id === value)?.src ?? value
}
