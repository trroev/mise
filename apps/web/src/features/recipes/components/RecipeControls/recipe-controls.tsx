"use client"

import type { Recipe } from "@mise/payload/payload-types"
import type { MetricUnit } from "@mise/types/MetricUnit"
import { Input } from "@mise/ui/components/Input"
import { ToggleGroup } from "@mise/ui/components/ToggleGroup"
import { formatIngredient, formatQuantity } from "@mise/utils/conversions"
import { scaleIngredients } from "@mise/utils/scaling"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { match, P } from "ts-pattern"
import { z } from "zod"

type RawIngredientGroups = Recipe["ingredientGroups"]

export type RecipeControlsProps = {
  ingredientGroups: RawIngredientGroups
  baseYield: number
  yieldUnit: string
}

const UNIT_STORAGE_KEY = "recipe-unit-system"
const MAX_YIELD = 100
const METRIC_UNITS = new Set<string>(["g", "kg", "ml", "l", "°C"])

const unitSystemSchema = z.enum(["us", "metric"])
type UnitSystem = z.infer<typeof unitSystemSchema>

function resolveUnit(unit: string | { abbreviation: string }): string {
  return match(unit)
    .with(P.string, (u) => u)
    .otherwise((u) => u.abbreviation)
}

function readStoredUnitSystem(): UnitSystem | null {
  try {
    const raw = localStorage.getItem(UNIT_STORAGE_KEY)
    const parsed = unitSystemSchema.safeParse(raw)
    return match(parsed)
      .with({ success: true }, (r) => r.data)
      .otherwise(() => null)
  } catch {
    return null
  }
}

export const RecipeControls = ({
  ingredientGroups,
  baseYield,
  yieldUnit,
}: RecipeControlsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlUnits = unitSystemSchema.safeParse(searchParams.get("units"))
  const hasExplicitUnits = urlUnits.success
  const unitSystem: UnitSystem = match(urlUnits)
    .with({ success: true }, (r) => r.data)
    .otherwise(() => "metric" as const)

  const urlYield = searchParams.get("yield")
  const [targetYield, setTargetYield] = useState<number>(() => {
    const parsed = urlYield ? Number.parseInt(urlYield, 10) : Number.NaN
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : baseYield
  })

  const [isPreferenceResolved, setIsPreferenceResolved] =
    useState(hasExplicitUnits)

  useEffect(() => {
    match({ hasExplicitUnits, stored: readStoredUnitSystem() })
      .with({ hasExplicitUnits: true }, () => {
        setIsPreferenceResolved(true)
      })
      .with({ stored: P.nullish }, () => {
        setIsPreferenceResolved(true)
      })
      .otherwise(({ stored }) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("units", stored as UnitSystem)
        router.replace(`?${params.toString()}`, { scroll: false })
      })
  }, [hasExplicitUnits, router, searchParams])

  useEffect(() => {
    if (!hasExplicitUnits) {
      return
    }
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, unitSystem)
    } catch {
      // Ignore quota / privacy-mode failures.
    }
  }, [hasExplicitUnits, unitSystem])

  const normalizedGroups = useMemo(
    () =>
      ingredientGroups.map((group) => ({
        ...group,
        ingredients: group.ingredients.map((ing) => ({
          ...ing,
          unit: resolveUnit(ing.unit),
        })),
      })),
    [ingredientGroups]
  )

  const scaledGroups = useMemo(
    () => scaleIngredients(normalizedGroups, baseYield, targetYield),
    [normalizedGroups, baseYield, targetYield]
  )

  const handleUnitChange = (value: string) => {
    match(unitSystemSchema.safeParse(value))
      .with({ success: true }, (r) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("units", r.data)
        router.replace(`?${params.toString()}`, { scroll: false })
      })
      .otherwise(() => {
        // Ignore unknown toggle values.
      })
  }

  const handleYieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(e.target.value, 10)
    const next =
      Number.isFinite(parsed) && parsed >= 1 && parsed <= MAX_YIELD
        ? parsed
        : baseYield
    setTargetYield(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("yield", next.toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-heading-lg text-text-primary">
          Ingredients
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              className="font-sans text-body-sm text-text-muted"
              htmlFor="yield-input"
            >
              Yield
            </label>
            <Input
              className="w-20"
              id="yield-input"
              max={MAX_YIELD}
              min={1}
              onChange={handleYieldChange}
              type="number"
              value={targetYield}
            />
            {yieldUnit && (
              <span className="font-sans text-body-sm text-text-secondary">
                {yieldUnit}
              </span>
            )}
          </div>
          {isPreferenceResolved && (
            <ToggleGroup.Root
              aria-label="Unit system"
              onValueChange={(values) => {
                const next = values[0]
                if (next) {
                  handleUnitChange(next)
                }
              }}
              role="toolbar"
              value={[unitSystem]}
            >
              <ToggleGroup.Item value="metric">Metric</ToggleGroup.Item>
              <ToggleGroup.Item value="us">US</ToggleGroup.Item>
            </ToggleGroup.Root>
          )}
        </div>
      </div>

      {isPreferenceResolved ? (
        <div className="space-y-6">
          {scaledGroups.map((group, gi) => (
            <div key={group.id ?? gi}>
              {group.groupLabel && (
                <h3 className="mb-3 font-medium font-sans text-body-sm text-text-muted uppercase tracking-widest">
                  {group.groupLabel}
                </h3>
              )}
              <ul className="space-y-2">
                {group.ingredients.map((ingredient, ii) => {
                  const quantityLabel = match(METRIC_UNITS.has(ingredient.unit))
                    .with(true, () =>
                      formatIngredient(
                        ingredient.quantity,
                        ingredient.unit as MetricUnit,
                        unitSystem
                      )
                    )
                    .otherwise(
                      () =>
                        `${formatQuantity(ingredient.quantity)} ${ingredient.unit}`
                    )
                  return (
                    <li
                      className="font-sans text-body text-text-primary"
                      key={ingredient.id ?? ii}
                    >
                      <span className="text-text-secondary">
                        {quantityLabel}
                      </span>{" "}
                      {ingredient.name}
                      {ingredient.prepNote && (
                        <span className="text-text-muted">
                          , {ingredient.prepNote}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div aria-busy="true" className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              className="h-5 w-full animate-pulse rounded bg-surface"
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder rows have no identity
              key={i}
            />
          ))}
        </div>
      )}
    </section>
  )
}
