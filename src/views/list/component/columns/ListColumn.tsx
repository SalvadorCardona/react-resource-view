import { useState } from "react"
import { Trans } from "react-mini-i18n"
import { ListComponentPropsInterface } from "@/ViewInterface"
import RowWrapperColumnComponent from "@/views/list/component/columns/RowWrapperColumn"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"

export default function ListColumn({ rows = [] }: ListComponentPropsInterface) {
  const currentViewOption = useCurrentViewResourceContext().view
  const [isDragging, setIsDragging] = useState(false)

  if (!rows.length) return <Trans>No data yet</Trans>

  const identifierKey = currentViewOption.identifierKey
  const identifierKeyList = currentViewOption.identifierKeyList
  if (!identifierKey) return <>Not Identifiant Found</>
  if (!identifierKeyList) return <>no identifierKeyList</>

  return (
    <div className={"flex gap-2"}>
      {identifierKeyList.map((currentIdentifier) => (
        <RowWrapperColumnComponent
          key={currentIdentifier.value as string}
          identifierKey={identifierKey}
          valueIdentifier={currentIdentifier}
          isDragging={isDragging}
          handleDragging={setIsDragging}
          rows={rows}
        />
      ))}
    </div>
  )
}
