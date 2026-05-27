// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@mise/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

const { CollectionsErrorBoundary } = await import(
  "./collections-error-boundary"
)

const Boom = () => {
  throw new Error("boom")
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("CollectionsErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    renderWithProviders(
      <CollectionsErrorBoundary>
        <p>collections</p>
      </CollectionsErrorBoundary>
    )

    expect(screen.getByText("collections")).toBeInTheDocument()
  })

  it("renders the collections fallback copy on error", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    renderWithProviders(
      <CollectionsErrorBoundary>
        <Boom />
      </CollectionsErrorBoundary>
    )

    expect(screen.getByText("Couldn't load collections")).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
