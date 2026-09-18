import {
  PAGE_CTA,
  PAGE_GALLERY,
  PAGE_HERO,
  PAGE_QUOTE,
  PAGE_TEXT,
  RESUME_EDUCATION,
  RESUME_EXPERIENCE,
  RESUME_HEADER,
  RESUME_SKILLS,
} from "@/demo/builder/blocks"
import type { Post, Profile } from "@/demo/playground/adminData"

/**
 * The records of the back office that are documents rather than fields: the
 * pages of the site, and the CVs hanging off an account.
 *
 * Written the way the builder writes its own samples — see `BUILDER_KITS` in
 * `@/demo/builder/kits`: a block is an object whose `type` is the `@for` tag of
 * the form that draws it, and every picture is an id of the media library
 * rather than a URL, so the fixtures load with the page and survive offline.
 *
 * They exist because a page builder with nothing in it demonstrates nothing: a
 * list has no layouts to switch between, no filter to try and no record to
 * open. These are the same shape the builder saves, so a page published from
 * `/playground/builder` lands next to them and reads exactly alike.
 *
 * The types come from `adminData`, which reads these back in turn — only ever
 * as types, so nothing is imported in both directions at runtime.
 */

/**
 * A day in the recent past, as an ISO string.
 *
 * Computed at seed time rather than written down, like the roasting schedule:
 * "edited 3 days ago" stays true whenever the playground is opened.
 */
function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(9, 30, 0, 0)
  return date.toISOString()
}

/**
 * The pages of the site, stored as posts.
 *
 * They are the same kind of record as an article — a title and a stack of
 * blocks — so they live in the same collection, under the "Pages" category.
 * Their ids continue the articles', which is what keeps two rows of one
 * collection from sharing an IRI.
 */
export const PAGES: Array<Omit<Post, "@id" | "@type">> = [
  {
    id: "8",
    title: "Coffee, from the farm to your kitchen",
    author: "Ada Lovelace",
    category: "Pages",
    status: "published",
    publishedAt: "2026-01-05",
    views: 5127,
    blocks: [
      {
        id: "home-1",
        type: PAGE_HERO,
        order: 0,
        eyebrow: "Roasted on Tuesdays",
        title: "Coffee, from the farm to your kitchen",
        subtitle:
          "Six single origins, roasted the day before they are shipped, and never blended into something they are not.",
        image: "sunrise",
        align: "center",
      },
      {
        id: "home-2",
        type: PAGE_TEXT,
        order: 1,
        title: "What we do",
        body: "<p>We buy green coffee from eleven farms, roast it in small batches, and ship it within twenty-four hours. <strong>No warehouse, no waiting.</strong></p>",
      },
      {
        id: "home-3",
        type: PAGE_GALLERY,
        order: 2,
        title: "The roastery",
        images: ["orchard", "studio", "harbour"],
        columns: "3",
      },
      {
        id: "home-4",
        type: PAGE_QUOTE,
        order: 3,
        quote: "The only order I have never had to chase.",
        author: "Inès Berthet",
        role: "Café Néon, Lyon",
      },
      {
        id: "home-5",
        type: PAGE_CTA,
        order: 4,
        title: "Pick your first bag",
        description: "Free shipping on the first order, and no subscription to cancel.",
        action: "Browse the roasts",
      },
    ],
  },
  {
    id: "9",
    title: "The subscription",
    author: "Grace Hopper",
    category: "Pages",
    status: "published",
    publishedAt: "2026-01-19",
    views: 2044,
    blocks: [
      {
        id: "sub-1",
        type: PAGE_HERO,
        order: 0,
        eyebrow: "Every other Thursday",
        title: "A bag, before you run out",
        subtitle:
          "Choose a weight and a rhythm; we roast the morning it leaves. Pause it, skip it or stop it from your account.",
        image: "harbour",
        align: "left",
      },
      {
        id: "sub-2",
        type: PAGE_TEXT,
        order: 1,
        title: "How it works",
        body: "<p>Pick 250 g or 1 kg, weekly or fortnightly. We alternate between the origins on the shelf that week — or pin the one you cannot do without.</p>",
      },
      {
        id: "sub-3",
        type: PAGE_QUOTE,
        order: 2,
        quote: "Three years in, and I have never opened a stale bag.",
        author: "Marc Oliveira",
        role: "Subscriber since 2023",
      },
      {
        id: "sub-4",
        type: PAGE_CTA,
        order: 3,
        title: "Start with a fortnight",
        description: "Cancel from the first delivery, no message to send anyone.",
        action: "Choose a rhythm",
      },
    ],
  },
  {
    id: "10",
    title: "Wholesale",
    author: "Barbara Liskov",
    category: "Pages",
    status: "published",
    publishedAt: "2026-02-11",
    views: 863,
    blocks: [
      {
        id: "pro-1",
        type: PAGE_HERO,
        order: 0,
        eyebrow: "Cafés, hotels, offices",
        title: "Coffee for a room full of people",
        subtitle:
          "A profile roasted for your machine, delivered on the day your week starts, invoiced once a month.",
        image: "studio",
        align: "left",
      },
      {
        id: "pro-2",
        type: PAGE_TEXT,
        order: 1,
        title: "What comes with it",
        body: "<p>A cupping before the first order, a training morning for your team, and a batch schedule you can read from your account.</p>",
      },
      {
        id: "pro-3",
        type: PAGE_GALLERY,
        order: 2,
        title: "On site",
        images: ["studio", "night"],
        columns: "2",
      },
      {
        id: "pro-4",
        type: PAGE_CTA,
        order: 3,
        title: "Ask for a cupping",
        description: "Twenty minutes, four origins, no order to place afterwards.",
        action: "Book a date",
      },
    ],
  },
  {
    id: "11",
    title: "Christmas boxes",
    author: "Katherine Johnson",
    category: "Pages",
    status: "draft",
    publishedAt: "",
    views: 0,
    blocks: [
      {
        id: "xmas-1",
        type: PAGE_HERO,
        order: 0,
        eyebrow: "Draft — reopens in November",
        title: "Three origins, one box",
        subtitle: "The three roasts of the season, packed the week they are picked.",
        image: "night",
        align: "center",
      },
      {
        id: "xmas-2",
        type: PAGE_TEXT,
        order: 1,
        title: "Still to write",
        body: "<p>Prices, the shipping cut-off and the picture of the box. Kept here so next December starts from something.</p>",
      },
    ],
  },
]

