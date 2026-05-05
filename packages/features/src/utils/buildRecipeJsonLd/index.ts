import { COURSE_LABELS } from "@mise/features/utils/recipeLabels"
import type { Recipe } from "@mise/payload/payload-types"
import type { Recipe as RecipeSchema, WithContext } from "schema-dts"

const DEFAULT_AUTHOR_NAME = "Trevor Mathiak"

const CLOUDINARY_UPLOAD_RE = /\/image\/upload\//

const transformCloudinary = (url: string, transform: string): string =>
  CLOUDINARY_UPLOAD_RE.test(url)
    ? url.replace(CLOUDINARY_UPLOAD_RE, `/image/upload/${transform}/`)
    : url

const minutesToIso8601 = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return `PT${mins}M`
  }
  if (mins === 0) {
    return `PT${hours}H`
  }
  return `PT${hours}H${mins}M`
}

const formatIngredient = (
  ingredient: Recipe["ingredientGroups"][number]["ingredients"][number]
): string => {
  const unit = typeof ingredient.unit === "object" ? ingredient.unit : null
  const isCount = unit?.type === "count"
  const segments = [
    String(ingredient.quantity),
    !isCount && unit ? unit.abbreviation : null,
    ingredient.name,
  ].filter((s): s is string => Boolean(s))
  const base = segments.join(" ")
  return ingredient.prepNote ? `${base}, ${ingredient.prepNote}` : base
}

const SENTENCE_SPLIT_RE = /(?<=[.!?])\s/

const truncateForName = (text: string, maxLength = 80): string => {
  const firstSentence = text.split(SENTENCE_SPLIT_RE)[0] ?? text
  if (firstSentence.length <= maxLength) {
    return firstSentence
  }
  return `${firstSentence.slice(0, maxLength - 1).trimEnd()}…`
}

export const buildRecipeJsonLd = (
  recipe: Recipe
): WithContext<RecipeSchema> => {
  const heroUrl =
    recipe.heroImage && typeof recipe.heroImage === "object"
      ? (recipe.heroImage.url ?? null)
      : null

  const image = heroUrl
    ? [
        transformCloudinary(heroUrl, "c_fill,g_auto,ar_1:1,w_1200"),
        transformCloudinary(heroUrl, "c_fill,g_auto,ar_4:3,w_1200"),
        transformCloudinary(heroUrl, "c_fill,g_auto,ar_16:9,w_1200"),
      ]
    : undefined

  const cuisineName =
    recipe.cuisine && typeof recipe.cuisine === "object"
      ? recipe.cuisine.name
      : undefined

  const recipeIngredient = recipe.ingredientGroups.flatMap((group) =>
    group.ingredients.map(formatIngredient)
  )

  const recipeInstructions = recipe.instructionGroups.flatMap((group) =>
    group.steps.map(
      (step) =>
        ({
          "@type": "HowToStep",
          name: truncateForName(step.description),
          text: step.description,
        }) as const
    )
  )

  const yieldQuantity = recipe.yield?.quantity
  const yieldUnit = recipe.yield?.unit
  let yieldString: string | undefined
  if (yieldQuantity != null) {
    yieldString = yieldUnit
      ? `${yieldQuantity} ${yieldUnit}`
      : String(yieldQuantity)
  }

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description ?? undefined,
    image,
    author: {
      "@type": "Person",
      name: recipe.author?.trim() || DEFAULT_AUTHOR_NAME,
    },
    datePublished: recipe.publishedAt ?? undefined,
    prepTime:
      recipe.prepTime == null ? undefined : minutesToIso8601(recipe.prepTime),
    cookTime:
      recipe.cookTime == null ? undefined : minutesToIso8601(recipe.cookTime),
    totalTime:
      recipe.totalTime == null ? undefined : minutesToIso8601(recipe.totalTime),
    recipeYield: yieldString,
    recipeCategory: recipe.course ? COURSE_LABELS[recipe.course] : undefined,
    recipeCuisine: cuisineName,
    recipeIngredient,
    recipeInstructions,
  }
}
