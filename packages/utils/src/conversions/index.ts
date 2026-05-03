import type { MetricUnit } from "@mise/types/MetricUnit"
import type { USUnit } from "@mise/types/USUnit"
import { match } from "ts-pattern"

const ML_PER_TSP = 4.928_92
const ML_PER_TBSP = 14.7868
const ML_PER_CUP = 236.588
const L_PER_CUP = 0.236_588

type ConvertedUS = { value: number; unit: USUnit }

const FRACTION_TOLERANCE = 0.02

const TRAILING_ZEROS_RE = /\.?0+$/

const FRACTIONS = [
  { decimal: 0.125, symbol: "⅛" },
  { decimal: 1 / 3, symbol: "⅓" },
  { decimal: 0.25, symbol: "¼" },
  { decimal: 0.375, symbol: "⅜" },
  { decimal: 0.5, symbol: "½" },
  { decimal: 0.625, symbol: "⅝" },
  { decimal: 2 / 3, symbol: "⅔" },
  { decimal: 0.75, symbol: "¾" },
  { decimal: 0.875, symbol: "⅞" },
] as const

function convertMlToUS(value: number): ConvertedUS {
  return match(value)
    .when(
      (v) => v < ML_PER_TBSP,
      (v) => ({ value: v / ML_PER_TSP, unit: "tsp" as USUnit })
    )
    .when(
      (v) => v < ML_PER_CUP / 4,
      (v) => ({ value: v / ML_PER_TBSP, unit: "tbsp" as USUnit })
    )
    .otherwise((v) => ({ value: v / ML_PER_CUP, unit: "cup" as USUnit }))
}

export function convertToUS(value: number, unit: MetricUnit): ConvertedUS {
  return match(unit)
    .with("g", () => ({ value: value * 0.035_274, unit: "oz" as USUnit }))
    .with("kg", () => ({ value: value * 2.204_62, unit: "lb" as USUnit }))
    .with("ml", () => convertMlToUS(value))
    .with("l", () => ({ value: value / L_PER_CUP, unit: "cup" as USUnit }))
    .with("°C", () => ({ value: (value * 9) / 5 + 32, unit: "°F" as USUnit }))
    .exhaustive()
}

export function formatQuantity(value: number): string {
  const whole = Math.floor(value)
  const decimal = value - whole

  if (decimal < FRACTION_TOLERANCE) {
    return String(whole)
  }

  if (decimal > 1 - FRACTION_TOLERANCE) {
    return String(whole + 1)
  }

  const closest = FRACTIONS.reduce((best, frac) =>
    Math.abs(frac.decimal - decimal) < Math.abs(best.decimal - decimal)
      ? frac
      : best
  )

  if (Math.abs(closest.decimal - decimal) > FRACTION_TOLERANCE) {
    return value.toFixed(2).replace(TRAILING_ZEROS_RE, "")
  }

  return whole > 0 ? `${whole}${closest.symbol}` : closest.symbol
}

const METRIC_UNIT_LABELS: Record<MetricUnit, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  "°C": "°C",
} as const satisfies Record<MetricUnit, string>

export function formatIngredient(
  quantity: number,
  unit: MetricUnit,
  system: "metric" | "us"
): string {
  if (system === "metric") {
    return `${formatQuantity(quantity)} ${METRIC_UNIT_LABELS[unit]}`
  }

  const { value, unit: usUnit } = convertToUS(quantity, unit)
  return `${formatQuantity(value)} ${usUnit}`
}
