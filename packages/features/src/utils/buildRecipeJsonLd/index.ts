import { COURSE_LABELS } from "@mise/features/utils/recipeLabels"
import { transformCloudinary } from "@mise/features/utils/transformCloudinary"
import type { Recipe } from "@mise/payload/payload-types"
import type { Recipe as RecipeSchema, WithContext } from "schema-dts"
import { match, P } from "ts-pattern"

const DEFAULT_AUTHOR_NAME = "Trevor Mathiak"

const minutesToIso8601 = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return match({ hours, mins })
    .with({ hours: 0 }, () => `PT${mins}M`)
    .with({ mins: 0 }, () => `PT${hours}H`)
    .otherwise(() => `PT${hours}H${mins}M`)
}

const formatIngredient = (
  ingredient: Recipe["ingredientGroups"][number]["ingredients"][number]
): string => {
  const unit = match(ingredient.unit)
    .with({ abbreviation: P.string }, (u) => u)
    .otherwise(() => null)
  const isCount = unit?.type === "count"
  const segments = [
    String(ingredient.quantity),
    !isCount && unit ? unit.abbreviation : null,
    ingredient.name,
  ].filter((s): s is string => Boolean(s))
  const base = segments.join(" ")
  return match(ingredient.prepNote)
    .with(P.string, (note) => `${base}, ${note}`)
    .otherwise(() => base)
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
  const heroUrl = match(recipe.heroImage)
    .with({ url: P.string }, (img) => img.url)
    .otherwise(() => null)

  const image = heroUrl
    ? [
        transformCloudinary({
          url: heroUrl,
          transform: "f_auto,q_auto,c_fill,g_auto,ar_1:1,w_1200",
        }),
        transformCloudinary({
          url: heroUrl,
          transform: "f_auto,q_auto,c_fill,g_auto,ar_4:3,w_1200",
        }),
        transformCloudinary({
          url: heroUrl,
          transform: "f_auto,q_auto,c_fill,g_auto,ar_16:9,w_1200",
        }),
      ]
    : undefined

  const cuisineName = match(recipe.cuisine)
    .with({ name: P.string }, (c) => c.name)
    .otherwise(() => undefined)

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

  const yieldString = match(recipe.yield)
    .with(
      { quantity: P.number, unit: P.string },
      ({ quantity, unit }) => `${quantity} ${unit}`
    )
    .with({ quantity: P.number }, ({ quantity }) => String(quantity))
    .otherwise(() => undefined)

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
    prepTime: match(recipe.prepTime)
      .with(P.number, minutesToIso8601)
      .otherwise(() => undefined),
    cookTime: match(recipe.cookTime)
      .with(P.number, minutesToIso8601)
      .otherwise(() => undefined),
    totalTime: match(recipe.totalTime)
      .with(P.number, minutesToIso8601)
      .otherwise(() => undefined),
    recipeYield: yieldString,
    recipeCategory: match(recipe.course)
      .with(P.not(P.nullish), (course) => COURSE_LABELS[course])
      .otherwise(() => undefined),
    recipeCuisine: cuisineName,
    recipeIngredient,
    recipeInstructions,
  }
}
