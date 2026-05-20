import { z } from "zod"

export const COURSE_OPTIONS = [
  { value: "appetizer", label: "Appetizer" },
  { value: "entrée", label: "Entrée" },
  { value: "dessert", label: "Dessert" },
  { value: "side", label: "Side" },
  { value: "snack", label: "Snack" },
  { value: "bread", label: "Bread" },
  { value: "other", label: "Other" },
] as const satisfies ReadonlyArray<{ value: string; label: string }>

export const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const satisfies ReadonlyArray<{ value: string; label: string }>

export const DIETARY_TAGS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "nut-free", label: "Nut-free" },
] as const satisfies ReadonlyArray<{ value: string; label: string }>

export type Course = (typeof COURSE_OPTIONS)[number]["value"]
export type Difficulty = (typeof DIFFICULTY_OPTIONS)[number]["value"]
export type DietaryTag = (typeof DIETARY_TAGS)[number]["value"]

const ingredientSchema = z.object({
  name: z.string().min(1, "Required."),
  quantity: z.number().min(0, "Must be ≥ 0."),
  unit: z.string().min(1, "Required."),
  prepNote: z.string(),
})

const stepSchema = z.object({
  description: z.string().min(1, "Required."),
  timerMinutes: z.number().min(0).optional(),
})

export const recipeSubmissionFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string(),
  heroImageAlt: z.string(),
  cuisine: z.string(),
  course: z.string(),
  difficulty: z.string(),
  dietaryTags: z.array(z.string()),
  prepTime: z.string(),
  cookTime: z.string(),
  yieldQuantity: z.string(),
  yieldUnit: z.string(),
  ingredientGroups: z
    .array(
      z.object({
        groupLabel: z.string(),
        ingredients: z
          .array(ingredientSchema)
          .min(1, "Add at least one ingredient."),
      })
    )
    .min(1, "Add at least one ingredient group."),
  instructionGroups: z
    .array(
      z.object({
        groupLabel: z.string(),
        steps: z.array(stepSchema).min(1, "Add at least one step."),
      })
    )
    .min(1, "Add at least one instruction group."),
})

export type RecipeSubmissionFormValues = z.infer<
  typeof recipeSubmissionFormSchema
>

export const emptyIngredient =
  (): RecipeSubmissionFormValues["ingredientGroups"][number]["ingredients"][number] => ({
    name: "",
    quantity: 0,
    unit: "",
    prepNote: "",
  })

export const emptyIngredientGroup =
  (): RecipeSubmissionFormValues["ingredientGroups"][number] => ({
    groupLabel: "",
    ingredients: [emptyIngredient()],
  })

export const emptyStep =
  (): RecipeSubmissionFormValues["instructionGroups"][number]["steps"][number] => ({
    description: "",
    timerMinutes: undefined,
  })

export const emptyInstructionGroup =
  (): RecipeSubmissionFormValues["instructionGroups"][number] => ({
    groupLabel: "",
    steps: [emptyStep()],
  })

export const parseOptionalNumber = (
  value: string | undefined
): number | undefined => {
  if (!value || value.trim() === "") {
    return
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}
