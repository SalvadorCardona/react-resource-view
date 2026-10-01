import {
  SelectButtonInputController,
  SelectInputController,
  TextAreaInputController,
  WysiwygInputController,
  addForm,
} from "react-data-form"
import {
  AlignLeft,
  Columns2,
  Image as ImageIcon,
  LayoutPanelTop,
  MousePointerClick,
  PanelBottom,
  SeparatorHorizontal,
  Sparkles,
} from "lucide-react"
import { LOGO_OPTIONS, MEDIA_OPTIONS } from "@/demo/builder/media"
import {
  EMAIL_BUTTON,
  EMAIL_COLUMNS,
  EMAIL_FOOTER,
  EMAIL_HEADER,
  EMAIL_HERO,
  EMAIL_IMAGE,
  EMAIL_SEPARATOR,
  EMAIL_TEXT,
} from "@/demo/email/renderEmail"

/**
 * The block types of the email builder — the third palette of the same field.
 *
 * Registered exactly like the page and the résumé blocks in `blocks.ts`: one
 * `addForm` each, the identifying tag first, then `email-block`, which is what
 * the field's palette selects on. The type ids themselves come from
 * `renderEmail`, which is the module that has to understand them: the form
 * only asks for the fields, the renderer decides what an email makes of them.
 *
 * The envelope — subject, preheader, sender, brand colour — is not a block: it
 * is described on the form itself, beside `blocks`, in `kits.ts`.
 */

/** The tag a block carries to be offered by the email builder's palette. */
export const EMAIL_BLOCK = "email-block"

/** A handful of brand colours, each dark enough to carry white text. */
export const BRAND_COLORS = [
  { label: "Roast", value: "#7c2d12" },
  { label: "Forest", value: "#14532d" },
  { label: "Harbour", value: "#1e3a5f" },
  { label: "Plum", value: "#581c87" },
]

const URL_HINT = "An absolute address — https://…"

addForm(EMAIL_HEADER, {
  name: "Header",
  icon: LayoutPanelTop,
  "@for": [EMAIL_HEADER, EMAIL_BLOCK],
  inputs: {
    brand: { label: "Brand name", defaultValue: "The Roastery" },
    logo: {
      label: "Logo",
      controller: SelectInputController,
      valueOptions: LOGO_OPTIONS,
    },
    color: {
      label: "Colour",
      controller: SelectButtonInputController,
      valueOptions: BRAND_COLORS,
      description: "Left empty, the header takes the brand colour of the email.",
    },
  },
})

addForm(EMAIL_HERO, {
  name: "Hero",
  icon: Sparkles,
  "@for": [EMAIL_HERO, EMAIL_BLOCK],
  inputs: {
    image: {
      label: "Image",
      controller: SelectInputController,
      valueOptions: MEDIA_OPTIONS,
    },
    title: { label: "Title", required: true },
    subtitle: { label: "Subtitle", controller: TextAreaInputController },
  },
})

addForm(EMAIL_TEXT, {
  name: "Text",
  icon: AlignLeft,
  "@for": [EMAIL_TEXT, EMAIL_BLOCK],
  inputs: {
    title: { label: "Heading" },
    body: {
      label: "Body",
      controller: WysiwygInputController,
      description:
        "Paragraphs, bold, italics, links and lists reach the mailbox; any other formatting is dropped.",
    },
  },
})

addForm(EMAIL_BUTTON, {
  name: "Button",
  icon: MousePointerClick,
  "@for": [EMAIL_BUTTON, EMAIL_BLOCK],
  inputs: {
    label: { label: "Label", required: true, defaultValue: "Shop now" },
    url: {
      label: "Link",
      required: true,
      placeholder: "https://",
      description: URL_HINT,
    },
    align: {
      label: "Alignment",
      controller: SelectButtonInputController,
      valueOptions: [
        { label: "Left", value: "left" },
        { label: "Centre", value: "center" },
      ],
      defaultValue: "center",
    },
  },
})

addForm(EMAIL_IMAGE, {
  name: "Image",
  icon: ImageIcon,
  "@for": [EMAIL_IMAGE, EMAIL_BLOCK],
  inputs: {
    // The library only: an email cannot carry a file read in the browser, it
    // needs a picture hosted somewhere a mailbox can fetch it from.
    image: {
      label: "From the library",
      controller: SelectInputController,
      valueOptions: MEDIA_OPTIONS,
      required: true,
    },
    caption: { label: "Caption", description: "Also the alt text of the picture." },
    url: { label: "Link", placeholder: "https://", description: "Optional." },
  },
})

const card = (side: "left" | "right", title: string) => ({
  [`${side}Image`]: {
    label: `${title} — image`,
    controller: SelectInputController,
    valueOptions: MEDIA_OPTIONS,
  },
  [`${side}Title`]: { label: `${title} — title` },
  [`${side}Text`]: { label: `${title} — text`, controller: TextAreaInputController },
  [`${side}Url`]: { label: `${title} — link`, placeholder: "https://" },
})

addForm(EMAIL_COLUMNS, {
  name: "Two columns",
  icon: Columns2,
  "@for": [EMAIL_COLUMNS, EMAIL_BLOCK],
  inputs: {
    ...card("left", "Left"),
    ...card("right", "Right"),
    action: { label: "Link label", defaultValue: "Read more" },
  },
})

addForm(EMAIL_SEPARATOR, {
  // "Divider / Spacer" in one block: a line or an empty band, the kind decides.
  name: "Divider",
  icon: SeparatorHorizontal,
  "@for": [EMAIL_SEPARATOR, EMAIL_BLOCK],
  inputs: {
    kind: {
      label: "Kind",
      controller: SelectButtonInputController,
      valueOptions: [
        { label: "Line", value: "line" },
        { label: "Space", value: "space" },
      ],
      defaultValue: "line",
    },
    size: {
      label: "Height",
      controller: SelectButtonInputController,
      valueOptions: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ],
      defaultValue: "medium",
    },
  },
})

addForm(EMAIL_FOOTER, {
  name: "Footer",
  icon: PanelBottom,
  "@for": [EMAIL_FOOTER, EMAIL_BLOCK],
  inputs: {
    address: {
      label: "Postal address",
      controller: TextAreaInputController,
      description: "Required by anti-spam law for a marketing email.",
    },
    reason: {
      label: "Why they receive it",
      controller: TextAreaInputController,
      defaultValue: "You are receiving this because you signed up on our site.",
    },
    // Required: a marketing email without a way out is spam by definition, in
    // law (CAN-SPAM, the GDPR) and in the eyes of Gmail.
    unsubscribeUrl: {
      label: "Unsubscribe link",
      required: true,
      placeholder: "https://",
      description: URL_HINT,
    },
    unsubscribeLabel: { label: "Unsubscribe label", defaultValue: "Unsubscribe" },
  },
})