/**
 * The CVs, all three of them the same person's: `owner` is the name of the
 * account they hang under, which is what the "Curriculum vitæ" tab of a user
 * filters its list on.
 */
export const SAMPLE_PROFILES: Array<Omit<Profile, "@id" | "@type">> = [
  {
    id: "1",
    title: "Camille Roux — front-end engineer",
    owner: "Camille Roux",
    updatedAt: daysAgo(2),
    blocks: [
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
    ],
  },
  {
    id: "2",
    title: "Camille Roux — engineering manager",
    owner: "Camille Roux",
    updatedAt: daysAgo(6),
    blocks: [
      {
        id: "mgr-1",
        type: RESUME_HEADER,
        order: 0,
        name: "Camille Roux",
        role: "Engineering manager",
        portrait: "harbour",
        summary:
          "The same eight years, told from the side of the people: hiring, reviews, and shipping without a crunch.",
        contact: ["camille@example.com", "Lyon, France"],
      },
      {
        id: "mgr-2",
        type: RESUME_EXPERIENCE,
        order: 1,
        role: "Engineering manager",
        company: "Néon",
        period: "2023 — today",
        description:
          "Six engineers across two products. Hired four of them, and kept the on-call rota to one night a month.",
        stack: ["Hiring", "Mentoring", "Roadmapping"],
      },
      {
        id: "mgr-3",
        type: RESUME_EXPERIENCE,
        order: 2,
        role: "Lead front-end",
        company: "Néon",
        period: "2021 — 2023",
        description: "The back office, and the design system the rest of the company built on.",
        stack: ["React", "TypeScript"],
      },
      {
        id: "mgr-4",
        type: RESUME_SKILLS,
        order: 3,
        title: "What I am asked for",
        skills: ["Hiring", "Code review", "Architecture", "Writing things down"],
      },
    ],
  },
  {
    id: "3",
    title: "Camille Roux — one page",
    owner: "Camille Roux",
    updatedAt: daysAgo(21),
    blocks: [
      {
        id: "short-1",
        type: RESUME_HEADER,
        order: 0,
        name: "Camille Roux",
        role: "Front-end engineer",
        portrait: "orchard",
        summary: "React, TypeScript, and interfaces that outlive the team that wrote them.",
        contact: ["camille@example.com"],
      },
      {
        id: "short-2",
        type: RESUME_SKILLS,
        order: 1,
        title: "Skills",
        skills: ["React", "TypeScript", "Accessibility"],
      },
    ],
  },
]
