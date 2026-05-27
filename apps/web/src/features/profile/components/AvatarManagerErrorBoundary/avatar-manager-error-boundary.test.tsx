// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders } from "@mise/testing/render"
import { cleanup, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }))

const { AvatarManagerErrorBoundary } = await import(
  "./avatar-manager-error-boundary"
)

const Boom = () => {
  throw new Error("boom")
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AvatarManagerErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    renderWithProviders(
      <AvatarManagerErrorBoundary>
        <p>avatar manager</p>
      </AvatarManagerErrorBoundary>
    )

    expect(screen.getByText("avatar manager")).toBeInTheDocument()
  })

  it("renders the avatar fallback copy on error", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    renderWithProviders(
      <AvatarManagerErrorBoundary>
        <Boom />
      </AvatarManagerErrorBoundary>
    )

    expect(
      screen.getByText("Couldn't load avatar settings")
    ).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
