const longFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
})

const shortFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

type FormatDateOptions = {
  style?: "long" | "short"
}

export const formatDate = (
  value: Date | string | number,
  { style = "long" }: FormatDateOptions = {}
): string => {
  const date = value instanceof Date ? value : new Date(value)
  return style === "short"
    ? shortFormatter.format(date)
    : longFormatter.format(date)
}
