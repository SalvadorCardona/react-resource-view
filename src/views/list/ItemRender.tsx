import { FormInputInterface } from "react-data-form"
import { translate } from "react-mini-i18n"
import { isApiIri } from "jsonld-item"
import { getApiDialect } from "@/api/apiConfig"
import { Badge } from "@/ui/badge"
import ApiUri from "@/components/ApiUri"
import JsonPrettyComponent from "@/ui/JsonPrettyComponent"
import { Text } from "@/ui/Text"
export default function ItemRender(value: FormInputInterface["value"]) {
  if (typeof value === "boolean") {
    return translate(String(value))
  }

  // Only a JSON-LD API answers a relation with an IRI worth dereferencing.
  // Elsewhere a string that looks like a path is just a string.
  if (
    typeof value === "string" &&
    getApiDialect().referencesAreIris &&
    isApiIri(value)
  )
    return (
      <Badge className={"capitalize-first whitespace-nowrap"}>
        <ApiUri iri={value} />
      </Badge>
    )

  if (Array.isArray(value)) return value.join(", ")

  if (typeof value === "object") return <JsonPrettyComponent data={value} />

  return <Text variant="p">{value}</Text>
}
