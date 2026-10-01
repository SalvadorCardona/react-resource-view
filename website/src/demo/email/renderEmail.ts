/**
 * An email, as the HTML a mailbox receives — and the plain text beside it.
 *
 * A pure function on purpose: no React, no DOM, no Tailwind, no import of any
 * kind. It takes the envelope and the blocks the builder stores and returns
 * strings, so it runs the same in the browser (the preview, the export), in
 * Node (the script that sends a test) and in a test runner, and it can be
 * copied as it stands into another project. See `README.md` next to it.
 *
 * Why it looks like 2005: an email is not a web page. Gmail, Outlook and Apple
 * Mail each support a different, smaller slice of CSS, and the slice they share
 * is tables, inline styles and hosted images —
 *
 * - layout in `<table role="presentation">`, 600px wide and fluid below that,
 *   never flex or grid;
 * - every style inline, on the element it styles. The one `<style>` in the head
 *   only *improves* things — the phone layout, the dark palette — and the mail
 *   still reads correctly in a client that throws it away;
 * - images as absolute URLs to PNG or JPEG files, each with its width, height
 *   and alt: Gmail blocks SVG and `data:` URIs outright;
 * - links as absolute URLs, and a button that is a link padded inside a
 *   coloured cell, with a VML shape for Outlook on Windows, which ignores the
 *   padding of a link;
 * - anything a reader typed is escaped, and rich text is cut down to the few
 *   tags every client draws the same way.
 */

/* -------------------------------------------------------------------------- */
/* The document                                                               */
/* -------------------------------------------------------------------------- */

/** The block types an email is assembled from — the `type` each block stores. */
export const EMAIL_HEADER = "email.header"
export const EMAIL_HERO = "email.hero"
export const EMAIL_TEXT = "email.text"
export const EMAIL_BUTTON = "email.button"
export const EMAIL_IMAGE = "email.image"
export const EMAIL_COLUMNS = "email.columns"
export const EMAIL_SEPARATOR = "email.separator"
export const EMAIL_FOOTER = "email.footer"

export type EmailBlockType =
  | typeof EMAIL_HEADER
  | typeof EMAIL_HERO
  | typeof EMAIL_TEXT
  | typeof EMAIL_BUTTON
  | typeof EMAIL_IMAGE
  | typeof EMAIL_COLUMNS
  | typeof EMAIL_SEPARATOR
  | typeof EMAIL_FOOTER

/** What a mailbox shows before the message is opened. */
export interface EmailEnvelope {
  subject?: string
  /** The grey line after the subject in the inbox. */
  preheader?: string
  fromName?: string
  /** `#rgb` or `#rrggbb`; anything else falls back to the default. */
  brandColor?: string
}

/**
 * A block, as the builder stores it: a `type` and the fields of that type.
 * Unknown types are skipped rather than failing the whole message.
 */
export interface EmailBlock {
  id?: string
  type?: string
  order?: number
  [key: string]: unknown
}

export interface EmailDocument {
  envelope: EmailEnvelope
  blocks: EmailBlock[]
}

export interface RenderEmailOptions {
  /**
   * Where the images of the library are served from, ending in `/` — the
   * deployed site, say `https://example.com/email/`. A block stores an image
   * as an id (`sunrise`), and its URL is this base, the id and `.png`.
   *
   * `cid:` is the other accepted value: every image then points at an inline
   * attachment (`cid:sunrise.png`), which is how a test is sent before the
   * files are online. A relative base is refused — a mailbox has no page to
   * resolve it against.
   */
  assetBaseUrl: string
}

export interface RenderedEmail {
  html: string
  /** The `text/plain` part sent alongside the HTML. */
  text: string
  /** The weight of `html`, in bytes of UTF-8. */
  size: number
}

/**
 * Past this weight Gmail cuts the message and shows "[Message clipped]",
 * hiding everything below — the footer and its unsubscribe link first.
 */
export const GMAIL_CLIP_LIMIT = 102 * 1024

/** The column every email is laid out in, and the widest it ever gets. */
export const EMAIL_WIDTH = 600

/* -------------------------------------------------------------------------- */
/* Palette and type                                                           */
/* -------------------------------------------------------------------------- */

