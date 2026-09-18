import { getInStorage, setInStorage } from "ssr-safe-storage"
import { roasteryFixtures, writeCollection } from "@/demo/playground/adminData"
import { SAMPLE_PAGES, SAMPLE_PROFILES } from "@/demo/playground2/documents"

/**
 * The collections playground2's back office runs on, and the rows they start
 * from.
 *
 * The roastery is the one `/playground` shows — the same people, the same blog,
 * the same schedule — read from `roasteryFixtures` rather than written down a
 * second time. The storage ids are this playground's own, because a resource
 * without a `path` stores itself under its IRI: two back offices, two sandboxes,
 * and an edit made in one never surprises the reader in the other.
 *
 * On top of it, the two collections `/playground` has no equivalent of: the
 * pages and the CVs the page builder assembles.
 */

export const OVERVIEW_ID = "playground2_overview"
export const USERS_ID = "playground2_users"
export const COMPANIES_ID = "playground2_companies"
export const POSTS_ID = "playground2_posts"
export const COMMENTS_ID = "playground2_comments"
export const PRODUCTS_ID = "playground2_products"
export const ORDERS_ID = "playground2_orders"
export const ROASTS_ID = "playground2_roasts"
export const CMS_ID = "playground2_pages"
export const PROFILES_ID = "playground2_profiles"

/**
 * What every screen of this scope describes its records with: the option lists
 * and the row types of the same roastery, re-exported here so a resource of
 * playground2 has one module to read its data from.
 */
export {
  COMMENT_STATUSES,
  COMPANY_STATUSES,
  ORDER_STATUSES,
  POST_CATEGORIES,
  POST_STATUSES,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  ROAST_PROFILES,
  ROAST_STATUSES,
  ROASTERS,
  USER_ROLES,
  USER_STATUSES,
  readAdminRows as readStudioRows,
  type Comment,
  type Company,
  type Order,
  type Post,
  type Product,
  type Roast,
  type User,
} from "@/demo/playground/adminData"

/** Every collection of this back office, with the rows it starts from. */
function fixtures(): Array<[string, Array<{ id: string }>]> {
  const roastery = roasteryFixtures()

  return [
    [COMPANIES_ID, roastery.companies],
    [USERS_ID, roastery.users],
    [POSTS_ID, roastery.posts],
    [COMMENTS_ID, roastery.comments],
    [PRODUCTS_ID, roastery.products],
    [ORDERS_ID, roastery.orders],
    [ROASTS_ID, roastery.roasts],
    [CMS_ID, SAMPLE_PAGES],
    [PROFILES_ID, SAMPLE_PROFILES],
  ]
}

const SEED_VERSION_ID = "playground2_seed_version"

/**
 * Bumped whenever the fixtures gain a collection or a field a screen relies on
 * — the roastery and the sample pages, this time, where the back office used to
 * open on two empty lists.
 */
const SEED_VERSION = "1"

/**
 * Writes the fixtures, and only where nothing is stored yet.
 *
 * Like `/playground`, the administration keeps what the reader did to it: a
 * page renamed on Monday is still renamed on Tuesday. A reader who opened
 * playground2 before it had fixtures carries no version number, which is what
 * makes this write the whole roastery for them rather than leave them with the
 * two empty collections they left behind.
 */
export function seedStudioData(): void {
  if (getInStorage(SEED_VERSION_ID) !== SEED_VERSION) {
    resetStudioData()
    return
  }

  for (const [id, rows] of fixtures()) {
    if (getInStorage(id) == null) writeCollection(id, rows)
  }
}

/** Throws away every edit and writes the fixtures again. */
export function resetStudioData(): void {
  for (const [id, rows] of fixtures()) writeCollection(id, rows)
  setInStorage(SEED_VERSION_ID, SEED_VERSION)
}
