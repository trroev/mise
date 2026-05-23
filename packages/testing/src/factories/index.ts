import type { User as AuthUser } from "@mise/auth"

export type RecipeFixture = {
  id: string
  title: string
  slug: string
  generateSlug?: boolean | null
  description?: string | null
  cuisine?: string | null
  author?: string | null
  authorUser?: string | null
  course?:
    | "appetizer"
    | "entrée"
    | "dessert"
    | "side"
    | "snack"
    | "bread"
    | "other"
    | null
  difficulty?: "easy" | "medium" | "hard" | null
  dietaryTags?: Array<
    "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free"
  > | null
  prepTime?: number | null
  cookTime?: number | null
  totalTime?: number | null
  yield?: { quantity?: number | null; unit?: string | null }
  ingredientGroups: Array<IngredientGroupFixture>
  instructionGroups: Array<InstructionGroupFixture>
  publishedAt?: string | null
  _status?: "draft" | "published" | null
  createdAt: string
  updatedAt: string
}

export type IngredientGroupFixture = {
  id?: string | null
  groupLabel?: string | null
  ingredients: Array<{
    id?: string | null
    name: string
    quantity: number
    unit: string
    prepNote?: string | null
  }>
}

export type InstructionGroupFixture = {
  id?: string | null
  groupLabel?: string | null
  steps: Array<{
    id?: string | null
    description: string
    timerMinutes?: number | null
  }>
}

export type CuisineFixture = {
  id: string
  name: string
  slug: string
  generateSlug?: boolean | null
  createdAt: string
  updatedAt: string
}

export type UnitFixture = {
  id: string
  name: string
  abbreviation: string
  system?: "metric" | "imperial" | null
  type?: "weight" | "volume" | "count" | null
  conversionFactor?: number | null
  createdAt: string
  updatedAt: string
}

let counter = 0

const nextId = (prefix: string): string => {
  counter += 1
  return `${prefix}_${counter.toString().padStart(4, "0")}`
}

export const resetFactoryCounter = (): void => {
  counter = 0
}

const FIXED_DATE = "2025-01-01T00:00:00.000Z"

export const buildUser = (overrides?: Partial<AuthUser>): AuthUser => {
  const id = overrides?.id ?? nextId("user")
  return {
    id,
    name: "Test User",
    email: `${id}@example.com`,
    emailVerified: true,
    image: null,
    createdAt: new Date(FIXED_DATE),
    updatedAt: new Date(FIXED_DATE),
    ...overrides,
  } as AuthUser
}

export const buildCuisine = (
  overrides?: Partial<CuisineFixture>
): CuisineFixture => {
  const id = overrides?.id ?? nextId("cuisine")
  return {
    id,
    name: "Italian",
    slug: "italian",
    generateSlug: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  }
}

export const buildUnit = (overrides?: Partial<UnitFixture>): UnitFixture => {
  const id = overrides?.id ?? nextId("unit")
  return {
    id,
    name: "gram",
    abbreviation: "g",
    system: "metric",
    type: "weight",
    conversionFactor: 1,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  }
}

export const buildIngredientGroup = (
  overrides?: Partial<IngredientGroupFixture>
): IngredientGroupFixture => ({
  id: overrides?.id ?? nextId("group"),
  groupLabel: "Main",
  ingredients: [
    {
      id: nextId("ing"),
      name: "flour",
      quantity: 200,
      unit: "g",
      prepNote: null,
    },
  ],
  ...overrides,
})

export const buildRecipe = (
  overrides?: Partial<RecipeFixture>
): RecipeFixture => {
  const id = overrides?.id ?? nextId("recipe")
  return {
    id,
    title: "Test Recipe",
    slug: `test-recipe-${id}`,
    generateSlug: true,
    description: "A deterministic recipe used in tests.",
    cuisine: null,
    author: "Test Author",
    authorUser: null,
    course: "entrée",
    difficulty: "easy",
    dietaryTags: null,
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    yield: { quantity: 4, unit: "servings" },
    ingredientGroups: [buildIngredientGroup()],
    instructionGroups: [
      {
        id: nextId("instr-group"),
        groupLabel: "Steps",
        steps: [
          {
            id: nextId("step"),
            description: "Mix everything together.",
            timerMinutes: null,
          },
        ],
      },
    ],
    publishedAt: FIXED_DATE,
    _status: "published",
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  }
}
