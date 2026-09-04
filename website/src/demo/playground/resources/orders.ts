import { Receipt } from "lucide-react"
import {
  ActionList,
  DatePickerInputController,
  PriceInputController,
  SelectInputController,
} from "react-data-form"
import { createViewResource, tableViewOptionFactory } from "react-resource-view"
import {
  ORDER_STATUSES,
  ORDERS_ID,
  type Order,
} from "@/demo/playground/adminData"
import { POPUP } from "@/demo/playground/resources/shared"

/**
 * An order is placed by a customer and never deleted from the back office: it
 * can be read and its status moved on, nothing else. The permissions say so,
 * and the buttons follow.
 */
export const ordersResource = createViewResource<Order>(ORDERS_ID, {
  name: "Orders",
  scope: "admin",
  icon: Receipt,
  canRead: true,
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
    viewVariants: [tableViewOptionFactory({ name: "Table" })],
  },
  views: {
    [ActionList.update]: { name: "Edit an order", ...POPUP },
  },
})
