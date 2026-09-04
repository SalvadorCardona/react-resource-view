/**
 * The resources of the playground's back office, one file each.
 *
 * They are declared in modules rather than in a page because
 * `createViewResource` writes into the shared resource registry — declaring
 * the same IRI twice would register it twice. Only `adminScope` imports them,
 * and the playground loads that scope lazily: a reader who never opens the
 * administration never downloads any of this.
 *
 * One file per resource is also what lets the shell show a screen next to its
 * source: `declarations.ts` imports the very same files as text.
 */
export { commentsResource } from "@/demo/playground/resources/comments"
export { ordersResource } from "@/demo/playground/resources/orders"
export { overviewResource } from "@/demo/playground/resources/overview"
export { postsResource } from "@/demo/playground/resources/posts"
export { productsResource } from "@/demo/playground/resources/products"
export { roastsResource } from "@/demo/playground/resources/roasts"
export { usersResource } from "@/demo/playground/resources/users"
