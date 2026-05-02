import type { Recipe } from "@mise/payload/payload-types"

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

export const getCuisineId = (cuisine: Recipe["cuisine"]): string | null => {
  if (!cuisine) {
    return null
  }
  if (typeof cuisine === "string") {
    return cuisine
  }
  return cuisine.id
}

export const getCuisineName = (cuisine: Recipe["cuisine"]): string | null => {
  if (!cuisine) {
    return null
  }
  if (typeof cuisine === "string") {
    return null
  }
  return cuisine.name
}

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
): string => {
  if (isSearching && hasActiveFilters) {
    return `No recipes match "${trimmed}" with the active filters.`
  }
  if (isSearching) {
    return `No recipes match "${trimmed}". Try a different search.`
  }
  return "No recipes match the active filters."
}
