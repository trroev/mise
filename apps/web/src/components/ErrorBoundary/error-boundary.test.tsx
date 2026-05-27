// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@mise/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(),
}))

vi.mock("@sentry/nextjs", () => ({ captureException }))

const { ErrorBoundary } = await import("./error-boundary")

const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("kaboom")
  }
  return <p>safe content</p>
}

const TRY_AGAIN = /try again/i

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("ErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    renderWithProviders(
      <ErrorBoundary feature="test">
        <p>safe content</p>
      </ErrorBoundary>
    )

    expect(screen.getByText("safe content")).toBeInTheDocument()
    expect(captureException).not.toHaveBeenCalled()
  })

  it("renders the fallback and captures the error with feature context", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    renderWithProviders(
      <ErrorBoundary
        description="custom description"
        feature="recipes:result-grid"
        title="custom title"
      >
        <Boom shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText("custom title")).toBeInTheDocument()
    expect(screen.getByText("custom description")).toBeInTheDocument()
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "kaboom" }),
      expect.objectContaining({
        tags: { feature: "recipes:result-grid" },
      })
    )

    consoleErrorSpy.mockRestore()
  })

  it("restores the region when the reset control is pressed", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const user = userEvent.setup()

    const { rerender } = renderWithProviders(
      <ErrorBoundary feature="test">
        <Boom shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole("alert")).toBeInTheDocument()

    // Stop throwing so the retry can succeed without a full reload.
    rerender(
      <ErrorBoundary feature="test">
        <Boom shouldThrow={false} />
      </ErrorBoundary>
    )
    await user.click(screen.getByRole("button", { name: TRY_AGAIN }))

    expect(screen.getByText("safe content")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
