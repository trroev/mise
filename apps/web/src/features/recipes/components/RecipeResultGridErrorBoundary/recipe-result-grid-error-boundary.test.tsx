// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@mise/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

const { RecipeResultGridErrorBoundary } = await import(
  "./recipe-result-grid-error-boundary"
)

const Boom = () => {
  throw new Error("boom")
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("RecipeResultGridErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    renderWithProviders(
      <RecipeResultGridErrorBoundary>
        <p>result grid</p>
      </RecipeResultGridErrorBoundary>
    )

    expect(screen.getByText("result grid")).toBeInTheDocument()
  })

  it("renders the recipes fallback copy on error", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    renderWithProviders(
      <RecipeResultGridErrorBoundary>
        <Boom />
      </RecipeResultGridErrorBoundary>
    )

    expect(screen.getByText("Couldn't load recipes")).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
