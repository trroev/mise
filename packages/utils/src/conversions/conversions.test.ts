import { describe, expect, it } from "vitest"
import { convertToUS, formatIngredient, formatQuantity } from "./index"

describe("convertToUS", () => {
  it("converts grams to ounces", () => {
    const result = convertToUS(100, "g")
    expect(result.unit).toBe("oz")
    expect(result.value).toBeCloseTo(3.5274, 3)
  })

  it("converts kilograms to pounds", () => {
    const result = convertToUS(1, "kg")
    expect(result.unit).toBe("lb")
    expect(result.value).toBeCloseTo(2.204_62, 3)
  })

  it("converts small ml to teaspoons", () => {
    const result = convertToUS(5, "ml")
    expect(result.unit).toBe("tsp")
    expect(result.value).toBeCloseTo(1.015, 2)
  })

  it("converts medium ml to tablespoons", () => {
    const result = convertToUS(30, "ml")
    expect(result.unit).toBe("tbsp")
    expect(result.value).toBeCloseTo(2.029, 2)
  })

  it("converts large ml to cups", () => {
    const result = convertToUS(240, "ml")
    expect(result.unit).toBe("cup")
    expect(result.value).toBeCloseTo(1.015, 2)
  })

  it("converts litres to cups", () => {
    const result = convertToUS(1, "l")
    expect(result.unit).toBe("cup")
    expect(result.value).toBeCloseTo(4.226_75, 3)
  })

  it("converts Celsius to Fahrenheit", () => {
    const result = convertToUS(180, "°C")
    expect(result.unit).toBe("°F")
    expect(result.value).toBeCloseTo(356, 0)
  })

  it("converts 0°C to 32°F", () => {
    const result = convertToUS(0, "°C")
    expect(result.unit).toBe("°F")
    expect(result.value).toBe(32)
  })

  it("converts 100°C to 212°F", () => {
    const result = convertToUS(100, "°C")
    expect(result.unit).toBe("°F")
    expect(result.value).toBe(212)
  })
})

describe("formatQuantity", () => {
  it("formats whole numbers", () => {
    expect(formatQuantity(1)).toBe("1")
    expect(formatQuantity(2)).toBe("2")
    expect(formatQuantity(0)).toBe("0")
  })

  it("formats halves", () => {
    expect(formatQuantity(0.5)).toBe("½")
    expect(formatQuantity(1.5)).toBe("1½")
  })

  it("formats thirds", () => {
    expect(formatQuantity(0.333)).toBe("⅓")
    expect(formatQuantity(0.333_333)).toBe("⅓")
    expect(formatQuantity(0.667)).toBe("⅔")
  })

  it("formats quarters", () => {
    expect(formatQuantity(0.25)).toBe("¼")
    expect(formatQuantity(0.75)).toBe("¾")
    expect(formatQuantity(1.25)).toBe("1¼")
  })

  it("formats eighths", () => {
    expect(formatQuantity(0.125)).toBe("⅛")
    expect(formatQuantity(0.375)).toBe("⅜")
    expect(formatQuantity(0.625)).toBe("⅝")
    expect(formatQuantity(0.875)).toBe("⅞")
  })

  it("falls back to decimal for unrecognised fractions", () => {
    expect(formatQuantity(0.1)).toBe("0.1")
    expect(formatQuantity(1.6)).toBe("1.6")
  })
})

describe("formatIngredient", () => {
  it("formats metric quantities", () => {
    expect(formatIngredient(500, "g", "metric")).toBe("500 g")
    expect(formatIngredient(1, "kg", "metric")).toBe("1 kg")
    expect(formatIngredient(250, "ml", "metric")).toBe("250 ml")
    expect(formatIngredient(1, "l", "metric")).toBe("1 L")
    expect(formatIngredient(180, "°C", "metric")).toBe("180 °C")
  })

  it("formats US quantities", () => {
    expect(formatIngredient(240, "ml", "us")).toContain("cup")
    expect(formatIngredient(5, "ml", "us")).toContain("tsp")
    expect(formatIngredient(30, "ml", "us")).toContain("tbsp")
    expect(formatIngredient(180, "°C", "us")).toContain("°F")
  })

  it("uses fraction symbols in US format", () => {
    expect(formatIngredient(118, "ml", "us")).toBe("½ cup")
  })
})
