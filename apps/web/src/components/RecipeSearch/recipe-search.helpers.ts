import type { Recipe } from "@mise/payload/payload-types"
import { match, P } from "ts-pattern"

type Course = NonNullable<Recipe["course"]>
type Difficulty = NonNullable<Recipe["difficulty"]>
type DietaryTag = NonNullable<Recipe["dietaryTags"]>[number]

export const COURSE_LABELS = {
  appetizer: "Appetizer",
  entrée: "Entrée",
  dessert: "Dessert",
  side: "Side",
  snack: "Snack",
  bread: "Bread",
  other: "Other",
} as const satisfies Record<Course, string>

export const DIFFICULTY_ORDER = [
  "easy",
  "medium",
  "hard",
] as const satisfies ReadonlyArray<Difficulty>

export const DIFFICULTY_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const satisfies Record<Difficulty, string>

export const DIETARY_TAG_LABELS = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-Free",
  "dairy-free": "Dairy-Free",
  "nut-free": "Nut-Free",
} as const satisfies Record<DietaryTag, string>

export const TIME_RANGE_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "under-30", label: "Under 30 min" },
  { value: "30-60", label: "30–60 min" },
  { value: "over-60", label: "Over 1 hour" },
] as const

export type TimeRange = (typeof TIME_RANGE_OPTIONS)[number]["value"]

export const getCuisineId = (cuisine: Recipe["cuisine"]): string | null =>
  match(cuisine)
    .with(P.nullish, () => null)
    .with(P.string, (id) => id)
    .with({ id: P.string }, (c) => c.id)
    .exhaustive()

export const getCuisineName = (cuisine: Recipe["cuisine"]): string | null =>
  match(cuisine)
    .with(P.nullish, () => null)
    .with(P.string, () => null)
    .with({ name: P.string }, (c) => c.name)
    .exhaustive()

export const applyFacetFilters = (
  list: ReadonlyArray<Recipe>,
  course: string,
  cuisine: string,
  difficulty: string,
  tags: ReadonlyArray<string>,
  timeRange: string
): Array<Recipe> =>
  list.filter((recipe) => {
    if (course && recipe.course !== course) {
      return false
    }
    if (cuisine && getCuisineId(recipe.cuisine) !== cuisine) {
      return false
    }
    if (difficulty && recipe.difficulty !== difficulty) {
      return false
    }
    if (tags.length > 0) {
      const recipeTags = (recipe.dietaryTags as Array<string> | null) ?? []
      if (!tags.every((tag) => recipeTags.includes(tag))) {
        return false
      }
    }
    if (timeRange) {
      const t = recipe.totalTime
      const passes = match(timeRange)
        .with("under-30", () => t != null && t < 30)
        .with("30-60", () => t != null && t >= 30 && t <= 60)
        .with("over-60", () => t != null && t > 60)
        .otherwise(() => true)
      if (!passes) {
        return false
      }
    }
    return true
  })

export const getNoResultsMessage = (
  trimmed: string,
  isSearching: boolean,
  hasActiveFilters: boolean
): string =>
  match({ isSearching, hasActiveFilters })
    .with(
      { isSearching: true, hasActiveFilters: true },
      () => `No recipes match "${trimmed}" with the active filters.`
    )
    .with(
      { isSearching: true },
      () => `No recipes match "${trimmed}". Try a different search.`
    )
    .otherwise(() => "No recipes match the active filters.")
