// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@mise/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

const { RecipeSubmissionFormErrorBoundary } = await import(
  "./recipe-submission-form-error-boundary"
)

const Boom = () => {
  throw new Error("boom")
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("RecipeSubmissionFormErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    renderWithProviders(
      <RecipeSubmissionFormErrorBoundary>
        <p>submission form</p>
      </RecipeSubmissionFormErrorBoundary>
    )

    expect(screen.getByText("submission form")).toBeInTheDocument()
  })

  it("renders the submission-form fallback copy on error", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    renderWithProviders(
      <RecipeSubmissionFormErrorBoundary>
        <Boom />
      </RecipeSubmissionFormErrorBoundary>
    )

    expect(
      screen.getByText("Couldn't load the submission form")
    ).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
