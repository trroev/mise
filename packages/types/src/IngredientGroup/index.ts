export type IngredientItem = {
  name: string
  quantity: number
  unit: string
  prepNote?: string | null
  id?: string | null
}

export type IngredientGroup = {
  groupLabel?: string | null
  ingredients: Array<IngredientItem>
  id?: string | null
}
