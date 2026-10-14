import { Receipt } from "lucide-react"
import {
  DatePickerInputController,
  PriceInputController,
  SelectInputController,
} from "react-data-form"
import { createViewResource, layout } from "react-resource-view"
import { ORDER_STATUSES, ORDERS_ID, type Order } from "@/demo/playground/adminData"
import { POPUP } from "@/demo/playground/shared"

/**
 * An order is placed by a customer and never deleted from the back office: it
 * can be read and its status moved on, nothing else. The permissions say so,
 * and the buttons follow.
 */
export const ordersResource = createViewResource<Order>(ORDERS_ID, {
  name: "Orders",
  icon: Receipt,
  storage: "local",
  permissions: { create: false, delete: false },
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
  views: {
    list: {
      filters: {
        inputs: {
          status: {
            label: "Status",
            controller: SelectInputController,
            valueOptions: ORDER_STATUSES,
          },
        },
      },
      layouts: [layout.table()],
    },
    update: { title: "Edit an order", ...POPUP },
  },
})
