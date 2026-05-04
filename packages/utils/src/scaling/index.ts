import type { IngredientGroup } from "@mise/types/IngredientGroup"

export function scaleQuantity(
  quantity: number,
  baseYield: number,
  targetYield: number
): number {
  return Math.round(quantity * (targetYield / baseYield) * 100) / 100
}

export function scaleIngredients(
  ingredientGroups: Array<IngredientGroup>,
  baseYield: number,
  targetYield: number
): Array<IngredientGroup> {
  return ingredientGroups.map((group) => ({
    ...group,
    ingredients: group.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: scaleQuantity(ingredient.quantity, baseYield, targetYield),
    })),
  }))
}
