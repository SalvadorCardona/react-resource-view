import {
  MessageSquare,
  Package,
  Receipt,
  ScrollText,
  Users,
} from "lucide-react"
import {
  ActionList,
  DatePickerInputController,
  EmailInputController,
  NumberInputController,
  PriceInputController,
  SelectInputController,
  TextAreaInputController,
} from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  itemViewOptionFactory,
  tableViewOptionFactory,
} from "react-resource-view"
import {
  COMMENT_STATUSES,
  COMMENTS_ID,
  ORDER_STATUSES,
  ORDERS_ID,
  POST_CATEGORIES,
  POST_STATUSES,
  POSTS_ID,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCTS_ID,
  USER_ROLES,
  USER_STATUSES,
  USERS_ID,
  type Comment,
  type Order,
  type Post,
  type Product,
  type User,
} from "@/demo/playground/adminData"
import {
  CommentRow,
  PostRow,
  ProductRow,
  UserRow,
} from "@/demo/playground/adminRows"

/**
 * The five resources of the playground's back office.
 *
 * They are declared here rather than in a page because `createViewResource`
 * writes into the shared resource registry — declaring the same IRI twice would
 * register it twice. The module is only imported by `adminScope`, which the
 * playground loads lazily: a reader who never opens the administration never
 * downloads it.
 *
 * Every one of them opens its forms over the list — see `POPUP` below — and
 * none of them declares a read view: in a back office the record is edited,
 * not contemplated, and a screen that shows the same fields without letting
 * anyone touch them is a second way to do nothing.
 */

/**
 * How every form of the administration opens: over the list it was started
 * from, rather than on a screen of its own.
 *
 * A back office is a place where records are dispatched one after another —
 * approve this comment, fix that price, invite that user. Leaving the list to
 * fill in three fields, and coming back to look for where one was, costs more
 * than the form itself; the dialog keeps the list underneath and hands it back
 * untouched, filters and page included.
 *
 * `closeAfterUpdate` is what makes a creation end there. Without it the form
 * moves on to the new record's edit screen — the right thing on a screen of
 * its own, where the alternative is an empty "New user" nobody asked to see
 * again, and the wrong thing here: the list the dialog was opened over is
 * exactly where the next record is created from.
 */
const POPUP = {
  behavior: { openIn: "popup", closeAfterUpdate: true },
} as const

export const usersResource = createViewResource<User>(USERS_ID, {
  name: "Users",
  scope: "admin",
  // Read by `createItemMenuWithResource`, so the menu of the scope is built
  // from the resources themselves rather than written a second time.
  icon: Users,
  // What opens the list — `canRead` is the permission both the list and the
  // detail are checked against. The detail is never linked to: the row actions
  // of a list are edit and delete, and neither the menu nor the shell offers a
  // way in.
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Users",
    description: "Everyone who can sign in to the back office.",
    // One description drives three screens: the table's columns, the create
    // form and the edit form.
    // No `label.title`: the form is already named by whatever frames it — the
    // dialog it opens in, or the shell's page heading — and repeating "User"
    // under "Edit a user" is a heading that says nothing.
    form: {
      inputs: {
        name: { label: "Name", required: true },
        email: {
          label: "E-mail",
          required: true,
          controller: EmailInputController,
        },
        role: {
          label: "Role",
          controller: SelectInputController,
          valueOptions: USER_ROLES,
        },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: USER_STATUSES,
        },
        signedUpAt: { label: "Joined on", controller: DatePickerInputController },
      },
    },
    formFilter: {
      inputs: {
        name: { label: "Search a name" },
        role: {
          label: "Role",
          controller: SelectInputController,
          valueOptions: USER_ROLES,
        },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: USER_STATUSES,
        },
      },
    },
    viewVariants: [
      tableViewOptionFactory(),
      cardViewOptionFactory({ grid: 3, rowComponent: UserRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New user", ...POPUP },
    [ActionList.update]: { name: "Edit a user", ...POPUP },
    [ActionList.delete]: { name: "Delete a user", ...POPUP },
  },
})

