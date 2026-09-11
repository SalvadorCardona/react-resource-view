import { createFormArrayInputController, type FormInterface } from "react-data-form"
import { FileUser, LayoutTemplate, type LucideIcon } from "lucide-react"
import type { FC } from "react"
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
import { PagePreview } from "@/demo/builder/PagePreview"
import { ResumePreview } from "@/demo/builder/ResumePreview"

/**
 * The two documents the builder can assemble.
 *
 * They exist as a pair on purpose. A page builder is the example everybody
 * pictures, and it is easy to mistake for a feature of its own; putting a
 * résumé next to it, built out of the same field with a different palette,
 * shows what is actually general — a form whose fields are decided by the
 * content rather than by the description.
 */
export interface BuilderKit {
  id: "page" | "resume"
  label: string
  /** One line, under the picker. */
  tagline: string
  icon: LucideIcon
  /** The form holding the single array field. */
  form: FormInterface
  /** What the studio opens on. */
  sample: BuilderBlock[]
  preview: FC<{ blocks: BuilderBlock[] }>
}

const pageForm: FormInterface = {
  label: { title: "Landing page", submit: "Publish" },
  inputs: {
    blocks: createFormArrayInputController({
      label: "Content",
      // Every form tagged `page-block`, and only those: this is the palette.
      forms: [PAGE_BLOCK],
      draggable: true,
    }),
  },
}

const resumeForm: FormInterface = {
  label: { title: "Curriculum vitæ", submit: "Export" },
  inputs: {
    blocks: createFormArrayInputController({
      label: "Sections",
      forms: [RESUME_BLOCK],
      draggable: true,
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
    portrait: "dusk",
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
  },
  {
    id: "resume",
    label: "Curriculum vitæ",
    tagline: "An identity, a career, a degree, a wall of skills.",
    icon: FileUser,
    form: resumeForm,
    sample: RESUME_SAMPLE,
    preview: ResumePreview,
  },
]
