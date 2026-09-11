import {
  ArrayInputController,
  FileInputController,
  MultiSelectInputController,
  SelectButtonInputController,
  SelectInputController,
  TextAreaInputController,
  WysiwygInputController,
  addForm,
} from "react-data-form"
import {
  AlignLeft,
  Briefcase,
  GraduationCap,
  Image as ImageIcon,
  Images,
  MousePointerClick,
  Quote,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react"
import { MEDIA_OPTIONS } from "@/demo/builder/media"

/**
 * The block types the two builders are assembled from.
 *
 * Each one is a form of its own, registered once at module scope — `addForm`
 * writes into the shared registry, and the palette reads the registry back, so
 * registering a block twice would offer it twice.
 *
 * The shape of a block's `@for` is the whole trick, and it is worth stating
 * plainly: the *first* tag identifies the block — it is what is stored on the
 * item as `type`, and what `getForm({ type })` resolves back to this form — and
 * the tags after it classify it. `forms: ["page-block"]` on the field is then
 * the palette: every form carrying that tag, and nothing else.
 */

/** The tag a block carries to be offered by the page builder's palette. */
export const PAGE_BLOCK = "page-block"
/** The same, for the résumé. */
export const RESUME_BLOCK = "resume-block"

/** A block, as it is stored in the array the builder submits. */
export interface BuilderBlock {
  id?: string
  /** The identifying `@for` tag of the form that drew it. */
  type?: string
  order?: number
  [key: string]: unknown
}

const ALIGNMENTS = [
  { label: "Left", value: "left" },
  { label: "Centre", value: "center" },
]

/* -------------------------------------------------------------------------- */
/* The landing page                                                           */
/* -------------------------------------------------------------------------- */

export const PAGE_HERO = "page.hero"
export const PAGE_TEXT = "page.text"
export const PAGE_IMAGE = "page.image"
export const PAGE_GALLERY = "page.gallery"
export const PAGE_QUOTE = "page.quote"
export const PAGE_CTA = "page.cta"

addForm(PAGE_HERO, {
  name: "Hero",
  icon: Sparkles,
  "@for": [PAGE_HERO, PAGE_BLOCK],
  inputs: {
    eyebrow: { label: "Eyebrow", placeholder: "New" },
    title: { label: "Title", required: true },
    subtitle: { label: "Subtitle", controller: TextAreaInputController },
    image: {
      label: "Backdrop",
      controller: SelectInputController,
      valueOptions: MEDIA_OPTIONS,
    },
    align: {
      label: "Alignment",
      controller: SelectButtonInputController,
      valueOptions: ALIGNMENTS,
      defaultValue: "left",
    },
  },
})

addForm(PAGE_TEXT, {
  name: "Text",
  icon: AlignLeft,
  "@for": [PAGE_TEXT, PAGE_BLOCK],
  inputs: {
    title: { label: "Heading" },
    body: { label: "Body", controller: WysiwygInputController },
  },
})

addForm(PAGE_IMAGE, {
  name: "Image",
  icon: ImageIcon,
  "@for": [PAGE_IMAGE, PAGE_BLOCK],
  inputs: {
    image: {
      label: "From the library",
      controller: SelectInputController,
      valueOptions: MEDIA_OPTIONS,
    },
    upload: {
      label: "Or one of your own",
      // The plain file controller, which hands back a data URI: the picture is
      // read in the browser and never uploaded anywhere, which is the only
      // thing a documentation site can honestly promise.
      controller: FileInputController,
      description: "A file from this machine, read in the browser.",
    },
    caption: { label: "Caption" },
    width: {
      label: "Width",
      controller: SelectButtonInputController,
      valueOptions: [
        { label: "Inset", value: "inset" },
        { label: "Full width", value: "full" },
      ],
      defaultValue: "inset",
    },
  },
})

addForm(PAGE_GALLERY, {
  name: "Gallery",
  icon: Images,
  "@for": [PAGE_GALLERY, PAGE_BLOCK],
  inputs: {
    title: { label: "Heading" },
    images: {
      label: "Images",
      controller: MultiSelectInputController,
      valueOptions: MEDIA_OPTIONS,
    },
    columns: {
      label: "Columns",
      controller: SelectButtonInputController,
      valueOptions: [
        { label: "Two", value: "2" },
        { label: "Three", value: "3" },
      ],
      defaultValue: "3",
    },
  },
})

addForm(PAGE_QUOTE, {
  name: "Quote",
  icon: Quote,
  "@for": [PAGE_QUOTE, PAGE_BLOCK],
  inputs: {
    quote: { label: "Quote", controller: TextAreaInputController, required: true },
    author: { label: "Author" },
    role: { label: "Role" },
  },
})

addForm(PAGE_CTA, {
  name: "Call to action",
  icon: MousePointerClick,
  "@for": [PAGE_CTA, PAGE_BLOCK],
  inputs: {
    title: { label: "Title", required: true },
    description: { label: "Description", controller: TextAreaInputController },
    action: { label: "Button label", defaultValue: "Get started" },
  },
})

/* -------------------------------------------------------------------------- */
/* The résumé                                                                 */
/* -------------------------------------------------------------------------- */

export const RESUME_HEADER = "resume.header"
export const RESUME_EXPERIENCE = "resume.experience"
export const RESUME_EDUCATION = "resume.education"
export const RESUME_SKILLS = "resume.skills"

addForm(RESUME_HEADER, {
  name: "Identity",
  icon: UserRound,
  "@for": [RESUME_HEADER, RESUME_BLOCK],
  inputs: {
    name: { label: "Name", required: true },
    role: { label: "Title" },
    portrait: {
      label: "Portrait",
      controller: SelectInputController,
      valueOptions: MEDIA_OPTIONS,
    },
    summary: { label: "In a few words", controller: TextAreaInputController },
    contact: {
      label: "Contact",
      controller: ArrayInputController,
      description: "One line each — mail, phone, city. Enter adds one.",
    },
  },
})

addForm(RESUME_EXPERIENCE, {
  name: "Experience",
  icon: Briefcase,
  "@for": [RESUME_EXPERIENCE, RESUME_BLOCK],
  inputs: {
    role: { label: "Position", required: true },
    company: { label: "Company" },
    period: { label: "Period", placeholder: "2021 — today" },
    description: { label: "What you did", controller: TextAreaInputController },
    stack: { label: "Stack", controller: ArrayInputController },
  },
})

addForm(RESUME_EDUCATION, {
  name: "Education",
  icon: GraduationCap,
  "@for": [RESUME_EDUCATION, RESUME_BLOCK],
  inputs: {
    degree: { label: "Degree", required: true },
    school: { label: "School" },
    period: { label: "Period" },
  },
})

addForm(RESUME_SKILLS, {
  name: "Skills",
  icon: Wrench,
  "@for": [RESUME_SKILLS, RESUME_BLOCK],
  inputs: {
    title: { label: "Heading", defaultValue: "Skills" },
    skills: { label: "Skills", controller: ArrayInputController },
  },
})
