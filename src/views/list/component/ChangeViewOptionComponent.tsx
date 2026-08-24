import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs"

export default function ChangeViewOptionComponent() {
  const currentResource = useCurrentViewResourceContext()
  const viewOptions = currentResource.view.viewVariants
  if (!viewOptions || viewOptions.length < 2) return <></>

  return (
    <>
      <Tabs
        defaultValue={currentResource.viewVariant}
        onValueChange={(viewName) =>
          currentResource.setViewResource({
            ...currentResource.viewResource,
            viewVariant: viewName,
          })
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
                  <span className={"fc"}>{viewOption["name"]}</span>
                </div>
              ) : (
                <>{viewOption["name"]}</>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  )
}
