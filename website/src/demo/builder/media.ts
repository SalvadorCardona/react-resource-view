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

type Palette = Record<"sky" | "dusk" | "sun" | "near" | "far", string>

/**
 * The grain every drawing is finished with.
 *
 * Flat gradients are what makes generated artwork read as a placeholder; a
 * little noise over them is most of the distance to something one would accept
 * as a picture. Cheap, too: one filter, no extra bytes on the wire.
 */
const GRAIN = `<filter id="g" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/>
</filter>`

function svg(palette: Palette, body: string): string {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${palette.sky}"/><stop offset="1" stop-color="${palette.dusk}"/></linearGradient>${GRAIN}</defs>
<rect width="640" height="400" fill="url(#s)"/>
${body}
<rect width="640" height="400" filter="url(#g)" opacity="0.14"/>
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(source)}`
}

/**
 * The compositions the library is drawn from.
 *
 * One drawing recoloured six times was the whole library until now, and it
 * showed: a hero and the three pictures of the gallery under it were the same
 * sunset four times over. What tells two images apart in a gallery is their
 * composition, not their palette, so each entry gets a shape of its own.
 */
const SHAPES: Record<string, (palette: Palette) => string> = {
  /** Two ridges under a low sun — the one drawing this library started from. */
  ridges: ({ sun, near, far }) => `<circle cx="470" cy="120" r="56" fill="${sun}" opacity="0.9"/>
<path d="M0 300 C 120 230 200 300 300 268 C 400 236 520 292 640 250 L640 400 L0 400 Z" fill="${far}" opacity="0.75"/>
<path d="M0 338 C 140 292 260 356 380 324 C 500 292 580 340 640 320 L640 400 L0 400 Z" fill="${near}"/>`,

  /** Concentric arcs rising out of the bottom edge. */
  arcs: ({ sun, near, far }) => `<g fill="none" stroke-linecap="round">
<circle cx="320" cy="400" r="260" stroke="${far}" stroke-width="26" opacity="0.45"/>
<circle cx="320" cy="400" r="190" stroke="${near}" stroke-width="30" opacity="0.7"/>
<circle cx="320" cy="400" r="120" stroke="${far}" stroke-width="34"/>
</g>
<circle cx="140" cy="110" r="34" fill="${sun}" opacity="0.85"/>`,

  /** A canopy: overlapping discs, heavier towards the top. */
  canopy: ({ sun, near, far }) => `<g opacity="0.85">
<circle cx="150" cy="150" r="96" fill="${far}"/>
<circle cx="300" cy="96" r="72" fill="${near}" opacity="0.8"/>
<circle cx="430" cy="170" r="118" fill="${far}"/>
<circle cx="560" cy="110" r="64" fill="${near}" opacity="0.7"/>
</g>
<rect x="0" y="300" width="640" height="100" fill="${near}"/>
<circle cx="70" cy="70" r="30" fill="${sun}" opacity="0.8"/>`,

  /** Two soft blooms, the shape a portrait backdrop wants. */
  bloom: ({ sun, near, far }) => `<g opacity="0.75">
<ellipse cx="220" cy="180" rx="210" ry="150" fill="${far}"/>
<ellipse cx="450" cy="260" rx="230" ry="160" fill="${near}"/>
</g>
<circle cx="500" cy="110" r="46" fill="${sun}" opacity="0.65"/>`,

  /** Planes cutting across each other, the way a room does in a photograph. */
  planes: ({ sun, near, far }) => `<path d="M0 400 L0 168 L280 92 L280 400 Z" fill="${near}" opacity="0.9"/>
<path d="M280 400 L280 92 L470 148 L470 400 Z" fill="${far}" opacity="0.8"/>
<path d="M470 400 L470 148 L640 104 L640 400 Z" fill="${near}" opacity="0.6"/>
<path d="M0 400 L640 296 L640 400 Z" fill="${far}" opacity="0.5"/>
<circle cx="536" cy="64" r="30" fill="${sun}" opacity="0.8"/>`,

  /** Long swells, drawn light on dark. */
  waves: ({ sun, near, far }) => `<g fill="none" stroke-linecap="round">
${[0, 1, 2, 3, 4]
  .map(
    (index) =>
      `<path d="M0 ${150 + index * 46} C 160 ${110 + index * 46} 320 ${190 + index * 46} 640 ${140 + index * 46}" stroke="${index % 2 ? near : far}" stroke-width="${10 - index}" opacity="${0.8 - index * 0.1}"/>`
  )
  .join("")}
