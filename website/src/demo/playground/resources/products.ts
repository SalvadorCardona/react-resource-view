import { Package } from "lucide-react"
import {
  ActionList,
  NumberInputController,
  PriceInputController,
  SelectInputController,
} from "react-data-form"
import {
  cardViewOptionFactory,
  createViewResource,
  tableViewOptionFactory,
} from "react-resource-view"
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCTS_ID,
  type Product,
} from "@/demo/playground/adminData"
import { ProductRow } from "@/demo/playground/adminRows"
import { POPUP } from "@/demo/playground/resources/shared"

/** The catalogue. Edit a price straight in the table: every cell is a field. */
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
      tableViewOptionFactory({ name: "Table" }),
      cardViewOptionFactory({ name: "Cards", grid: 3, rowComponent: ProductRow }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New product", ...POPUP },
    [ActionList.update]: { name: "Edit a product", ...POPUP },
    [ActionList.delete]: { name: "Delete a product", ...POPUP },
  },
})
