"use client"

import type { Recipe } from "@mise/payload/payload-types"
import type { MetricUnit } from "@mise/types/MetricUnit"
import { Input } from "@mise/ui/components/Input"
import { ToggleGroup } from "@mise/ui/components/ToggleGroup"
import { formatIngredient, formatQuantity } from "@mise/utils/conversions"
import { scaleIngredients } from "@mise/utils/scaling"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type RawIngredientGroups = Recipe["ingredientGroups"]

export type RecipeControlsProps = {
  ingredientGroups: RawIngredientGroups
  baseYield: number
  yieldUnit: string
}

const UNIT_STORAGE_KEY = "recipe-unit-system"
const MAX_YIELD = 100
const METRIC_UNITS = new Set<string>(["g", "kg", "ml", "l", "°C"])

function resolveUnit(unit: string | { abbreviation: string }): string {
  return typeof unit === "object" ? unit.abbreviation : unit
}

export const RecipeControls = ({
  ingredientGroups,
  baseYield,
  yieldUnit,
}: RecipeControlsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlUnits = searchParams.get("units")
  const urlYield = searchParams.get("yield")

  const [unitSystem, setUnitSystem] = useState<"metric" | "us">(
    urlUnits === "us" ? "us" : "metric"
  )
  const [targetYield, setTargetYield] = useState<number>(() => {
    const parsed = urlYield ? Number.parseInt(urlYield, 10) : Number.NaN
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : baseYield
  })

  // On mount: if no units URL param, load from localStorage
  useEffect(() => {
    if (urlUnits) {
      return
    }
    const stored = localStorage.getItem(UNIT_STORAGE_KEY)
    if (stored === "us" || stored === "metric") {
      setUnitSystem(stored)
    }
  }, [urlUnits])

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
    if (value !== "metric" && value !== "us") {
      return
    }
    setUnitSystem(value)
    localStorage.setItem(UNIT_STORAGE_KEY, value)
    const params = new URLSearchParams(searchParams.toString())
    params.set("units", value)
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
          <ToggleGroup.Root
            onValueChange={(values) => {
              const next = values[0]
              if (next) {
                handleUnitChange(next)
              }
            }}
            value={[unitSystem]}
          >
            <ToggleGroup.Item value="metric">Metric</ToggleGroup.Item>
            <ToggleGroup.Item value="us">US</ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>
      </div>

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
                    <span className="text-text-secondary">{quantityLabel}</span>{" "}
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
    </section>
  )
}