export const postsResource = createViewResource<Post>(POSTS_ID, {
  name: "Posts",
  scope: "admin",
  icon: ScrollText,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Posts",
    description: "The blog, from the first draft to the day it goes out.",
    form: {
      inputs: {
        title: { label: "Title", required: true },
        author: { label: "Author" },
        category: {
          label: "Category",
          controller: SelectInputController,
          valueOptions: POST_CATEGORIES,
        },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: POST_STATUSES,
        },
        publishedAt: {
          label: "Published on",
          controller: DatePickerInputController,
        },
        views: { label: "Views", controller: NumberInputController },
      },
    },
    formFilter: {
      inputs: {
        title: { label: "Search a title" },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: POST_STATUSES,
        },
      },
    },
    // Neither the board nor the split, although an editorial workflow is what
    // both were made for: the published version wraps a row twice on its way
    // to the column layout, and loses the chosen layout on the navigation the
    // split makes when a row is picked. Both are fixed in the package — worth
    // adding back here once that ships.
    viewVariants: [
      tableViewOptionFactory(),
      cardViewOptionFactory({ grid: 3, rowComponent: PostRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New post", ...POPUP },
    [ActionList.update]: { name: "Edit a post", ...POPUP },
    [ActionList.delete]: { name: "Delete a post", ...POPUP },
  },
})

export const commentsResource = createViewResource<Comment>(COMMENTS_ID, {
  name: "Comments",
  scope: "admin",
  icon: MessageSquare,
  canRead: true,
  // A comment is written by a visitor, never by the back office: leaving
  // `canCreate` out is what removes the button, no condition to write anywhere.
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Comments",
    description: "What readers left under the posts, waiting for a decision.",
    form: {
      inputs: {
        author: { label: "Author", required: true },
        post: { label: "Post" },
        message: { label: "Message", controller: TextAreaInputController },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: COMMENT_STATUSES,
        },
        createdAt: { label: "Left on", controller: DatePickerInputController },
      },
    },
    formFilter: {
      inputs: {
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: COMMENT_STATUSES,
        },
      },
    },
    // Moderation reads whole comments rather than columns of cells, so the
    // list of records comes before the table.
    viewVariants: [
      itemViewOptionFactory({ rowComponent: CommentRow }),
      tableViewOptionFactory(),
    ],
  },
  views: {
    [ActionList.update]: { name: "Moderate a comment", ...POPUP },
    [ActionList.delete]: { name: "Delete a comment", ...POPUP },
  },
})

export const productsResource = createViewResource<Product>(PRODUCTS_ID, {
  name: "Products",
  scope: "admin",
  icon: Package,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Products",
    description: "The catalogue, its prices and what is left in the warehouse.",
    form: {
      inputs: {
        name: { label: "Name", required: true },
        sku: { label: "SKU" },
        category: {
          label: "Category",
          controller: SelectInputController,
          valueOptions: PRODUCT_CATEGORIES,
        },
        // Prices are held in cents, which is what this controller reads and
        // writes — the display, the separator and the currency are the form
        // ports' business.
        price: { label: "Price", controller: PriceInputController },
        stock: { label: "Stock", controller: NumberInputController },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: PRODUCT_STATUSES,
        },
      },
    },
    formFilter: {
      inputs: {
        name: { label: "Search a product" },
        category: {
          label: "Category",
          controller: SelectInputController,
          valueOptions: PRODUCT_CATEGORIES,
        },
      },
    },
    viewVariants: [
      tableViewOptionFactory(),
      cardViewOptionFactory({ grid: 3, rowComponent: ProductRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New product", ...POPUP },
    [ActionList.update]: { name: "Edit a product", ...POPUP },
    [ActionList.delete]: { name: "Delete a product", ...POPUP },
  },
})

export const ordersResource = createViewResource<Order>(ORDERS_ID, {
  name: "Orders",
  scope: "admin",
  icon: Receipt,
  canRead: true,
  // An order is placed by a customer and never deleted from the back office:
  // it can be read and its status moved on, nothing else.
  canUpdate: true,
  view: {
    name: "Orders",
    description: "What the shop has sold, and where each parcel stands.",
    form: {
      inputs: {
        reference: { label: "Reference", required: true },
        customer: { label: "Customer" },
        total: { label: "Total", controller: PriceInputController },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: ORDER_STATUSES,
        },
        placedAt: { label: "Placed on", controller: DatePickerInputController },
      },
    },
    formFilter: {
      inputs: {
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: ORDER_STATUSES,
        },
      },
    },
    viewVariants: [tableViewOptionFactory()],
  },
  views: {
    [ActionList.update]: { name: "Edit an order", ...POPUP },
  },
})