const DEFAULT_BRAND = "#7c2d12"

/**
 * Warm greys rather than black on white: pure `#000` and `#fff` are what a
 * client's dark mode inverts most brutally, and a softer pair survives both
 * an inversion and the dark palette of the `<style>` below.
 */
const COLORS = {
  canvas: "#f4f1ec",
  card: "#ffffff",
  footer: "#faf8f5",
  text: "#2b2420",
  muted: "#6b625a",
  rule: "#e7e1d8",
}

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const SERIF = "Georgia, 'Times New Roman', Times, serif"

/** The gutter on either side of the content, at full width. */
const GUTTER = 32
const INNER = EMAIL_WIDTH - GUTTER * 2

/** The library is drawn at 16:10; a height attribute is required for Outlook. */
const RATIO = 10 / 16

/* -------------------------------------------------------------------------- */
/* Escaping                                                                   */
/* -------------------------------------------------------------------------- */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

/** Text and attribute values alike: nothing typed by a reader becomes markup. */
export function escapeHtml(value: unknown): string {
  return str(value).replace(/[&<>"']/g, (char) => ESCAPES[char])
}

/** Escaped, with the reader's line breaks kept. */
function escapeLines(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>")
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value)
}

function trimmed(value: unknown): string {
  return str(value).trim()
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : ""
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match
  })
}

/* -------------------------------------------------------------------------- */
/* URLs                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A link a mailbox can follow, or nothing.
 *
 * Only `http(s):` and `mailto:` survive — `javascript:` and relative paths do
 * not — and a bare domain typed into the field (`www.example.com`) is read as
 * the https address it obviously means.
 */
