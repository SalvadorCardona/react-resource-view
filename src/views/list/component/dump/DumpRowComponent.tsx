import { RowComponentPropsInterface } from "@/ViewInterface"
import { Trans } from "react-mini-i18n"

import { DefaultItemComponent } from "@/views/list/component/DefaultItemComponent"

export function DumpRowComponent({ row }: RowComponentPropsInterface) {
  if (!row || !row.data) return <Trans>No data yet</Trans>

  return (
    <div className={`w-full`}>
      {Object.entries(row.data).map(([key, value]) => (
        <div key={key} className="flex py-2">
          <div className="w-1/2 font-semibold text-foreground">{key}</div>
          <div className="w-1/2">
            <DefaultItemComponent
              key={"item-cell" + key}
              formInput={{ value: value }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
