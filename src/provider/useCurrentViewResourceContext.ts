import { use } from "react"
import {
  CurrentResourceContext,
  CurrentViewResourceContext,
} from "@/provider/ViewResourceContextProvider"

export default function useCurrentViewResourceContext(): CurrentViewResourceContext {
  const context = use(CurrentResourceContext)

  return context as CurrentViewResourceContext
}
