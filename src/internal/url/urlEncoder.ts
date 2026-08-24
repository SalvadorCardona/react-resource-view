export const encodeQuery = (data: Record<string, any>): string => {
  return encodeURI(JSON.stringify(data))
}
export const decodeQuery = (url: string): Record<string, any> => {
  return JSON.parse(decodeURI(url))
}
