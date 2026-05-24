// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { userEvent } from "@mise/testing/render"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { ChecklistStorageKey } from "~/features/recipes/hooks/use-checklist-state"
import { IngredientChecklist } from "./ingredient-checklist"

const KEY: ChecklistStorageKey = "checklist:pasta:4:metric"
const TOMATO_RE = /tomato/i
const RESET_RE = /reset checklist/i

const groups = [
  {
    id: "g1",
    groupLabel: "For the sauce",
    ingredients: [
      { id: "i1", quantityLabel: "200 g", name: "tomato", prepNote: "diced" },
      { id: "i2", quantityLabel: "2", name: "garlic", prepNote: null },
    ],
  },
]

describe("IngredientChecklist", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it("renders each ingredient as a button with aria-pressed", () => {
    render(<IngredientChecklist groups={groups} storageKey={KEY} />)
    const pressables = screen
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-pressed"))
    expect(pressables).toHaveLength(2)
    for (const btn of pressables) {
      expect(btn).toHaveAttribute("aria-pressed", "false")
    }
  })

  it("reset button is hidden (no layout shift) until something is checked", () => {
    render(<IngredientChecklist groups={groups} storageKey={KEY} />)
    const reset = screen.getByText(RESET_RE)
    expect(reset).toHaveAttribute("aria-hidden", "true")
    expect(reset).toHaveClass("opacity-0")
  })

  it("toggles a row and shows the reset button after a check", async () => {
    const user = userEvent.setup()
    render(<IngredientChecklist groups={groups} storageKey={KEY} />)

    const tomato = screen.getByRole("button", { name: TOMATO_RE })
    await user.click(tomato)
    expect(tomato).toHaveAttribute("aria-pressed", "true")

    const reset = screen.getByRole("button", { name: RESET_RE })
    expect(reset).toBeInTheDocument()
  })

  it("reset button clears all checks and disappears", async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(KEY, JSON.stringify(["i1", "i2"]))
    render(<IngredientChecklist groups={groups} storageKey={KEY} />)

    expect(screen.getByRole("button", { name: TOMATO_RE })).toHaveAttribute(
      "aria-pressed",
      "true"
    )

    await user.click(screen.getByRole("button", { name: RESET_RE }))

    expect(screen.getByRole("button", { name: TOMATO_RE })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    const reset = screen.getByText(RESET_RE)
    expect(reset).toHaveAttribute("aria-hidden", "true")
    expect(reset).toHaveClass("opacity-0")
  })
})