</g>
<circle cx="110" cy="80" r="26" fill="${sun}" opacity="0.7"/>`,
}

function artwork(
  id: string,
  label: string,
  shape: keyof typeof SHAPES,
  palette: Palette
): Artwork {
  return { id, label, src: svg(palette, SHAPES[shape](palette)) }
}

export const MEDIA_LIBRARY: Artwork[] = [
  artwork("sunrise", "Sunrise", "ridges", {
    sky: "#fde7c7",
    dusk: "#f3b27a",
    sun: "#fb923c",
    near: "#7c2d12",
    far: "#c2410c",
  }),
  artwork("harbour", "Harbour", "arcs", {
    sky: "#cfe8ff",
    dusk: "#7fb3e8",
    sun: "#fef3c7",
    near: "#1e3a5f",
    far: "#2f5f8f",
  }),
  artwork("orchard", "Orchard", "canopy", {
    sky: "#e8f5d8",
    dusk: "#a7cf86",
    sun: "#fef08a",
    near: "#1f3d24",
    far: "#3f6b3a",
  }),
  artwork("dusk", "Dusk", "bloom", {
    sky: "#f3d5f5",
    dusk: "#9a7bd0",
    sun: "#fbcfe8",
    near: "#2e1065",
    far: "#5b21b6",
  }),
  artwork("studio", "Studio", "planes", {
    sky: "#f5efe7",
    dusk: "#cbbfae",
    sun: "#f0a868",
    near: "#4a4038",
    far: "#8c7c6b",
  }),
  artwork("night", "Night", "waves", {
    sky: "#243b55",
    dusk: "#0b1220",
    sun: "#e2e8f0",
    near: "#7dd3fc",
    far: "#38bdf8",
  }),
]

/**
 * The portraits the résumé's identity block picks from.
 *
 * A landscape in the round frame of a CV reads as a missing picture; these are
 * the same promise as the rest of the library — drawn here, no request — but of
 * a person rather than of a place.
 */
function portrait(
  id: string,
  label: string,
  { ground, shade, figure }: Record<"ground" | "shade" | "figure", string>
): Artwork {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ground}"/><stop offset="1" stop-color="${shade}"/></linearGradient>${GRAIN}</defs>
<rect width="320" height="320" fill="url(#p)"/>
<circle cx="160" cy="132" r="58" fill="${figure}"/>
<path d="M40 320 C 52 232 100 200 160 200 C 220 200 268 232 280 320 Z" fill="${figure}"/>
<rect width="320" height="320" filter="url(#g)" opacity="0.12"/>
</svg>`

  return { id, label, src: `data:image/svg+xml,${encodeURIComponent(source)}` }
}

export const PORTRAIT_LIBRARY: Artwork[] = [
  portrait("ink", "Ink", {
    ground: "#cbd5e1",
    shade: "#94a3b8",
    figure: "#1e293b",
  }),
  portrait("sand", "Sand", {
    ground: "#fde8cd",
    shade: "#f0b27a",
    figure: "#7c2d12",
  }),
  portrait("sage", "Sage", {
    ground: "#dcefdc",
    shade: "#9cc79c",
    figure: "#14532d",
  }),
  portrait("plum", "Plum", {
    ground: "#ecd9f5",
    shade: "#b795d8",
    figure: "#3b0764",
  }),
]

/** The library as a picker's options — label on screen, id in the payload. */
export const MEDIA_OPTIONS = MEDIA_LIBRARY.map((item) => ({
  label: item.label,
  value: item.id,
}))

export const PORTRAIT_OPTIONS = PORTRAIT_LIBRARY.map((item) => ({
  label: item.label,
  value: item.id,
}))

/**
 * The `src` a stored value points at.
 *
 * A value is either an id from one of the two libraries or, when the reader
 * uploaded a file of their own, the data URI `FileInputController` produced —
 * which is already a `src`, and is returned as it stands.
 */
export function artworkSrc(value?: string | null): string | undefined {
  if (!value) return undefined

  const found = [...MEDIA_LIBRARY, ...PORTRAIT_LIBRARY].find(
    (item) => item.id === value
  )

  return found?.src ?? value
}
