import { getForm, getFormLabel } from "react-data-form"
import type { FC } from "react"
import {
  PAGE_CTA,
  PAGE_GALLERY,
  PAGE_HERO,
  PAGE_IMAGE,
  PAGE_QUOTE,
  PAGE_TEXT,
  RESUME_EDUCATION,
  RESUME_EXPERIENCE,
  RESUME_HEADER,
  RESUME_SKILLS,
  type BuilderBlock,
} from "@/demo/builder/blocks"
import { artworkSrc } from "@/demo/builder/media"

/**
 * What a block looks like in the outline, before it is opened.
 *
 * A row reading "Experience" five times over says nothing: a block is
 * recognised by what is written in it, never by its type alone. The type
 * belongs on the second line, where it is a reminder rather than a label.
 */
export interface BlockSummary {
  /** The content, in the reader's own words. */
  title: string
  /** The type, and whatever counts — three images, forty-two words. */
  detail: string
  /** The picture the block carries, when it carries one. */
  thumbnail?: string
  /** Fallback for the blocks with no picture: the palette's own icon. */
  icon?: FC<{ className?: string }>
}

type Summariser = (block: BuilderBlock) => Omit<BlockSummary, "icon">

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : ""

const list = (value: unknown): string[] => (Array.isArray(value) ? value : [])

/** The plain words of a WYSIWYG value, tags and entities out of the way. */
function plainText(html: unknown): string {
  return text(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function excerpt(value: string, length = 60): string {
  if (value.length <= length) return value
  return `${value.slice(0, length).trimEnd()}…`
}

function counted(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

const SUMMARIES: Record<string, Summariser> = {
  [PAGE_HERO]: (block) => ({
    title: text(block.title) || "Untitled hero",
    detail: [text(block.eyebrow), "Hero"].filter(Boolean).join(" · "),
    thumbnail: artworkSrc(text(block.image)),
  }),
  [PAGE_TEXT]: (block) => {
    const body = plainText(block.body)
    const words = body ? body.split(" ").length : 0

    return {
      title: text(block.title) || excerpt(body) || "Empty paragraph",
      detail: words ? `Text · ${counted(words, "word", "words")}` : "Text",
    }
  },
  [PAGE_IMAGE]: (block) => ({
    title: text(block.caption) || "Image",
    detail: block.width === "full" ? "Image · full width" : "Image",
    thumbnail: artworkSrc(text(block.upload) || text(block.image)),
  }),
  [PAGE_GALLERY]: (block) => {
    const images = list(block.images)

    return {
      title: text(block.title) || "Gallery",
      detail: `Gallery · ${counted(images.length, "image", "images")}`,
      thumbnail: artworkSrc(text(images[0])),
    }
  },
  [PAGE_QUOTE]: (block) => ({
    title: excerpt(plainText(block.quote)) || "Empty quote",
    detail: ["Quote", text(block.author)].filter(Boolean).join(" · "),
  }),
  [PAGE_CTA]: (block) => ({
    title: text(block.title) || "Call to action",
    detail: ["Call to action", text(block.action)].filter(Boolean).join(" · "),
  }),
  [RESUME_HEADER]: (block) => ({
    title: text(block.name) || "Your name",
    detail: text(block.role) || "Identity",
    thumbnail: artworkSrc(text(block.portrait)),
  }),
  [RESUME_EXPERIENCE]: (block) => ({
    title:
      [text(block.role), text(block.company)].filter(Boolean).join(" · ") ||
      "New position",
    detail: text(block.period) || "Experience",
  }),
  [RESUME_EDUCATION]: (block) => ({
    title: text(block.degree) || "New degree",
    detail: [text(block.school), text(block.period)].filter(Boolean).join(" · ")
      || "Education",
  }),
  [RESUME_SKILLS]: (block) => {
    const skills = list(block.skills)

    return {
      title: text(block.title) || "Skills",
      detail: counted(skills.length, "skill", "skills"),
    }
  },
}

/**
 * The card of a block: what it says, what it is, and the picture it carries.
 *
 * A type with no summariser of its own — one added to the palette after this
 * file was written — falls back to the name of its form, which is what the
 * block header showed before any of this existed.
 */
export function summariseBlock(block: BuilderBlock): BlockSummary {
  const type = text(block.type)
  const form = type ? getForm({ type }) : undefined
  const label = form ? getFormLabel(form) : "Block"
  const summarise = SUMMARIES[type]

  return {
    ...(summarise?.(block) ?? { title: label, detail: label }),
    icon: form?.icon as FC<{ className?: string }> | undefined,
  }
}
