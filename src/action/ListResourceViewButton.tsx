import ResourceViewButton, {
  ResourceButtonProps,
} from "@/action/ResourceViewButton"
import { ButtonGroup } from "@/ui/button-group"
import { ActionList } from "react-data-form"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { getResourceConfig } from "@/ResourceConfig"

/**
 * What a row offers unless the view says otherwise.
 *
 * Read is not in it. A row is already the record — the table edits it in place,
 * and the other layouts draw it in full — so a button whose only job is to show
 * the same fields again earns none of the width it takes. `read` is one entry
 * away for a resource whose detail view carries more than the list does.
 */
export const DEFAULT_ROW_ACTIONS: ActionList[] = [
  ActionList.update,
  ActionList.delete,
]

/**
 * The actions a row offers, in the order they are drawn.
 *
 * Read on its own by whoever needs to know whether there is anything to draw
 * at all — a layout putting the buttons behind a separator has to leave both
 * out when the resource permits none of them.
 */
export function useRowActions(
  resource?: ResourceButtonProps["resource"]
): ActionList[] {
  const currentResourceContext = useCurrentViewResourceContext()

  return (
    resource?.view?.behavior?.rowActions ??
    currentResourceContext?.view?.behavior?.rowActions ??
    getResourceConfig()?.defaultResource?.views?.[ActionList.list]?.behavior
      ?.rowActions ??
    DEFAULT_ROW_ACTIONS
  )
}

/**
 * The buttons at the end of a row.
 *
 * Which ones are drawn is the view's decision — `behavior.rowActions` — because
 * it depends on what the row already does. A table whose cells are editable in
 * place needs no read button, and three buttons are three buttons' worth of
 * width taken from the columns. Permissions are applied by each button, so an
 * action listed here that the resource forbids simply renders nothing.
 */
export default function ListResourceViewButton(
  props: Omit<ResourceButtonProps, "action">
) {
  const actions = useRowActions(props.resource)

  return (
    <ButtonGroup>
      {actions.map((action) => (
        <ResourceViewButton key={action} action={action} {...props} />
      ))}
    </ButtonGroup>
  )
}
