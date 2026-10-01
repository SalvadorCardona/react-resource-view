import { SelectButtonInputController, type FormInterface } from "react-data-form"
import { FileUser, LayoutTemplate, Mail, type LucideIcon } from "lucide-react"
import type { FC, ReactNode } from "react"
import { createBlockBuilderInput } from "@/demo/builder/BlockBuilderInput"
import { BUILDER_FORM_COMPONENTS } from "@/demo/builder/BuilderForm"
import type { CanvasMedium, CanvasSource } from "@/demo/builder/BuilderCanvas"
import {
  PAGE_BLOCK,
  PAGE_CTA,
  PAGE_GALLERY,
  PAGE_HERO,
  PAGE_QUOTE,
  PAGE_TEXT,
  RESUME_BLOCK,
  RESUME_EDUCATION,
  RESUME_EXPERIENCE,
  RESUME_HEADER,
  RESUME_SKILLS,
  type BuilderBlock,
} from "@/demo/builder/blocks"
import { BRAND_COLORS, EMAIL_BLOCK } from "@/demo/builder/emailBlocks"
import { EmailPreview } from "@/demo/builder/EmailPreview"
import { useEmailOutputs } from "@/demo/builder/EmailOutputs"
import { PagePreview } from "@/demo/builder/PagePreview"
import { ResumePreview } from "@/demo/builder/ResumePreview"
import { SAMPLE_BLOCKS, SAMPLE_ENVELOPE } from "@/demo/email/sample"

/**
 * The documents the builder can assemble.
 *
 * The first two exist as a pair on purpose. A page builder is the example everybody
 * pictures, and it is easy to mistake for a feature of its own; putting a
 * résumé next to it, built out of the same field with a different palette,
 * shows what is actually general — a form whose fields are decided by the
 * content rather than by the description. The third, the email, is the same
 * field once more, with two differences worth having: the document has fields
 * of its own beside its blocks — an envelope — and what it compiles to is a
 * string of HTML rather than a component tree.
 */
export interface BuilderKit {
  id: "page" | "resume" | "email"
  label: string
  /** One line, under the picker. */
  tagline: string
  icon: LucideIcon
  /** The form holding the single array field. */
  form: FormInterface
  /** What the studio opens on. */
  sample: BuilderBlock[]
  /**
   * The values of the form's other fields, beside `blocks` — an email's
   * subject, preheader, sender and colour. A kit without any has only blocks,
   * and its payload is the array alone, as it always was.
   */
  fields?: Record<string, unknown>
  preview: FC<{ blocks: BuilderBlock[]; fields?: Record<string, unknown> }>
  /**
   * How the preview is framed: a web page stretches, a CV is a sheet of A4, an
   * email sits in a mail client.
   */
  medium: CanvasMedium
  /**
   * What the canvas shows beyond the result — source tabs, a status beside the
   * toolbar, buttons beside "Reset". A hook: it is called on every render of
   * the studio, which is mounted once per kit.
   */
  useOutputs?: (
    blocks: BuilderBlock[],
    fields?: Record<string, unknown>
  ) => { sources?: CanvasSource[]; toolbarEnd?: ReactNode; actions?: ReactNode }
}

export const pageForm: FormInterface = {
  label: { submit: "Publish" },
  components: BUILDER_FORM_COMPONENTS,
  inputs: {
    blocks: createBlockBuilderInput({
      label: "Content",
      // Every form tagged `page-block`, and only those: this is the palette.
      forms: [PAGE_BLOCK],
      addLabel: "Add a first block",
    }),
  },
}

export const resumeForm: FormInterface = {
  label: { submit: "Save the CV" },
  components: BUILDER_FORM_COMPONENTS,
  inputs: {
    blocks: createBlockBuilderInput({
      label: "Sections",
      forms: [RESUME_BLOCK],
      addLabel: "Add a first section",
      appendLabel: "Add a section",
    }),
  },
}

/**
 * The email: an envelope described as fields of the form, beside the blocks.
 * `BuilderFormInputs` folds them into the "Settings" panel above the content,
 * the way a post's title and author are.
 */
