/**
 * Serialises an object for transport in a query parameter.
 *
 * `encodeURIComponent` rather than `encodeURI`: the latter leaves `&`, `=` and
 * `#` untouched, so a value containing any of them — "Tom & Jerry" — would end
 * the parameter early and lose everything after it.
 */
export const encodeQuery = (data: Record<string, any>): string => {
  return encodeURIComponent(JSON.stringify(data))
}

/**
 * Reads back what {@link encodeQuery} wrote.
 *
 * `decodeURIComponent` also reads the output of the earlier `encodeURI`
 * encoding, so links generated before the fix keep working.
 */
export const decodeQuery = (url: string): Record<string, any> => {
  return JSON.parse(decodeURIComponent(url))
}
