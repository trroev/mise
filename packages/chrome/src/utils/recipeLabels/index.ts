import type { Recipe } from "@mise/payload/payload-types"

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
