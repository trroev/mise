import type { Recipe } from "@mise/payload/payload-types"
import { match, P } from "ts-pattern"

export const COURSE_LABELS: Readonly<Record<string, string>> = {
  appetizer: "Appetizer",
  entrée: "Entrée",
  dessert: "Dessert",
  side: "Side",
  snack: "Snack",
  bread: "Bread",
  other: "Other",
}

export const DIFFICULTY_ORDER = ["easy", "medium", "hard"] as const

export const DIFFICULTY_LABELS: Readonly<Record<string, string>> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

export const DIETARY_TAG_LABELS: Readonly<Record<string, string>> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-Free",
  "dairy-free": "Dairy-Free",
  "nut-free": "Nut-Free",
}

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
  tags: ReadonlyArray<string>
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
