"use client"

import type { Recipe } from "@mise/payload/payload-types"
import type { MetricUnit } from "@mise/types/MetricUnit"
import { Input } from "@mise/ui/components/Input"
import { ToggleGroup } from "@mise/ui/components/ToggleGroup"
import { formatIngredient, formatQuantity } from "@mise/utils/conversions"
import { scaleIngredients } from "@mise/utils/scaling"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
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
  return typeof unit === "object" ? unit.abbreviation : unit
}

function readStoredUnitSystem(): UnitSystem | null {
  try {
    const raw = localStorage.getItem(UNIT_STORAGE_KEY)
    const parsed = unitSystemSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
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

  const urlUnitsRaw = searchParams.get("units")
  const urlUnits = unitSystemSchema.safeParse(urlUnitsRaw)
  const hasExplicitUnits = urlUnits.success
  const unitSystem: UnitSystem = urlUnits.success ? urlUnits.data : "metric"

  const urlYield = searchParams.get("yield")
  const [targetYield, setTargetYield] = useState<number>(() => {
    const parsed = urlYield ? Number.parseInt(urlYield, 10) : Number.NaN
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : baseYield
  })

  // Preference is "resolved" once we know whether to use the URL value or fall
  // back to defaults — only unresolved during the one-tick window where we
  // need to consult localStorage and potentially rewrite the URL.
  const [isPreferenceResolved, setIsPreferenceResolved] =
    useState(hasExplicitUnits)

  // First-load seeding: if the URL has no preference, consult localStorage
  // once and rewrite the URL so subsequent renders are URL-driven.
  useEffect(() => {
    if (hasExplicitUnits) {
      setIsPreferenceResolved(true)
      return
    }
    const stored = readStoredUnitSystem()
    if (!stored) {
      setIsPreferenceResolved(true)
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set("units", stored)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [hasExplicitUnits, router, searchParams])

  // Persist the active unit system as a "next-visit" cache.
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
    const parsed = unitSystemSchema.safeParse(value)
    if (!parsed.success) {
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set("units", parsed.data)
    router.replace(`?${params.toString()}`, { scroll: false })
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
                  const isMetricUnit = METRIC_UNITS.has(ingredient.unit)
                  const quantityLabel = isMetricUnit
                    ? formatIngredient(
                        ingredient.quantity,
                        ingredient.unit as MetricUnit,
                        unitSystem
                      )
                    : `${formatQuantity(ingredient.quantity)} ${ingredient.unit}`
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
