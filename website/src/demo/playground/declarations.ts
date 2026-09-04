import commentsSource from "@/demo/playground/resources/comments.ts?raw"
import ordersSource from "@/demo/playground/resources/orders.ts?raw"
import overviewSource from "@/demo/playground/resources/overview.ts?raw"
import postsSource from "@/demo/playground/resources/posts.ts?raw"
import productsSource from "@/demo/playground/resources/products.ts?raw"
import roastsSource from "@/demo/playground/resources/roasts.ts?raw"
import usersSource from "@/demo/playground/resources/users.ts?raw"
import {
  COMMENTS_ID,
  ORDERS_ID,
  OVERVIEW_ID,
  POSTS_ID,
  PRODUCTS_ID,
  ROASTS_ID,
  USERS_ID,
} from "@/demo/playground/adminData"

export interface Declaration {
  /** The file, as the reader would find it in the repository. */
  file: string
  /** Its source, comments stripped: the declaration and nothing else. */
  source: string
  /** How many lines that is — the number the overview quotes. */
  lines: number
}

/**
 * The source of every screen of the back office, next to the screen.
 *
 * These are the same files the scope imports, read as text through Vite's
 * `?raw`, so what the "Declaration" button shows is what runs — not a snippet
 * kept in step by hand. The comments are stripped for display: they explain
 * the choices to a maintainer, and the reader of the playground is here to
 * measure how little a screen takes.
 */
const SOURCES: Record<string, { file: string; raw: string }> = {
  [OVERVIEW_ID]: { file: "resources/overview.ts", raw: overviewSource },
  [USERS_ID]: { file: "resources/users.ts", raw: usersSource },
  [POSTS_ID]: { file: "resources/posts.ts", raw: postsSource },
  [COMMENTS_ID]: { file: "resources/comments.ts", raw: commentsSource },
  [PRODUCTS_ID]: { file: "resources/products.ts", raw: productsSource },
  [ORDERS_ID]: { file: "resources/orders.ts", raw: ordersSource },
  [ROASTS_ID]: { file: "resources/roasts.ts", raw: roastsSource },
}

function stripComments(source: string): string {
  return (
    source
      // Block comments, JSDoc included.
      .replace(/^[ \t]*\/\*[\s\S]*?\*\/[ \t]*\n/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Whole-line comments. An inline `//` inside a string would be a false
      // match, and none of these files has one.
      .replace(/^[ \t]*\/\/.*\n/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}

const DECLARATIONS: Record<string, Declaration> = Object.fromEntries(
  Object.entries(SOURCES).map(([id, { file, raw }]) => {
    const source = stripComments(raw)
    return [id, { file, source, lines: source.split("\n").length }]
  })
)

export function getDeclaration(resourceId?: string): Declaration | undefined {
  return resourceId ? DECLARATIONS[resourceId] : undefined
}
