import type { Payload } from "payload"

export type CollectionsSeed = {
  readonly userId: string
  readonly recipeId: string
}

export const seedCollectionsFixtures = async (
  payload: Payload
): Promise<CollectionsSeed> => {
  const user = await payload.create({
    collection: "users",
    data: {
      email: "collections-tester@example.com",
      name: "Collections Tester",
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
      slug: "collections-integration-recipe",
      title: "Collections Integration Recipe",
    },
    overrideAccess: true,
  })

  return { recipeId: String(recipe.id), userId: String(user.id) }
}
