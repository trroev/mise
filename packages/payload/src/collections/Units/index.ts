import type { CollectionConfig } from "payload"
import { everyone } from "../../access/everyone"
import { isAdmin } from "../../access/isAdmin"

export const Units: CollectionConfig = {
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: everyone,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["name", "abbreviation", "system", "type"],
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      required: true,
      type: "text",
    },
    {
      name: "abbreviation",
      required: true,
      type: "text",
    },
    {
      admin: {
        description:
          "Measurement system this unit belongs to. Count-type units may omit this.",
      },
      name: "system",
      options: [
        { label: "Metric", value: "metric" },
        { label: "Imperial", value: "imperial" },
      ],
      type: "select",
    },
    {
      admin: {
        description: "Category of measurement.",
      },
      name: "type",
      options: [
        { label: "Weight", value: "weight" },
        { label: "Volume", value: "volume" },
        { label: "Count", value: "count" },
      ],
      type: "select",
    },
    {
      admin: {
        description:
          "Multiplier to convert this unit to its base SI unit (gram for weight, milliliter for volume). Temperature units use offset conversions and may leave this blank.",
      },
      name: "conversionFactor",
      type: "number",
    },
  ],
  labels: {
    plural: "Units",
    singular: "Unit",
  },
  slug: "units",
}

/**
 * Seed data for all commonly needed units.
 * Base SI unit for weight is grams (conversionFactor = 1).
 * Base SI unit for volume is milliliters (conversionFactor = 1).
 * Temperature uses offset conversions, so conversionFactor is omitted.
 */
export const UNIT_SEEDS = [
  // Metric weight
  {
    abbreviation: "g",
    conversionFactor: 1,
    name: "Gram",
    system: "metric",
    type: "weight",
  },
  {
    abbreviation: "kg",
    conversionFactor: 1000,
    name: "Kilogram",
    system: "metric",
    type: "weight",
  },
  {
    abbreviation: "mg",
    conversionFactor: 0.001,
    name: "Milligram",
    system: "metric",
    type: "weight",
  },

  // Metric volume
  {
    abbreviation: "ml",
    conversionFactor: 1,
    name: "Milliliter",
    system: "metric",
    type: "volume",
  },
  {
    abbreviation: "l",
    conversionFactor: 1000,
    name: "Liter",
    system: "metric",
    type: "volume",
  },

  // Metric temperature (no conversionFactor — requires offset conversion, not a simple multiplier)
  { abbreviation: "°C", name: "Celsius", system: "metric" },

  // Imperial weight
  {
    abbreviation: "oz",
    conversionFactor: 28.3495,
    name: "Ounce",
    system: "imperial",
    type: "weight",
  },
  {
    abbreviation: "lb",
    conversionFactor: 453.592,
    name: "Pound",
    system: "imperial",
    type: "weight",
  },

  // Imperial volume
  {
    abbreviation: "tsp",
    conversionFactor: 4.928_92,
    name: "Teaspoon",
    system: "imperial",
    type: "volume",
  },
  {
    abbreviation: "tbsp",
    conversionFactor: 14.7868,
    name: "Tablespoon",
    system: "imperial",
    type: "volume",
  },
  {
    abbreviation: "fl oz",
    conversionFactor: 29.5735,
    name: "Fluid Ounce",
    system: "imperial",
    type: "volume",
  },
  {
    abbreviation: "cup",
    conversionFactor: 236.588,
    name: "Cup",
    system: "imperial",
    type: "volume",
  },
  {
    abbreviation: "pt",
    conversionFactor: 473.176,
    name: "Pint",
    system: "imperial",
    type: "volume",
  },
  {
    abbreviation: "qt",
    conversionFactor: 946.353,
    name: "Quart",
    system: "imperial",
    type: "volume",
  },

  // Imperial temperature (no conversionFactor — requires offset conversion, not a simple multiplier)
  { abbreviation: "°F", name: "Fahrenheit", system: "imperial" },

  // Count (no system, no conversion factor)
  { abbreviation: "pc", name: "Piece", type: "count" },
  { abbreviation: "ea", name: "Each", type: "count" },
  { abbreviation: "pinch", name: "Pinch", type: "count" },
] as const satisfies ReadonlyArray<{
  abbreviation: string
  conversionFactor?: number
  name: string
  system?: "imperial" | "metric"
  type?: "count" | "volume" | "weight"
}>
