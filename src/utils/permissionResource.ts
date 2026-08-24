import { ViewResourceInterface } from "@/ViewResourceInterface"
import { ActionList } from "react-data-form"

/**
 * Evaluates whether access is granted, whether it is declared as a boolean or a function
 */
function evaluateAccess(access: boolean | (() => boolean) | undefined): boolean {
  if (!access) return false

  return typeof access === "function" ? access() : access
}

export function permissionResource(
  resource: ViewResourceInterface,
  action: ActionList
): boolean {
  let access: boolean | (() => boolean) | undefined

  switch (action) {
    case ActionList.list:
    case ActionList.read:
      access = resource?.canRead
      break
    case ActionList.create:
      access = resource?.canCreate
      break
    case ActionList.update:
      access = resource?.canUpdate
      break
    case ActionList.delete:
      access = resource?.canDelete
      break
    default:
      return false
  }

  return evaluateAccess(access)
}
