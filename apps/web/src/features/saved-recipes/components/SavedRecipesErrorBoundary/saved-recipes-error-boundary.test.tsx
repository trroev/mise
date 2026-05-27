// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@mise/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

const { SavedRecipesErrorBoundary } = await import(
  "./saved-recipes-error-boundary"
)

const Boom = () => {
  throw new Error("boom")
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("SavedRecipesErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    renderWithProviders(
      <SavedRecipesErrorBoundary>
        <p>saved recipes</p>
      </SavedRecipesErrorBoundary>
    )

    expect(screen.getByText("saved recipes")).toBeInTheDocument()
  })

  it("renders the saved-recipes fallback copy on error", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    renderWithProviders(
      <SavedRecipesErrorBoundary>
        <Boom />
      </SavedRecipesErrorBoundary>
    )

    expect(screen.getByText("Couldn't load saved recipes")).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
