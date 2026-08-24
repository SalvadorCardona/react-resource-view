import ResourceViewButton, {
  ResourceButtonProps,
} from "@/action/ResourceViewButton"
import { ButtonGroup } from "@/ui/button-group"
import { ActionList } from "react-data-form"

export default function ListResourceViewButton(
  props: Omit<ResourceButtonProps, "action">
) {
  return (
    <ButtonGroup>
      <ResourceViewButton action={ActionList.read} {...props} />
      <ResourceViewButton action={ActionList.update} {...props} />
      <ResourceViewButton action={ActionList.delete} {...props} />
    </ButtonGroup>
  )
}
