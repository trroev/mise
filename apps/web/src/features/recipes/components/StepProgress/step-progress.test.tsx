// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { userEvent } from "@mise/testing/render"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { StepProgressStorageKey } from "~/features/recipes/hooks/use-checklist-state"
import { StepProgress } from "./step-progress"

const KEY: StepProgressStorageKey = "step-progress:pasta"
const RESET_RE = /reset progress/i
const STEP_BUTTON_RE = /boil water|salt the water|drain pasta/i
const BOIL_RE = /boil water/i

const groups = [
  {
    id: "g1",
    groupLabel: "Cook the pasta",
    steps: [
      { id: "s1", description: "Boil water" },
      { id: "s2", description: "Salt the water", timerMinutes: 2 },
    ],
  },
  {
    id: "g2",
    groupLabel: null,
    steps: [{ id: "s3", description: "Drain pasta" }],
  },
]

describe("StepProgress", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it("renders each step as a button with aria-pressed", () => {
    render(<StepProgress groups={groups} storageKey={KEY} />)
    const pressables = screen
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-pressed"))
    expect(pressables).toHaveLength(3)
    for (const btn of pressables) {
      expect(btn).toHaveAttribute("aria-pressed", "false")
    }
  })

  it("indicator reflects 0 / total before any toggle", () => {
    render(<StepProgress groups={groups} storageKey={KEY} />)
    expect(screen.getByText("0 / 3 steps")).toBeInTheDocument()
  })

  it("reset button is hidden until a step is checked", () => {
    render(<StepProgress groups={groups} storageKey={KEY} />)
    const reset = screen.getByText(RESET_RE)
    expect(reset).toHaveAttribute("aria-hidden", "true")
    expect(reset).toHaveClass("opacity-0")
  })

  it("toggling a step updates aria-pressed and indicator", async () => {
    const user = userEvent.setup()
    render(<StepProgress groups={groups} storageKey={KEY} />)

    const boil = screen.getByRole("button", { name: BOIL_RE })
    await user.click(boil)

    expect(boil).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("1 / 3 steps")).toBeInTheDocument()
  })

  it("restores progress from localStorage on mount (no flash)", () => {
    window.localStorage.setItem(KEY, JSON.stringify(["s1", "s3"]))
    render(<StepProgress groups={groups} storageKey={KEY} />)
    const buttons = screen.getAllByRole("button", { name: STEP_BUTTON_RE })
    const byName = Object.fromEntries(
      buttons.map((b) => [b.textContent?.trim() ?? "", b])
    )
    expect(byName["1Boil water"]).toHaveAttribute("aria-pressed", "true")
    expect(byName["2Salt the water2 min"]).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(byName["1Drain pasta"]).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("2 / 3 steps")).toBeInTheDocument()
  })

  it("reset button clears all progress and disappears", async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(KEY, JSON.stringify(["s1", "s2", "s3"]))
    render(<StepProgress groups={groups} storageKey={KEY} />)

    expect(screen.getByText("3 / 3 steps")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: RESET_RE }))

    expect(screen.getByText("0 / 3 steps")).toBeInTheDocument()
    const reset = screen.getByText(RESET_RE)
    expect(reset).toHaveAttribute("aria-hidden", "true")
  })
})