export const emailForm: FormInterface = {
  label: { submit: "Save the newsletter" },
  components: BUILDER_FORM_COMPONENTS,
  inputs: {
    subject: { label: "Subject", required: true },
    preheader: {
      label: "Preheader",
      description:
        "The grey line after the subject in the inbox. Around 90 characters.",
    },
    fromName: { label: "Sender name" },
    brandColor: {
      label: "Brand colour",
      controller: SelectButtonInputController,
      valueOptions: BRAND_COLORS,
      defaultValue: BRAND_COLORS[0].value,
    },
    blocks: createBlockBuilderInput({
      label: "Content",
      forms: [EMAIL_BLOCK],
      addLabel: "Add a first block",
    }),
  },
}

const PAGE_SAMPLE: BuilderBlock[] = [
  {
    id: "page-1",
    type: PAGE_HERO,
    order: 0,
    eyebrow: "Roasted on Tuesdays",
    title: "Coffee, from the farm to your kitchen",
    subtitle:
      "Six single origins, roasted the day before they are shipped, and never blended into something they are not.",
    image: "sunrise",
    align: "left",
  },
  {
    id: "page-2",
    type: PAGE_TEXT,
    order: 1,
    title: "What we do",
    body: "<p>We buy green coffee from eleven farms, roast it in small batches, and ship it within twenty-four hours. <strong>No warehouse, no waiting.</strong></p>",
  },
  {
    id: "page-3",
    type: PAGE_GALLERY,
    order: 2,
    title: "The roastery",
    images: ["orchard", "studio", "harbour"],
    columns: "3",
  },
  {
    id: "page-4",
    type: PAGE_QUOTE,
    order: 3,
    quote: "The only order I have never had to chase.",
    author: "Inès Berthet",
    role: "Café Néon, Lyon",
  },
  {
    id: "page-5",
    type: PAGE_CTA,
    order: 4,
    title: "Pick your first bag",
    description: "Free shipping on the first order, and no subscription to cancel.",
    action: "Browse the roasts",
  },
]

const RESUME_SAMPLE: BuilderBlock[] = [
  {
    id: "cv-1",
    type: RESUME_HEADER,
    order: 0,
    name: "Camille Roux",
    role: "Front-end engineer",
    portrait: "ink",
    summary:
      "Eight years building interfaces that stay maintainable once the team doubles. Partial to design systems and to deleting code.",
    contact: ["camille@example.com", "Lyon, France", "+33 6 00 00 00 00"],
  },
  {
    id: "cv-2",
    type: RESUME_EXPERIENCE,
    order: 1,
    role: "Lead front-end",
    company: "Néon",
    period: "2021 — today",
    description:
      "Rebuilt the back office around declarative resources: seven screens, seven files, and a release every week instead of every quarter.",
    stack: ["React", "TypeScript", "Tailwind"],
  },
  {
    id: "cv-3",
    type: RESUME_EXPERIENCE,
    order: 2,
    role: "Front-end developer",
    company: "Atelier Vert",
    period: "2018 — 2021",
    description: "Design system, then the six products that came to depend on it.",
    stack: ["React", "Storybook"],
  },
  {
    id: "cv-4",
    type: RESUME_EDUCATION,
    order: 3,
    degree: "MSc Computer Science",
    school: "Université Lyon 1",
    period: "2016",
  },
  {
    id: "cv-5",
    type: RESUME_SKILLS,
    order: 4,
    title: "Skills",
    skills: ["React", "TypeScript", "Accessibility", "Design systems", "Testing"],
  },
]

export const BUILDER_KITS: BuilderKit[] = [
  {
    id: "page",
    label: "Landing page",
    tagline: "A hero, some prose, a gallery, a quote, a call to action.",
    icon: LayoutTemplate,
    form: pageForm,
    sample: PAGE_SAMPLE,
    preview: PagePreview,
    medium: "page",
  },
  {
    id: "resume",
    label: "Curriculum vitæ",
    tagline: "An identity, a career, a degree, a wall of skills.",
    icon: FileUser,
    form: resumeForm,
    sample: RESUME_SAMPLE,
    preview: ResumePreview,
    medium: "sheet",
  },
  {
    id: "email",
    label: "Email",
    tagline: "A newsletter, in the HTML a mailbox actually receives.",
    icon: Mail,
    form: emailForm,
    sample: SAMPLE_BLOCKS,
    fields: SAMPLE_ENVELOPE,
    preview: EmailPreview,
    medium: "email",
    useOutputs: useEmailOutputs,
  },
]
