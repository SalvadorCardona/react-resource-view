import { createContext, use } from "react"
import { ResourceConfigInterface } from "@/ResourceConfig"

/** The configuration `ResourceViewProvider` was given, for the views under it. */
export const ResourceViewConfigurationContext = createContext<{
  configuration?: ResourceConfigInterface
}>({})

export function useResourceViewConfiguration(): ResourceConfigInterface | undefined {
  return use(ResourceViewConfigurationContext).configuration
}
