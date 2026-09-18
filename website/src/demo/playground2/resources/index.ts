import { seedStudioData } from "@/demo/playground2/data"

/**
 * The resources of playground2's back office, one file each — see
 * `@/demo/playground/resources` for why that split exists.
 *
 * Importing this module is what opens the back office, and a view fetches as
 * soon as it mounts — so this is the last moment the fixtures can be written.
 * The builder screen goes through here too: it saves into two of these
 * resources, and a reader who lands on it first is just as much a first visit.
 */
seedStudioData()

export { cmsResource } from "@/demo/playground2/resources/cms"
export { commentsResource } from "@/demo/playground2/resources/comments"
export { companiesResource } from "@/demo/playground2/resources/companies"
export { ordersResource } from "@/demo/playground2/resources/orders"
export { overviewResource } from "@/demo/playground2/resources/overview"
export { postsResource } from "@/demo/playground2/resources/posts"
export { productsResource } from "@/demo/playground2/resources/products"
export { profilesResource } from "@/demo/playground2/resources/profiles"
export { roastsResource } from "@/demo/playground2/resources/roasts"
export { usersResource } from "@/demo/playground2/resources/users"
