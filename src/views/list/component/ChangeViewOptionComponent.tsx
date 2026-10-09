import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import capitalizeFirst from "@/utils/capitalizeFirst"
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs"

export default function ChangeViewOptionComponent() {
  const currentResource = useCurrentViewResourceContext()
  const viewOptions = currentResource.view.viewVariants
  if (!viewOptions || viewOptions.length < 2) return <></>

  return (
    <>
      <Tabs
        // Controlled: the highlighted tab is the layout actually on screen,
        // never a selection the context did not keep.
        value={currentResource.viewVariant}
        onValueChange={(viewName) =>
          currentResource.setViewResource((current) => ({
            ...current,
            viewVariant: String(viewName),
          }))
        }
      >
        <TabsList>
          {viewOptions.map((viewOption) => (
            <TabsTrigger
              key={"tab-view-" + viewOption["name"]}
              value={viewOption["id"] ?? "undefined-view"}
            >
              {viewOption.icon ? (
                <div className={"flex justify-center items-center gap-2"}>
                  <viewOption.icon className={"text-xl"} />
                  <span className={"fc"}>{capitalizeFirst(viewOption["name"] ?? "")}</span>
                </div>
              ) : (
                <>{capitalizeFirst(viewOption["name"] ?? "")}</>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  )
}
