export interface JsonPrettyComponentPropsInterface {
  data?: Record<string, any>
}

export default function JsonPrettyComponent({
  data,
}: JsonPrettyComponentPropsInterface) {
  return (
    <pre
      className={
        "bg-muted rounded-md  p-2 text-xs font-mono whitespace-pre-wrap break-words"
      }
    >
      {JSON.stringify(data ?? {}, null, 2)}
    </pre>
  )
}
