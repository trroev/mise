import { describe, expect, it } from "vitest"
import { scaleIngredients, scaleQuantity } from "./index"

describe("scaleQuantity", () => {
  it("scales by ×2", () => {
    expect(scaleQuantity(100, 4, 8)).toBe(200)
  })

  it("scales by ×0.5", () => {
    expect(scaleQuantity(100, 4, 2)).toBe(50)
  })

  it("scales by ×3", () => {
    expect(scaleQuantity(50, 4, 12)).toBe(150)
  })

  it("returns identical value when scaling by 1", () => {
    expect(scaleQuantity(75, 4, 4)).toBe(75)
  })

  it("rounds to 2 decimal places", () => {
    expect(scaleQuantity(100, 3, 1)).toBe(33.33)
  })

  it("handles fractional yields", () => {
    expect(scaleQuantity(240, 8, 3)).toBe(90)
  })
})

describe("scaleIngredients", () => {
  const groups = [
    {
      groupLabel: "For the dough",
      ingredients: [
        { name: "flour", quantity: 500, unit: "g" },
        { name: "water", quantity: 300, unit: "ml" },
      ],
    },
    {
      groupLabel: "For the sauce",
      ingredients: [{ name: "tomatoes", quantity: 400, unit: "g" }],
    },
  ]

  it("scales all ingredient quantities across all groups", () => {
    const [dough, sauce] = scaleIngredients(groups, 4, 8)
    const [flour, water] = dough?.ingredients ?? []
    const [tomatoes] = sauce?.ingredients ?? []
    expect(flour?.quantity).toBe(1000)
    expect(water?.quantity).toBe(600)
    expect(tomatoes?.quantity).toBe(800)
  })

  it("returns identical quantities when scaling by 1", () => {
    const [dough, sauce] = scaleIngredients(groups, 4, 4)
    const [flour, water] = dough?.ingredients ?? []
    const [tomatoes] = sauce?.ingredients ?? []
    expect(flour?.quantity).toBe(500)
    expect(water?.quantity).toBe(300)
    expect(tomatoes?.quantity).toBe(400)
  })

  it("preserves all non-quantity fields", () => {
    const [dough, sauce] = scaleIngredients(groups, 4, 8)
    const [flour] = dough?.ingredients ?? []
    expect(dough?.groupLabel).toBe("For the dough")
    expect(flour?.name).toBe("flour")
    expect(flour?.unit).toBe("g")
    expect(sauce?.groupLabel).toBe("For the sauce")
  })

  it("scales by ×0.5", () => {
    const [dough] = scaleIngredients(groups, 4, 2)
    const [flour, water] = dough?.ingredients ?? []
    expect(flour?.quantity).toBe(250)
    expect(water?.quantity).toBe(150)
  })

  it("rounds quantities to 2 decimal places", () => {
    const [dough] = scaleIngredients(groups, 3, 1)
    const [flour] = dough?.ingredients ?? []
    expect(flour?.quantity).toBe(166.67)
  })
})
