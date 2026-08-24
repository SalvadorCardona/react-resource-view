import { createForm } from "react-data-form"
import useCurrentViewResourceContext from "@/provider/useCurrentViewResourceContext"
import { FormInterface } from "react-data-form"
import { RecordOfAny } from "@/internal/type/RecordOfAny"
import { useForm, FormContextOutput } from "react-data-form"
import isObjectEmpty from "@/internal/object/objectIsEmpty"
import { cleanValuesInObject } from "@/internal/object/cleanValuesInObject"
import { useMemo } from "react"
import { deepMerge } from "@/internal/object/deepMerge"
import { ViewResourceInterface } from "@/ViewResourceInterface"
import FormGroupProviderFilter from "@/views/list/filter/FormGroupProviderFilter"

export type FilterInterface = Record<string, any>

export interface FilterInputsInterface {
  onChange?: (filter: FilterInterface) => void
}

export interface FilterOutputsInterface {
  updateFilter: (filter: FilterInterface, merge?: boolean) => void
  resetFilter: (filter: FilterInterface) => void
  filter: FilterInterface
  filterIsEmpty: boolean
  formContext: FormContextOutput
}

const defaultFormFilter: Partial<FormInterface> = {
  saveOnChange: true,
  components: {
    formGroupProvider: FormGroupProviderFilter,
  },
}

function getFormFilter(resource: ViewResourceInterface): FormInterface | undefined {
  return resource?.views?.list?.formFilter ?? undefined
}

function getDefaultFilter(resource: ViewResourceInterface): FilterInterface {
  return resource?.views?.list?.defaultFilter ?? {}
}

export default function useFilter({
  onChange,
}: FilterInputsInterface): FilterOutputsInterface {
  const {
    resource,
    filter: resourceFilter,
    setFilter,
  } = useCurrentViewResourceContext()

  // Work out the initial values, in order of precedence
  const initialValues = useMemo(() => {
    const formInterface = deepMerge(defaultFormFilter, getFormFilter(resource) ?? {})

    // Precedence: defaultFilter > queryFilter > empty
    let initialData = !isObjectEmpty(resourceFilter) ? resourceFilter : undefined

    if (resourceFilter) {
      initialData = deepMerge(initialData ?? {}, resourceFilter)
    }

    return createForm(formInterface, initialData)
  }, [resource, resourceFilter])

  const formContext = useForm({
    form: initialValues,
    data: initialValues.data,
    onChange: (data) => {
      const dataClean = cleanValuesInObject(data)
      setFilter(dataClean)
      onChange?.(dataClean)
    },
  })

  const filter = useMemo(() => {
    return cleanValuesInObject({ ...formContext.form.data })
  }, [formContext.form.data])

  const defaultFilter = useMemo(() => getDefaultFilter(resource), [resource])

  const userFilter = useMemo(() => {
    const userData: FilterInterface = {}
    Object.entries(formContext.form.inputs ?? {}).forEach(([key, input]) => {
      if (input?.generatedValue) return
      // A value left at its default is not a search; otherwise "clear search"
      // would be offered permanently.
      if (input?.value === defaultFilter[key]) return
      userData[key] = input?.value
    })
    return cleanValuesInObject(userData)
  }, [formContext.form.inputs, defaultFilter])

  const filterIsEmpty = useMemo(() => isObjectEmpty(userFilter), [userFilter])

  const updateFilter = (currentFilter: RecordOfAny, partial = true) => {
    formContext.updateData(currentFilter, partial)
  }

  /**
   * « Nettoyer la recherche » ne vide que ce que l'utilisateur a saisi. Deux
   * two kinds of filter survive:
   * - those injected by the context — generated inputs, such as the parent set
   *   by a sub-view's `onInitViewResource` — which define the scope of the
   *   list: losing them would show the rows of every
   *   entreprises ;
   * - the view's default filters, which are the list's resting state.
   */
  const resetFilter = (filter: FilterInterface = {}) => {
    const injectedFilter: FilterInterface = {}
    Object.entries(formContext.form.inputs ?? {}).forEach(([key, input]) => {
      if (input?.generatedValue) injectedFilter[key] = input.value
    })

    updateFilter(
      { ...defaultFilter, ...cleanValuesInObject(injectedFilter), ...filter },
      false
    )
  }

  return {
    formContext,
    updateFilter,
    filter,
    filterIsEmpty,
    resetFilter,
  }
}
