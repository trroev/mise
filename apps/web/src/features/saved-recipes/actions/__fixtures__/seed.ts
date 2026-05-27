import type { Payload } from "payload"

export type SavedRecipesSeed = {
  readonly userId: string
  readonly recipeId: string
}

export const seedSavedRecipesFixtures = async (
  payload: Payload
): Promise<SavedRecipesSeed> => {
  const user = await payload.create({
    collection: "users",
    data: {
      email: "saved-recipes-tester@example.com",
      name: "Saved Recipes Tester",
    },
    overrideAccess: true,
  })

  const unit = await payload.create({
    collection: "units",
    data: {
      abbreviation: "g",
      conversionFactor: 1,
      name: "Gram",
      system: "metric",
      type: "weight",
    },
    overrideAccess: true,
  })

  const recipe = await payload.create({
    collection: "recipes",
    draft: false,
    data: {
      ingredientGroups: [
        { ingredients: [{ name: "flour", quantity: 200, unit: unit.id }] },
      ],
      instructionGroups: [
        { steps: [{ description: "Mix everything together." }] },
      ],
      slug: "saved-recipes-integration-recipe",
      title: "Saved Recipes Integration Recipe",
    },
    overrideAccess: true,
  })

  return { recipeId: String(recipe.id), userId: String(user.id) }
}
