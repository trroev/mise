import type { UNIT_SYSTEMS } from "~/features/recipes/hooks/use-checklist-state"

export type BuildShareUrlUnits = (typeof UNIT_SYSTEMS)[number]

export type BuildShareUrlOptions = {
  origin: string
  slug: string
  yield?: number | null
  units?: BuildShareUrlUnits | null
}

export const buildShareUrl = ({
  origin,
  slug,
  yield: yieldValue,
  units,
}: BuildShareUrlOptions): string => {
  const url = new URL(`/recipes/${slug}`, origin)
  if (typeof yieldValue === "number" && Number.isFinite(yieldValue)) {
    url.searchParams.set("yield", String(yieldValue))
  }
  if (units) {
    url.searchParams.set("units", units)
  }
  return url.toString()
}