export function safeUrl(value: unknown): string | undefined {
  let candidate = trimmed(value)
  if (!candidate) return undefined

  if (candidate.startsWith("//")) candidate = `https:${candidate}`
  else if (/^[\w-]+(\.[\w-]+)+(?:[/?#:]|$)/.test(candidate)) {
    candidate = `https://${candidate}`
  }

  try {
    const url = new URL(candidate)
    if (url.protocol === "http:" || url.protocol === "https:") return url.href
    if (url.protocol === "mailto:") return candidate
  } catch {
    // Not a URL at all.
  }
  return undefined
}

function assetBase(options: RenderEmailOptions): string {
  const base = trimmed(options.assetBaseUrl)
  if (base === "cid:") return base
  if (!/^https?:\/\//i.test(base)) {
    throw new Error(
      `renderEmail: assetBaseUrl must be an absolute http(s) URL or "cid:", got "${base}"`
    )
  }
  return base.endsWith("/") ? base : `${base}/`
}

/**
 * The URL of an image: an id of the library becomes a file under the asset
 * base; an absolute URL is kept, unless it is an SVG. Anything else — a `data:`
 * URI an upload produced, a relative path — is dropped, because no client
 * would show it.
 */
export function imageUrl(
  value: unknown,
  options: RenderEmailOptions
): string | undefined {
  const image = trimmed(value)
  if (!image) return undefined

  if (/^[\w-]+$/.test(image)) return `${assetBase(options)}${image}.png`

  const url = safeUrl(image)
  if (!url || !/^https?:/i.test(url)) return undefined
  if (/\.svg(?:[?#]|$)/i.test(url)) return undefined
  return url
}

/* -------------------------------------------------------------------------- */
/* Colours                                                                    */
/* -------------------------------------------------------------------------- */

/** A brand colour that can only ever be a hex value inside a style attribute. */
export function brandColor(value: unknown): string {
  const color = trimmed(value)
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${[...color.slice(1)].map((c) => c + c).join("")}`.toLowerCase()
  }
  return DEFAULT_BRAND
}

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/** Text on the brand colour: whichever of white or ink reads better. */
function onBrand(brand: string): string {
  return contrast(brand, "#ffffff") >= contrast(brand, COLORS.text)
    ? "#ffffff"
    : COLORS.text
}

/** Links in prose: the brand colour when it reads on white, ink otherwise. */
function linkColor(brand: string): string {
  return contrast(brand, COLORS.card) >= 4.5 ? brand : COLORS.text
}

/* -------------------------------------------------------------------------- */
/* Rich text                                                                  */
/* -------------------------------------------------------------------------- */

interface Theme {
  brand: string
  link: string
}

/** Elements dropped together with everything inside them. */
const DROPPED = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "template",
  "noscript",
  "textarea",
  "title",
  "svg",
  "math",
  "head",
])

/** What every other block-level tag of an editor is read as. */
const PARAGRAPHS = new Set([
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
])

const INLINE: Record<string, string> = {
  strong: "strong",
  b: "strong",
  em: "em",
  i: "em",
}

function attribute(attributes: string, name: string): string | undefined {
  const match = new RegExp(
    `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    "i"
  ).exec(attributes)
  if (!match) return undefined
  return decodeEntities(match[1] ?? match[2] ?? match[3] ?? "")
}

const TAG =
  /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g

/**
 * The HTML of a WYSIWYG field, reduced to `p`, `br`, `strong`, `em`, `a`,
 * `ul`, `ol` and `li`, each styled inline.
 *
 * Headings and quotes an editor produces become paragraphs; any other tag is
 * unwrapped, its text kept and escaped; scripts, styles and frames go with
 * their content. Attributes are never copied — a link keeps only an `href`
 * that `safeUrl` accepts, and loses its tag otherwise. The output is balanced
 * whatever the input was.
 */
export function sanitizeRichText(html: unknown, theme: Theme): string {
  const source = str(html)
  const pStyle = `margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:26px;color:${COLORS.text};`
  const listStyle = `margin:0 0 16px;padding:0 0 0 24px;font-family:${SANS};font-size:16px;line-height:26px;color:${COLORS.text};`
  const open: Record<string, string> = {
    p: `<p class="em-text" style="${pStyle}">`,
    ul: `<ul class="em-text" style="${listStyle}">`,
    ol: `<ol class="em-text" style="${listStyle}">`,
    li: `<li style="margin:0 0 6px;">`,
    strong: `<strong style="font-weight:bold;">`,
    em: `<em style="font-style:italic;">`,
  }

  type Entry = { source: string; emitted: string | null }
  const stack: Entry[] = []
  let output = ""
  let dropping: string | null = null
  let cursor = 0

  const text = (chunk: string) => {
    if (dropping || !chunk) return
    output += escapeHtml(decodeEntities(chunk))
  }
  const inside = (tag: string) => stack.some((entry) => entry.emitted === tag)

  for (const match of source.matchAll(TAG)) {
    text(source.slice(cursor, match.index))
    cursor = match.index + match[0].length

    const [token, slash, rawName = "", attributes = ""] = match
    if (token.startsWith("<!--")) continue

    const name = rawName.toLowerCase()

    if (dropping) {
      if (slash && name === dropping) dropping = null
      continue
    }
    if (DROPPED.has(name)) {
      if (!slash && !token.endsWith("/>")) dropping = name
      continue
    }

    if (slash) {
      const index = stack.map((entry) => entry.source).lastIndexOf(name)
      if (index === -1) continue
      for (const entry of stack.splice(index).reverse()) {
        if (entry.emitted) output += `</${entry.emitted}>`
      }
      continue
    }

    if (name === "br") {
      output += "<br>"
      continue
    }

    let emitted: string | null = null
    let tag = ""

    if (PARAGRAPHS.has(name)) {
      // A paragraph inside a paragraph or a list item adds nothing but margins.
      if (!inside("p") && !inside("li")) emitted = "p"
    } else if (name === "ul" || name === "ol") {
      emitted = name
    } else if (name === "li") {
      if (inside("ul") || inside("ol")) emitted = "li"
    } else if (INLINE[name]) {
      emitted = INLINE[name]
    } else if (name === "a") {
      const href = safeUrl(attribute(attributes, "href"))
      if (href && !inside("a")) {
        emitted = "a"
        tag = `<a class="em-link" href="${escapeHtml(href)}" target="_blank" style="color:${theme.link};text-decoration:underline;">`
      }
    }

    if (emitted) output += tag || open[emitted]
    // Void and self-closed tags open nothing to close later.
    if (!token.endsWith("/>")) stack.push({ source: name, emitted })
  }

  text(source.slice(cursor))
  for (const entry of stack.reverse()) {
    if (entry.emitted) output += `</${entry.emitted}>`
  }
  return output
}

/** The plain-text reading of sanitised rich text. */
function richTextToPlain(html: string): string {
  return decodeEntities(
    html
      .replace(/<br>/g, "\n")
      .replace(/<li[^>]*>/g, "- ")
      .replace(/<\/(p|li|ul|ol)>/g, (_, tag: string) =>
        tag === "p" ? "\n\n" : "\n"
      )
      .replace(
        /<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g,
        (_, href: string, label) => `${label} (${decodeEntities(href)})`
      )
      .replace(/<[^>]+>/g, "")
  )
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

interface Context {
  options: RenderEmailOptions
  theme: Theme
}

interface Rendered {
  html: string
  text: string
}

/** One row of the 600px column. */
function row(content: string, style: string, attributes = ""): string {
  return `<tr><td${attributes} style="${style}">${content}</td></tr>`
}

function padded(top: number, bottom: number): string {
  return `padding:${top}px ${GUTTER}px ${bottom}px;`
}

function img({
  src,
  alt,
  width,
  height,
  fluid = true,
}: {
  src: string
  alt: string
  width: number
  height: number
  fluid?: boolean
}): string {
  const sizing = fluid
    ? `width:100%;max-width:${width}px;height:auto;`
    : `width:${width}px;height:${height}px;`
  return `<img src="${escapeHtml(src)}" width="${width}" height="${height}" alt="${escapeHtml(alt)}"${fluid ? ' class="em-fluid"' : ""} style="display:block;${sizing}border:0;outline:none;text-decoration:none;">`
}

function linked(html: string, url: string | undefined): string {
  return url
    ? `<a href="${escapeHtml(url)}" target="_blank" style="text-decoration:none;">${html}</a>`
    : html
}

function heading(text: string, size: number, extra = ""): string {
  return `<h2 class="em-text" style="margin:0 0 12px;font-family:${SERIF};font-size:${size}px;line-height:${Math.round(size * 1.25)}px;font-weight:bold;color:${COLORS.text};${extra}">${escapeHtml(text)}</h2>`
}

function header(block: EmailBlock, { options, theme }: Context): Rendered {
  const name = trimmed(block.brand)
  const color = block.color ? brandColor(block.color) : theme.brand
  const ink = onBrand(color)
  const logo = imageUrl(block.logo, options)

  const word = name
    ? `<span style="font-family:${SERIF};font-size:22px;line-height:28px;font-weight:bold;color:${ink};">${escapeHtml(name)}</span>`
    : ""
  const mark = logo
    ? img({ src: logo, alt: name || "Logo", width: 40, height: 40, fluid: false })
    : ""

  const content =
    mark && word
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 12px 0 0;vertical-align:middle;">${mark}</td><td style="vertical-align:middle;">${word}</td></tr></table>`
      : mark || word

  return {
    html: row(
      content,
      `${padded(20, 20)}background:${color};`,
      ` class="em-px" bgcolor="${color}"`
    ),
    text: name,
  }
}

function hero(block: EmailBlock, { options }: Context): Rendered {
  const src = imageUrl(block.image, options)
  const title = trimmed(block.title)
  const subtitle = trimmed(block.subtitle)

  const picture = src
    ? row(
        img({
          src,
          alt: title,
          width: EMAIL_WIDTH,
          height: Math.round(EMAIL_WIDTH * RATIO),
        }),
        "padding:0;font-size:0;line-height:0;"
      )
    : ""

  const words =
    (title
      ? `<h1 class="em-text em-h1" style="margin:0 0 12px;font-family:${SERIF};font-size:32px;line-height:40px;font-weight:bold;color:${COLORS.text};">${escapeHtml(title)}</h1>`
      : "") +
    (subtitle
      ? `<p class="em-muted" style="margin:0;font-family:${SANS};font-size:17px;line-height:27px;color:${COLORS.muted};">${escapeLines(subtitle)}</p>`
      : "")

  return {
    html: picture + (words ? row(words, padded(32, 8), ' class="em-px"') : ""),
    text: [title.toUpperCase(), subtitle].filter(Boolean).join("\n\n"),
  }
}

function textBlock(block: EmailBlock, { theme }: Context): Rendered {
  const title = trimmed(block.title)
  const body = sanitizeRichText(block.body, theme)

  return {
    html: row(
      (title ? heading(title, 22) : "") + body,
      `${padded(16, 8)}font-family:${SANS};font-size:16px;line-height:26px;color:${COLORS.text};`,
      ' class="em-px em-text"'
    ),
    text: [title.toUpperCase(), richTextToPlain(body)].filter(Boolean).join("\n\n"),
  }
}

/**
 * The bulletproof button: the padding is on the link, so all of it is
 * clickable, and the colour is on the cell too, so a client that drops the
 * link's background still draws the button. Outlook on Windows renders with
 * Word, which ignores both: it gets a VML rounded rectangle instead.
 */
function button(
  label: string,
  url: string | undefined,
  theme: Theme,
  align: string
) {
  const ink = onBrand(theme.brand)
  const font = `font-family:${SANS};font-size:16px;line-height:20px;font-weight:bold;`
  const inner = url
    ? `<a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:14px 28px;${font}color:${ink};text-decoration:none;border-radius:6px;">${escapeHtml(label)}</a>`
    : `<span style="display:inline-block;padding:14px 28px;${font}color:${ink};">${escapeHtml(label)}</span>`

  // Word sizes nothing on its own: the shape is as wide as the label needs.
  const width = Math.max(160, Math.round(label.length * 9.5) + 56)
  const vml = url
    ? `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(url)}" style="height:48px;v-text-anchor:middle;width:${width}px;" arcsize="13%" stroke="f" fillcolor="${theme.brand}"><w:anchorlock/><center style="color:${ink};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${escapeHtml(label)}</center></v:roundrect><![endif]--><!--[if !mso]><!-->${inner}<!--<![endif]-->`
    : inner

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:0${align === "center" ? " auto" : ""};"><tr><td align="center" bgcolor="${theme.brand}" style="border-radius:6px;background:${theme.brand};">${vml}</td></tr></table>`
}

function buttonBlock(block: EmailBlock, { theme }: Context): Rendered {
  const label = trimmed(block.label) || "Open"
  const url = safeUrl(block.url)
  const align = block.align === "left" ? "left" : "center"

  return {
    html: row(
      button(label, url, theme, align),
      padded(16, 24),
      ` class="em-px" align="${align}"`
    ),
    text: url ? `${label}: ${url}` : label,
  }
}

function imageBlock(block: EmailBlock, { options }: Context): Rendered {
  const src = imageUrl(block.image, options)
  const caption = trimmed(block.caption)
  const url = safeUrl(block.url)
  if (!src && !caption) return { html: "", text: "" }

  const picture = src
    ? linked(
        img({ src, alt: caption, width: INNER, height: Math.round(INNER * RATIO) }),
        url
      )
    : ""
  const legend = caption
    ? `<p class="em-muted" style="margin:${src ? 10 : 0}px 0 0;font-family:${SANS};font-size:14px;line-height:20px;color:${COLORS.muted};text-align:center;">${escapeHtml(caption)}</p>`
    : ""

  return {
    html: row(picture + legend, padded(12, 12), ' class="em-px"'),
    text: [caption ? `[${caption}]` : "", url ?? ""].filter(Boolean).join(" "),
  }
}

/**
 * Two cards that sit side by side at 600px and stack under it — without a
 * media query: each is an inline-block capped at half the width, so a narrow
 * screen simply wraps the second under the first. Outlook on Windows does not
 * do inline-block, and gets a two-cell table in conditional comments instead.
 */
function columns(block: EmailBlock, context: Context): Rendered {
  const gutter = 22
  const half = (EMAIL_WIDTH - gutter * 2) / 2
  const imageWidth = half - 20
  const action = trimmed(block.action) || "Read more"

  const card = (side: "left" | "right"): Rendered => {
    const src = imageUrl(block[`${side}Image`], context.options)
    const title = trimmed(block[`${side}Title`])
    const body = trimmed(block[`${side}Text`])
    const url = safeUrl(block[`${side}Url`])

    const html =
      `<div class="em-col" style="display:inline-block;width:100%;max-width:${half}px;vertical-align:top;">` +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 10px 24px;text-align:left;">` +
      (src
        ? linked(
            img({
              src,
              alt: title,
              width: imageWidth,
              height: Math.round(imageWidth * RATIO),
            }),
            url
          )
        : "") +
      (title ? heading(title, 18, `margin:${src ? 14 : 0}px 0 6px;`) : "") +
      (body
        ? `<p class="em-muted" style="margin:0 0 10px;font-family:${SANS};font-size:15px;line-height:22px;color:${COLORS.muted};">${escapeLines(body)}</p>`
        : "") +
      (url
        ? `<a class="em-link" href="${escapeHtml(url)}" target="_blank" style="font-family:${SANS};font-size:15px;line-height:22px;font-weight:bold;color:${context.theme.link};text-decoration:underline;">${escapeHtml(action)} &rarr;</a>`
        : "") +
      `</td></tr></table></div>`

    return {
      html,
      text: [title.toUpperCase(), body, url ? `${action}: ${url}` : ""]
        .filter(Boolean)
        .join("\n"),
    }
  }

  const left = card("left")
  const right = card("right")

  const html =
    `<!--[if mso]><table role="presentation" width="${EMAIL_WIDTH - gutter * 2}" cellpadding="0" cellspacing="0" border="0"><tr><td width="${half}" valign="top"><![endif]-->` +
    left.html +
    `<!--[if mso]></td><td width="${half}" valign="top"><![endif]-->` +
    right.html +
    `<!--[if mso]></td></tr></table><![endif]-->`

  return {
    html: row(
      html,
      `padding:16px ${gutter}px 0;font-size:0;text-align:center;`,
      ' class="em-cols"'
    ),
    text: [left.text, right.text].filter(Boolean).join("\n\n"),
  }
}

const SPACES: Record<string, number> = { small: 16, medium: 32, large: 56 }

function separator(block: EmailBlock): Rendered {
  const space = SPACES[str(block.size)] ?? SPACES.medium

  if (block.kind === "space") {
    return {
      html: row(
        "&nbsp;",
        `height:${space}px;font-size:0;line-height:${space}px;`,
        ` height="${space}"`
      ),
      text: "",
    }
  }

  const half = Math.round(space / 2)
  const rule = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="em-rule" style="border-top:1px solid ${COLORS.rule};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>`

  return { html: row(rule, padded(half, half), ' class="em-px"'), text: "---" }
}

function footer(block: EmailBlock): Rendered {
  const address = trimmed(block.address)
  const reason = trimmed(block.reason)
  const url = safeUrl(block.unsubscribeUrl)
  const label = trimmed(block.unsubscribeLabel) || "Unsubscribe"
  const small = `margin:0 0 8px;font-family:${SANS};font-size:13px;line-height:20px;color:${COLORS.muted};`

  const unsubscribe = url
    ? `<a href="${escapeHtml(url)}" target="_blank" style="color:${COLORS.muted};text-decoration:underline;">${escapeHtml(label)}</a>`
    : escapeHtml(label)

  return {
    html: row(
      (reason
        ? `<p class="em-muted" style="${small}">${escapeLines(reason)}</p>`
        : "") +
        (address
          ? `<p class="em-muted" style="${small}">${escapeLines(address)}</p>`
          : "") +
        `<p class="em-muted" style="${small}margin-bottom:0;">${unsubscribe}</p>`,
      `${padded(28, 28)}background:${COLORS.footer};border-top:1px solid ${COLORS.rule};text-align:center;`,
      ` class="em-px em-foot em-rule" bgcolor="${COLORS.footer}"`
    ),
    text: ["--", reason, address, url ? `${label}: ${url}` : label]
      .filter(Boolean)
      .join("\n"),
  }
}

const RENDERERS: Record<string, (block: EmailBlock, context: Context) => Rendered> =
  {
    [EMAIL_HEADER]: header,
    [EMAIL_HERO]: hero,
    [EMAIL_TEXT]: textBlock,
    [EMAIL_BUTTON]: buttonBlock,
    [EMAIL_IMAGE]: imageBlock,
    [EMAIL_COLUMNS]: columns,
    [EMAIL_SEPARATOR]: separator,
    [EMAIL_FOOTER]: footer,
  }

/* -------------------------------------------------------------------------- */
/* The message                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The only `<style>`: a phone layout and a dark palette, both optional. Gmail
 * keeps it, Outlook.com mostly does, some clients strip it — and then the
 * inline styles alone still give a readable, single-column light message.
 */
const STYLE = `<style>
:root{color-scheme:light dark;supported-color-schemes:light dark}
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse}
img{-ms-interpolation-mode:bicubic}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
@media screen and (max-width:620px){
.em-px{padding-left:20px!important;padding-right:20px!important}
.em-cols{padding-left:10px!important;padding-right:10px!important}
.em-col{max-width:100%!important}
.em-fluid{max-width:100%!important;height:auto!important}
.em-h1{font-size:26px!important;line-height:32px!important}
}
@media (prefers-color-scheme:dark){
.em-bg{background:#14110f!important}
.em-card{background:#1f1b18!important}
.em-foot{background:#1a1714!important}
.em-text,.em-text p,.em-text li,.em-text h2{color:#f3eee8!important}
.em-muted{color:#bdb3a8!important}
.em-rule{border-color:#3a332d!important}
.em-link{color:#f5c08a!important}
}
[data-ogsc] .em-text,[data-ogsc] .em-text p,[data-ogsc] .em-text h2{color:#f3eee8!important}
[data-ogsc] .em-muted{color:#bdb3a8!important}
[data-ogsc] .em-link{color:#f5c08a!important}
[data-ogsb] .em-bg{background:#14110f!important}
[data-ogsb] .em-card{background:#1f1b18!important}
[data-ogsb] .em-foot{background:#1a1714!important}
</style>`

/**
 * The preheader, hidden at the top of the body, then padded with invisible
 * characters: without them a client fills the rest of the inbox line with
 * the first words of the message — "View in browser", alt texts, a logo name.
 */
function preheader(value: string): string {
  if (!value) return ""
  const filler = "&#847;&zwnj;&nbsp;".repeat(60)
  return `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${COLORS.canvas};">${escapeHtml(value)}${filler}</div>`
}

/**
 * Renders an email: the HTML part, the text part and the HTML's weight.
 *
 * Blocks are drawn in their `order` when they carry one, in array order
 * otherwise — the same rule the builder's field sorts on.
 */
export function renderEmail(
  { envelope, blocks }: EmailDocument,
  options: RenderEmailOptions
): RenderedEmail {
  assetBase(options)

  const brand = brandColor(envelope.brandColor)
  const context: Context = { options, theme: { brand, link: linkColor(brand) } }
  const subject = trimmed(envelope.subject)

  const ordered = [...blocks]
    .map((block, index) => ({ block, index }))
    .sort(
      (a, b) =>
        (typeof a.block.order === "number" ? a.block.order : a.index) -
          (typeof b.block.order === "number" ? b.block.order : b.index) ||
        a.index - b.index
    )
    .map(({ block }) => RENDERERS[str(block.type)]?.(block, context))
    .filter((part): part is Rendered => Boolean(part?.html))

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
${STYLE}
</head>
<body class="em-bg" style="margin:0;padding:0;width:100%;background:${COLORS.canvas};">
${preheader(trimmed(envelope.preheader))}
<table role="presentation" class="em-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.canvas}" style="background:${COLORS.canvas};">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="${EMAIL_WIDTH}" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="em-card" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.card}" style="max-width:${EMAIL_WIDTH}px;margin:0 auto;background:${COLORS.card};">
${ordered.map((part) => part.html).join("\n")}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`

  const text = `${ordered
    .map((part) => part.text)
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`

  return { html, text, size: new TextEncoder().encode(html).length }
}

/** "18 KB" — the weight as the canvas and the script print it. */
export function formatSize(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
